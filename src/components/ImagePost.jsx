import { useLayoutEffect, useRef } from "react";
import PostFooter from "./PostFooter";
import renderMathInElement from "katex/dist/contrib/auto-render";
import { ExternalLink } from "lucide-react";
import { buildAuthorPath, buildPostPath, buildSearchPath, navigateTo } from "../router/navigation";
import { buildWikimediaThumbSrcSet, buildWikimediaThumbUrl } from "../utils/image";

export default function ImagePost({ post, author }) {
  const captionRef = useRef(null);
  const locationAndDate = [author.country, post.date].filter(Boolean).join(", ");
  const authorImage = author.image_small || author.image;
  const imageSrc = buildWikimediaThumbUrl(post.image, 960);
  const imageSrcSet = buildWikimediaThumbSrcSet(post.image, [480, 800, 960, 1200]);
  const handleHeaderClick = () => {
    navigateTo(buildPostPath(post.id));
  };

  useLayoutEffect(() => {
    const captionElement = captionRef.current;
    if (!captionElement) return;

    // Keep math rendering stable when this component remounts across routes.
    captionElement.innerHTML = post.caption;
    renderMathInElement(captionElement, {
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
          src={authorImage}
          alt={author.name}
          width="36"
          height="36"
          loading="lazy"
          decoding="async"
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
          src={imageSrc}
          srcSet={imageSrcSet}
          sizes="(max-width: 640px) 100vw, 600px"
          alt={post.caption}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.dataset.fallbackApplied === "1") return;
            img.dataset.fallbackApplied = "1";
            img.removeAttribute("srcset");
            img.src = post.image;
          }}
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
