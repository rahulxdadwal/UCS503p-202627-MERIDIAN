import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { EmbeddingClient } from '../workers/embedding-client';
import { MAX_INPUT_CHARACTERS, type EmbeddingResult } from '../shared/contracts';
import './styles.css';

function App() {
  const client = useRef<EmbeddingClient | null>(null);
  const [text, setText] = useState('Meridian organizes research into a private, searchable knowledge map.');
  const [status, setStatus] = useState('Ready to load the packaged model.');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<EmbeddingResult | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const instance = new EmbeddingClient();
    client.current = instance;
    return () => { instance.dispose(); client.current = null; };
  }, []);

  async function run() {
    if (!client.current) return;
    setBusy(true); setError(''); setResult(null);
    try {
      setResult(await client.current.embed(text, setStatus));
      setStatus('Embedding generated locally.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setStatus('Embedding could not be generated.');
    } finally { setBusy(false); }
  }

  return <main>
    <p className="eyebrow">MERIDIAN / MILESTONE 1</p>
    <h1>A local foundation for your research.</h1>
    <p className="intro">Generate a real semantic embedding with the model packaged inside this extension.</p>
    <section aria-labelledby="diagnostic-title">
      <h2 id="diagnostic-title">Embedding diagnostic</h2>
      <p>MiniLM · 384 dimensions · WASM CPU · External model loading disabled</p>
      <label htmlFor="text">Text to embed</label>
      <textarea id="text" rows={4} maxLength={MAX_INPUT_CHARACTERS} value={text}
        onChange={(event) => setText(event.target.value)} disabled={busy} />
      <p className="hint">Short text only in this milestone. Long inputs may be truncated by the model; document chunking comes later.</p>
      <button onClick={() => void run()} disabled={busy || !text.trim()}>
        {busy ? 'Generating…' : 'Generate embedding'}
      </button>
      <p role="status">{status}</p>
      {error && <p role="alert">{error} Run <code>npm run assets:prepare</code>, rebuild, and reload the extension if assets are missing.</p>}
      {result && <div data-testid="embedding-result">
        <dl>
          <div><dt>Dimensions</dt><dd data-testid="dimensions">{result.dimensions}</dd></div>
          <div><dt>Backend</dt><dd>{result.backend}</dd></div>
          <div><dt>Elapsed</dt><dd>{result.elapsedMs.toFixed(1)} ms</dd></div>
          <div><dt>Vector norm</dt><dd>{Math.hypot(...result.vector).toFixed(6)}</dd></div>
        </dl>
        <details><summary>Inspect all vector values</summary>
          <pre data-testid="vector">{JSON.stringify(Array.from(result.vector), null, 2)}</pre>
        </details>
      </div>}
    </section>
    <p className="hint">Foundation preview. Capture, persistence, search and the spatial canvas are upcoming milestones. First-run timing includes model initialization.</p>
  </main>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
