/// <reference lib="webworker" />
import { compute2DSpatialLayout, type LayoutItemInput, type LayoutOptions } from '../layout/umap';

const scope = self as unknown as DedicatedWorkerGlobalScope;

export interface LayoutWorkerRequest {
  id: string;
  items: Array<{
    id: string;
    vector: number[] | Float32Array;
    pinned?: boolean;
    position?: { x: number; y: number };
  }>;
  options?: LayoutOptions;
}

export interface LayoutWorkerResponse {
  id: string;
  positions: Record<string, { x: number; y: number }>;
  elapsedMs: number;
}

scope.onmessage = (event: MessageEvent<LayoutWorkerRequest>) => {
  const { id, items, options } = event.data;
  const start = performance.now();

  const formattedItems: LayoutItemInput[] = items.map((it) => ({
    id: it.id,
    vector: it.vector instanceof Float32Array ? it.vector : new Float32Array(it.vector),
    pinned: it.pinned,
    position: it.position,
  }));

  const positionMap = compute2DSpatialLayout(formattedItems, options);

  const positions: Record<string, { x: number; y: number }> = {};
  for (const [itemId, pos] of positionMap.entries()) {
    positions[itemId] = pos;
  }

  const response: LayoutWorkerResponse = {
    id,
    positions,
    elapsedMs: performance.now() - start,
  };

  scope.postMessage(response);
};
