import { useEffect, useState } from 'react';
import type { CanvasItem, DocumentChunk, ExtractedDocument } from '../shared/contracts';
import { db } from '../storage/db';

interface PassageInspectorProps {
  item: CanvasItem;
  onClose: () => void;
  onTogglePin: (item: CanvasItem) => void;
  onDelete: (id: string) => void;
}

export function PassageInspector({ item, onClose, onTogglePin, onDelete }: PassageInspectorProps) {
  const [doc, setDoc] = useState<ExtractedDocument | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [activeTab, setActiveTab] = useState<'blocks' | 'chunks'>('blocks');

  useEffect(() => {
    let active = true;
    void (async () => {
      const documentRecord = await db.getDocument(item.id);
      const chunkRecords = await db.getChunksByDocumentId(item.id);
      if (active) {
        setDoc(documentRecord ?? null);
        setChunks(chunkRecords);
      }
    })();
    return () => { active = false; };
  }, [item.id]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: 'min(580px, 90vw)',
      height: '100vh',
      background: '#ffffff',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span className="type-tag">{item.sourceType}</span>
          <h2 style={{ margin: '6px 0 2px', fontSize: '20px' }}>{item.title}</h2>
          {item.sourceUrl && (
            <p className="hint" style={{ margin: 0 }}>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceUrl}</a>
            </p>
          )}
        </div>
        <button className="secondary" style={{ padding: '4px 10px', fontSize: '18px' }} onClick={onClose}>×</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button className="secondary" onClick={() => onTogglePin(item)}>
          {item.pinned ? '📌 Unpin Card' : '📌 Pin Card'}
        </button>
        <button className="danger" onClick={() => { onDelete(item.id); onClose(); }}>
          Delete Document
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e9ecef', paddingBottom: '8px', marginBottom: '16px' }}>
        <button
          className={`tab-btn ${activeTab === 'blocks' ? 'active' : ''}`}
          style={{ padding: '4px 12px', fontSize: '13px' }}
          onClick={() => setActiveTab('blocks')}
        >
          Structured Blocks ({doc?.blocks.length ?? 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'chunks' ? 'active' : ''}`}
          style={{ padding: '4px 12px', fontSize: '13px' }}
          onClick={() => setActiveTab('chunks')}
        >
          Deep Focus Chunks ({chunks.length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
        {activeTab === 'blocks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {doc?.blocks.map((b, idx) => (
              <div key={idx} style={{
                padding: '10px 14px',
                background: b.kind === 'heading' ? '#eef5f1' : b.kind === 'code' ? '#f8f9fa' : '#ffffff',
                border: '1px solid #e2ece5',
                borderRadius: '6px',
                fontSize: '13px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d6a4f' }}>
                    {b.kind.toUpperCase()} {b.page ? `(Page ${b.page})` : ''} {b.language ? `[${b.language}]` : ''}
                  </span>
                </div>
                {b.kind === 'code' ? (
                  <pre style={{ margin: 0, padding: '8px', background: '#212529', color: '#f8f9fa', borderRadius: '4px' }}>{b.text}</pre>
                ) : (
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{b.text}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chunks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chunks.length === 0 ? (
              <p className="hint">No passage chunks generated. Ingest this document using Deep Focus Mode to create 256w/50o sliding passages.</p>
            ) : (
              chunks.map((chk) => (
                <div key={chk.id} style={{
                  padding: '12px',
                  background: '#fafbfa',
                  border: '1px solid #d4ded6',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: '#1b4332' }}>Chunk #{chk.chunkIndex}</span>
                    <span className="hint">{chk.wordCount} words {chk.page ? `· Page ${chk.page}` : ''}</span>
                  </div>
                  {chk.heading && <p className="hint" style={{ margin: '0 0 6px' }}>Under: <em>{chk.heading}</em></p>}
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{chk.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
