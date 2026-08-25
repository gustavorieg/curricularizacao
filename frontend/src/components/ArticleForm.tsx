import { useEffect, useState } from "react";
import type { Article, ArticlePayload, Author, Category } from "../types";
import { RichEditor } from "./RichEditor";
import { SourcesEditor } from "./SourcesEditor";
import { authorService } from "../services/author-service";
import { extractErrorMessage } from "../services/api-client";
import { AlertIcon } from "./icons";

interface ArticleFormProps {
  initial?: Article;
  categories: Category[];
  authors: Author[];
  submitting: boolean;
  onSubmit: (payload: ArticlePayload) => void;
  onCancel: () => void;
}

export function ArticleForm({
  initial,
  categories,
  authors,
  submitting,
  onSubmit,
  onCancel,
}: ArticleFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [authorName, setAuthorName] = useState(
    initial?.author?.name ?? authors.find((a) => a.id === initial?.authorId)?.name ?? ""
  );
  const [sources, setSources] = useState(initial?.sources ?? []);
  const [error, setError] = useState<string | null>(null);
  const [resolvingAuthor, setResolvingAuthor] = useState(false);

  useEffect(() => {
    if (!categoryId && categories[0]) setCategoryId(categories[0].id);
  }, [categories, categoryId]);

  useEffect(() => {
    if (!authorName && authors[0]) setAuthorName(authors[0].name);
  }, [authors, authorName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !summary.trim() || !content.trim() || !content.replace(/<[^>]*>/g, "").trim()) {
      setError("Preencha titulo, resumo e conteudo.");
      return;
    }
    if (!categoryId) {
      setError("Selecione uma categoria.");
      return;
    }
    if (!authorName.trim()) {
      setError("Informe o autor.");
      return;
    }
    for (const source of sources) {
      if (!source.title.trim() || !source.url.trim()) {
        setError("Toda fonte precisa de titulo e URL.");
        return;
      }
    }

    let authorId: string;
    const match = authors.find((a) => a.name.trim().toLowerCase() === authorName.trim().toLowerCase());
    if (match) {
      authorId = match.id;
    } else {
      setResolvingAuthor(true);
      try {
        const created = await authorService.create(authorName.trim());
        authorId = created.id;
      } catch (err) {
        setError(extractErrorMessage(err));
        setResolvingAuthor(false);
        return;
      }
      setResolvingAuthor(false);
    }

    onSubmit({
      title: title.trim(),
      summary: summary.trim(),
      content,
      categoryId,
      authorId,
      sources,
    });
  }

  const busy = submitting || resolvingAuthor;

  return (
    <form className="article-form" onSubmit={handleSubmit}>
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertIcon />
          {error}
        </div>
      )}

      <label className="field">
        <span>Titulo</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className="field">
        <span>Resumo</span>
        <textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Categoria</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Autor</span>
          <input
            type="text"
            list="author-suggestions"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Digite o nome de um autor existente ou um novo"
          />
          <datalist id="author-suggestions">
            {authors.map((a) => (
              <option key={a.id} value={a.name} />
            ))}
          </datalist>
        </label>
      </div>

      <label className="field">
        <span>Conteudo</span>
        <RichEditor value={content} onChange={setContent} />
      </label>

      <div className="field">
        <span>Fontes</span>
        <SourcesEditor sources={sources} onChange={setSources} />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Salvando..." : "Salvar artigo"}
        </button>
      </div>
    </form>
  );
}
