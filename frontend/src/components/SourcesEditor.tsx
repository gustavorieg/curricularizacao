import type { ArticleSource } from "../types";

interface SourcesEditorProps {
  sources: ArticleSource[];
  onChange: (sources: ArticleSource[]) => void;
}

export function SourcesEditor({ sources, onChange }: SourcesEditorProps) {
  function updateSource(index: number, patch: Partial<ArticleSource>) {
    const next = sources.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(next);
  }

  function removeSource(index: number) {
    onChange(sources.filter((_, i) => i !== index));
  }

  function addSource() {
    onChange([...sources, { title: "", description: "", url: "" }]);
  }

  return (
    <div className="sources-editor">
      {sources.map((source, index) => (
        <div className="source-row" key={index}>
          <input
            type="text"
            placeholder="Titulo da fonte"
            value={source.title}
            onChange={(e) => updateSource(index, { title: e.target.value })}
          />
          <input
            type="url"
            placeholder="https://..."
            value={source.url}
            onChange={(e) => updateSource(index, { url: e.target.value })}
          />
          <input
            type="text"
            placeholder="Descricao (opcional)"
            value={source.description ?? ""}
            onChange={(e) => updateSource(index, { description: e.target.value })}
          />
          <button type="button" className="btn-icon danger" onClick={() => removeSource(index)}>
            Remover
          </button>
        </div>
      ))}
      <button type="button" className="btn-secondary" onClick={addSource}>
        + Adicionar fonte
      </button>
    </div>
  );
}
