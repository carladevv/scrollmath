import { useEffect, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render";
import { buildAuthorPath, buildPostPath, navigateTo } from "../router/navigation";
import { buildMathAwarePreviewFromHtml } from "../utils/previewText";

export default function TinyPost({ post, author }) {
  const preview = buildMathAwarePreviewFromHtml(post.content?.html || "", 14);
  const previewRef = useRef(null);
  const authorImage = author.image_small || author.image;

  useEffect(() => {
    if (!previewRef.current) return;

    renderMathInElement(previewRef.current, {
      delimiters: [
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }, [post.id, preview]);

  return (
    <div
      onClick={() => {
        navigateTo(buildPostPath(post.id));
      }}
      className="tiny-post"
      title="Open post"
    >
      <div className="tiny-post-header">
        <img
          src={authorImage}
          alt={author.name}
          width="20"
          height="20"
          loading="lazy"
          decoding="async"
          onClick={e => {
            e.stopPropagation();
            navigateTo(buildAuthorPath(author.author_id));
          }}
          className="tiny-post-avatar"
        />

        <div className="tiny-post-meta">
          <div className="tiny-post-author">
            {author.name}
          </div>
          <div className="tiny-post-date">
            {post.date}
          </div>
        </div>
      </div>

      <div
        ref={previewRef}
        className="tiny-post-preview"
      >
        {preview}
      </div>

      {(post.tags || []).length > 0 && (
        <div className="tiny-post-tags">
          {(post.tags || []).slice(0, 3).map(tag => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
