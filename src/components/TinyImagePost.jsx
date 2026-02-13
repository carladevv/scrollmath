import { useEffect, useRef } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render";
import { buildAuthorPath, buildPostPath, navigateTo } from "../router/navigation";
import { buildMathAwarePreviewFromHtml } from "../utils/previewText";
import { buildWikimediaThumbSrcSet, buildWikimediaThumbUrl } from "../utils/image";

export default function TinyImagePost({ post, author }) {
  const preview = buildMathAwarePreviewFromHtml(post.caption || "", 12);
  const previewRef = useRef(null);
  const authorImage = author.image_small || author.image;
  const imageSrc = buildWikimediaThumbUrl(post.image, 400);
  const imageSrcSet = buildWikimediaThumbSrcSet(post.image, [240, 320, 400]);

  useEffect(() => {
    if (!previewRef.current || !preview) return;

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

      <img
        src={imageSrc}
        srcSet={imageSrcSet}
        sizes="180px"
        alt={post.caption || "Related image post"}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fallbackApplied === "1") return;
          img.dataset.fallbackApplied = "1";
          img.removeAttribute("srcset");
          img.src = post.image;
        }}
        className="tiny-image-post-image"
      />

      {preview && (
        <div
          ref={previewRef}
          className="tiny-post-preview"
        >
          {preview}
        </div>
      )}

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
