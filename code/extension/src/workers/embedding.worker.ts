/// <reference lib="webworker" />
import { env, pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';
import {
  EMBEDDING_DIMENSIONS, EMBEDDING_MODEL, MAX_INPUT_CHARACTERS,
  type EmbeddingRequest, type EmbeddingResponse,
} from '../shared/contracts';

const scope = self as unknown as DedicatedWorkerGlobalScope;
const origin = new URL(scope.location.href).origin;
const localUrl = (path: string) => new URL(path, scope.location.href).href;

// Defense in depth: never fetch anything outside this installed extension.
const nativeFetch = scope.fetch.bind(scope);
scope.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input), scope.location.href);
  if (url.origin !== origin) {
    return Promise.reject(new Error(`External request blocked: ${url.origin}`));
  }
  return nativeFetch(input, init);
};
env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = localUrl('/models/');
// Load the actual packaged files even on a fresh install. No warm HTTP cache required.
env.useBrowserCache = false;
env.useFSCache = false;
if (!env.backends.onnx.wasm) throw new Error('WASM backend is unavailable.');
env.backends.onnx.wasm.wasmPaths = localUrl('/wasm/');
env.backends.onnx.wasm.numThreads = 1;
env.backends.onnx.wasm.proxy = false;

let extractor: Promise<FeatureExtractionPipeline> | undefined;
function getExtractor(): Promise<FeatureExtractionPipeline> {
  // Retry initialization after a missing/corrupt asset has been repaired and reloaded.
  extractor ??= pipeline('feature-extraction', EMBEDDING_MODEL, {
    device: 'wasm', dtype: 'q8', local_files_only: true,
  }).catch((error: unknown) => { extractor = undefined; throw error; });
  return extractor;
}
const send = (message: EmbeddingResponse) => scope.postMessage(message);

async function embed(request: EmbeddingRequest) {
  try {
    if (request.type !== 'embed' || typeof request.text !== 'string' || !request.text.trim()) {
      throw new Error('Enter non-empty text to embed.');
    }
    if (request.text.length > MAX_INPUT_CHARACTERS) {
      throw new Error(`Text must be at most ${MAX_INPUT_CHARACTERS} characters. Deep chunking comes in Milestone 4.`);
    }
    const start = performance.now();
    send({ type: 'progress', id: request.id, message: 'Loading packaged model and WASM runtime…' });
    const model = await getExtractor();
    send({ type: 'progress', id: request.id, message: 'Generating embedding on this device…' });
    const output = await model(request.text.trim(), { pooling: 'mean', normalize: true });
    const vector = Float32Array.from(output.data as Float32Array);
    if (vector.length !== EMBEDDING_DIMENSIONS || !vector.every(Number.isFinite)) {
      throw new Error('The model returned an invalid embedding.');
    }
    const response: EmbeddingResponse = {
      type: 'result', id: request.id,
      result: { model: EMBEDDING_MODEL, dimensions: EMBEDDING_DIMENSIONS,
        backend: 'wasm', vector, elapsedMs: performance.now() - start },
    };
    scope.postMessage(response, [vector.buffer]);
  } catch (error) {
    send({ type: 'error', id: request.id,
      message: error instanceof Error ? error.message : String(error) });
  }
}
// Serialize inference so multiple consumers cannot concurrently exhaust the WASM session.
let queue = Promise.resolve();
scope.onmessage = ({ data }: MessageEvent<EmbeddingRequest>) => {
  queue = queue.then(() => embed(data));
};
