import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import renderMathInElement from "katex/dist/contrib/auto-render";
import PostFooter from "./PostFooter";

function getTranslationCredit(work) {
  if (!work || !work.translation) return null;

  if (work.translation.type === "human_translated" && work.translation.translator) {
    return `Trans. ${work.translation.translator}`;
  }

  if (work.translation.type === "machine_translated") {
    return "Machine translation";
  }

  return null;
}

export default function Post({ post, author }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!contentRef.current) return;

    renderMathInElement(contentRef.current, {
      delimiters: [
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }, [post.id, post.content.html]);

  const handleHeaderClick = () => {
    window.location.hash = "#post&" + post.id;
  };

  const handleAuthorClick = () => {
    window.location.hash = "#author&" + author.author_id;
  };

  const workTitle = (post.work && post.work.title) || "Unknown work";
  const translationCredit = getTranslationCredit(post.work);

  return (
    <div className="post-card">
      {/* Header */}
      <div
        onClick={handleHeaderClick}
        className="post-header"
      >
        <img
          src={author.image}
          alt={author.name}
          onClick={e => {
            e.stopPropagation();
            handleAuthorClick();
          }}
          className="post-author-avatar"
        />

        <div
          onClick={e => {
            e.stopPropagation();
            handleAuthorClick();
          }}
          className="post-author-meta"
        >
          <div className="post-author-name">
            {author.name}
          </div>

          <div className="post-date">
            {post.date}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="post-content"
        dangerouslySetInnerHTML={{ __html: post.content.html }}
      />

      {/* Source */}
      <div className="post-source">
        <div className="post-source-title">{workTitle}</div>
        {translationCredit && (
          <div className="post-source-translation">
            {translationCredit === "Machine translation" && (
              <AlertTriangle size={12} className="post-source-translation-icon" />
            )}
            {translationCredit}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="post-tags">
        {post.tags.map(tag => (
          <button
            key={tag}
            onClick={e => {
              e.stopPropagation();
              window.location.hash = "#search&" + encodeURIComponent(tag);
            }}
            className="post-tag-button"
            title={`Search ${tag}`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Metrics */}
      <PostFooter post={post} />
    </div>
  );
}
