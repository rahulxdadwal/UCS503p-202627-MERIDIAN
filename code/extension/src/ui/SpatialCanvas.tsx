import { useEffect, useRef, useState, useCallback } from 'react';
import type { CanvasItem } from '../shared/contracts';

interface SpatialCanvasProps {
  items: CanvasItem[];
  onItemMove: (id: string, pos: { x: number; y: number }) => void;
  onItemPin: (item: CanvasItem) => void;
  onItemSelect: (item: CanvasItem) => void;
  onReorganize: () => void;
  isReorganizing?: boolean;
}

export function SpatialCanvas({
  items,
  onItemMove,
  onItemPin,
  onItemSelect,
  onReorganize,
  isReorganizing = false,
}: SpatialCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Viewport transformation state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Interaction tracking refs
  const isDraggingCanvas = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const draggedItemId = useRef<string | null>(null);
  const dragCardOffset = useRef({ x: 0, y: 0 });

  const CARD_WIDTH = 220;
  const CARD_HEIGHT = 110;

  // Screen to Canvas coordinate conversion
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - pan.x) / zoom,
      y: (screenY - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Main 60 FPS Render Loop with Viewport Culling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Save context for viewport transform
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // 1. Draw Infinite Spatial Grid
      const gridSize = 80;
      const startX = Math.floor((-pan.x / zoom) / gridSize) * gridSize - gridSize;
      const endX = startX + (width / zoom) + gridSize * 2;
      const startY = Math.floor((-pan.y / zoom) / gridSize) * gridSize - gridSize;
      const endY = startY + (height / zoom) + gridSize * 2;

      ctx.strokeStyle = '#e5ece7';
      ctx.lineWidth = 1 / zoom;
      ctx.beginPath();
      for (let x = startX; x <= endX; x += gridSize) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
      }
      ctx.stroke();

      // 2. Viewport Culling Bounds
      const viewLeft = -pan.x / zoom;
      const viewTop = -pan.y / zoom;
      const viewRight = viewLeft + width / zoom;
      const viewBottom = viewTop + height / zoom;

      // 3. Render Items
      for (const item of items) {
        const x = item.position.x;
        const y = item.position.y;

        // Viewport Culling: Skip if card is off-screen
        if (x + CARD_WIDTH < viewLeft || x > viewRight || y + CARD_HEIGHT < viewTop || y > viewBottom) {
          continue;
        }

        // Card Shadow & Container
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 30, 20, 0.08)';
        ctx.shadowBlur = 10 / zoom;
        ctx.shadowOffsetY = 4 / zoom;

        // Rounded Rect
        const radius = 8;
        ctx.beginPath();
        ctx.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, radius);
        ctx.fill();

        // Card Border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = item.pinned ? '#b28c27' : '#cde0d5';
        ctx.lineWidth = (item.pinned ? 2 : 1) / zoom;
        ctx.stroke();

        // Header Accent Bar
        ctx.fillStyle = item.sourceType === 'pdf' ? '#e63946' : item.sourceType === 'markdown' ? '#2d6a4f' : '#1d3557';
        ctx.beginPath();
        ctx.roundRect(x, y, CARD_WIDTH, 5 / zoom, [radius, radius, 0, 0]);
        ctx.fill();

        // Card Text & Badges
        ctx.fillStyle = '#172a29';
        ctx.font = `bold 13px system-ui, sans-serif`;
        const titleText = item.title.length > 24 ? item.title.slice(0, 24) + '…' : item.title;
        ctx.fillText(titleText, x + 12, y + 26);

        // Type Tag & Coordinates
        ctx.font = `10px system-ui, sans-serif`;
        ctx.fillStyle = '#51635e';
        ctx.fillText(`${item.sourceType.toUpperCase()} · (${Math.round(x)}, ${Math.round(y)})`, x + 12, y + 44);

        if (item.pinned) {
          ctx.fillStyle = '#b28c27';
          ctx.fillText('📌 Pinned', x + CARD_WIDTH - 60, y + 26);
        }

        // Excerpt snippet
        ctx.fillStyle = '#3a4a45';
        ctx.font = `11px system-ui, sans-serif`;
        const words = item.excerpt.split(' ').slice(0, 10).join(' ') + '…';
        ctx.fillText(words, x + 12, y + 68, CARD_WIDTH - 24);

        // Action hint footer
        ctx.font = `italic 9px system-ui, sans-serif`;
        ctx.fillStyle = '#82958d';
        ctx.fillText('Click to inspect passages', x + 12, y + 96);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [items, pan, zoom]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 540;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { x, y } = screenToCanvas(screenX, screenY);

    // Check if clicked inside a card (top-most first)
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (
        x >= item.position.x &&
        x <= item.position.x + CARD_WIDTH &&
        y >= item.position.y &&
        y <= item.position.y + CARD_HEIGHT
      ) {
        // Clicked pin toggle area?
        if (x >= item.position.x + CARD_WIDTH - 60 && y <= item.position.y + 35) {
          onItemPin(item);
          return;
        }

        // Dragging Card
        draggedItemId.current = item.id;
        dragCardOffset.current = {
          x: x - item.position.x,
          y: y - item.position.y,
        };
        return;
      }
    }

    // Otherwise drag entire canvas
    isDraggingCanvas.current = true;
    dragStart.current = { x: screenX - pan.x, y: screenY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (draggedItemId.current) {
      const { x, y } = screenToCanvas(screenX, screenY);
      const newPos = {
        x: Math.round(x - dragCardOffset.current.x),
        y: Math.round(y - dragCardOffset.current.y),
      };
      onItemMove(draggedItemId.current, newPos);
      return;
    }

    if (isDraggingCanvas.current) {
      setPan({
        x: screenX - dragStart.current.x,
        y: screenY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggedItemId.current) {
      draggedItemId.current = null;
      return;
    }

    // If mouseup occurred without dragging canvas, consider it a selection click
    if (isDraggingCanvas.current) {
      isDraggingCanvas.current = false;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const { x, y } = screenToCanvas(screenX, screenY);

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (
        x >= item.position.x &&
        x <= item.position.x + CARD_WIDTH &&
        y >= item.position.y &&
        y <= item.position.y + CARD_HEIGHT
      ) {
        onItemSelect(item);
        return;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.2, Math.min(3.0, zoom * zoomFactor));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setPan({
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
    });
    setZoom(newZoom);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 40, y: 40 });
  };

  const zoomToFit = () => {
    if (items.length === 0) return resetView();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const it of items) {
      minX = Math.min(minX, it.position.x);
      minY = Math.min(minY, it.position.y);
      maxX = Math.max(maxX, it.position.x + CARD_WIDTH);
      maxY = Math.max(maxY, it.position.y + CARD_HEIGHT);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const padding = 60;
    const w = maxX - minX + padding * 2;
    const h = maxY - minY + padding * 2;
    const scale = Math.min(canvas.width / w, canvas.height / h, 1.2);
    setZoom(scale);
    setPan({
      x: (canvas.width - w * scale) / 2 - minX * scale + padding * scale,
      y: (canvas.height - h * scale) / 2 - minY * scale + padding * scale,
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #d4ded6' }}>
      <canvas
        ref={canvasRef}
        height={540}
        style={{ width: '100%', height: '540px', background: '#f8faf8', cursor: 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Floating Canvas Controls */}
      <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.92)', padding: '6px 10px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <button className="secondary" style={{ padding: '6px 12px' }} onClick={() => setZoom((z) => Math.min(3, z * 1.15))}>➕</button>
        <button className="secondary" style={{ padding: '6px 12px' }} onClick={() => setZoom((z) => Math.max(0.2, z * 0.85))}>➖</button>
        <button className="secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={zoomToFit}>Zoom to Fit</button>
        <button className="secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={resetView}>Reset View</button>
      </div>

      <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
        <button onClick={onReorganize} disabled={isReorganizing || items.length === 0}>
          {isReorganizing ? '⚡ Solving UMAP Clusters…' : '🧭 Reorganize Map (UMAP)'}
        </button>
      </div>
    </div>
  );
}
