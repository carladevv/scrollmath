import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import renderMathInElement from "katex/dist/contrib/auto-render";
import PostFooter from "./PostFooter";
import { buildAuthorPath, buildPostPath, buildSearchPath, navigateTo } from "../router/navigation";

function getTranslationCredit(work) {
  if (!work || !work.translation) return null;

  const fromLanguage = work.translation.from ? ` from ${work.translation.from}` : "";

  if (work.translation.type === "human_translated" && work.translation.translator) {
    return {
      text: `Trans. ${work.translation.translator}${fromLanguage}`,
      isMachineTranslated: false
    };
  }

  if (work.translation.type === "machine_translated") {
    return {
      text: `Machine translated${fromLanguage}`,
      isMachineTranslated: true
    };
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
    navigateTo(buildPostPath(post.id));
  };

  const handleAuthorClick = () => {
    navigateTo(buildAuthorPath(author.author_id));
  };

  const scrollSearchContainersToTop = () => {
    const layoutContent = document.querySelector(".layout-content");
    const homeFeed = document.querySelector(".home-feed");

    if (layoutContent) {
      layoutContent.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (homeFeed) {
      homeFeed.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTagClick = (e, tag) => {
    e.stopPropagation();
    navigateTo(buildSearchPath(tag));
    scrollSearchContainersToTop();
    window.requestAnimationFrame(scrollSearchContainersToTop);
  };

  const workTitle = (post.work && post.work.title) || "Unknown work";
  const translationCredit = getTranslationCredit(post.work);
  const locationAndDate = [author.country, post.date].filter(Boolean).join(", ");

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
            {locationAndDate}
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
            {translationCredit.isMachineTranslated && (
              <AlertTriangle size={12} className="post-source-translation-icon" />
            )}
            {translationCredit.text}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="post-tags">
        {post.tags.map(tag => (
          <button
            key={tag}
            onClick={e => handleTagClick(e, tag)}
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
