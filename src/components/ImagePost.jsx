import { useEffect, useRef } from "react";
import PostFooter from "./PostFooter";
import renderMathInElement from "katex/dist/contrib/auto-render";
import { ExternalLink } from "lucide-react";
import { buildAuthorPath, buildPostPath, buildSearchPath, navigateTo } from "../router/navigation";

export default function ImagePost({ post, author }) {
  const captionRef = useRef(null);
  const locationAndDate = [author.country, post.date].filter(Boolean).join(", ");
  const handleHeaderClick = () => {
    navigateTo(buildPostPath(post.id));
  };

  useEffect(() => {
    if (!captionRef.current) return;
    renderMathInElement(captionRef.current, {
      delimiters: [
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }, [post.id, post.caption]);

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
          onClick={(e) => {
            e.stopPropagation();
            handleAuthorClick();
          }}
          className="post-author-avatar"
        />

        <div
          onClick={(e) => {
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

      {/* Image */}
      <div className="image-post-media">
        <img
          src={post.image}
          alt={post.caption}
          className="image-post-image"
        />
      </div>

      {/* Caption */}
      <div
        className="post-content"
        ref={captionRef}
        dangerouslySetInnerHTML={{ __html: post.caption }}
      />

      

      {/* Origin Link */}
      <div className="image-post-origin">
        <a
          href={post.origin.link}
          target="_blank"
          rel="noopener noreferrer"
          className="image-post-origin-link"
        >
         {post.origin.article} <ExternalLink size={12}/> 
        </a>
      </div>
      {/* Tags */}
      <div className="post-tags">
        {post.tags?.map(tag => (
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

      {/* Footer */}
      <PostFooter post={post} />
    </div>
  );
}
