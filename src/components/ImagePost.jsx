import { useEffect, useRef } from "react";
import { theme } from "../theme";
import PostFooter from "./PostFooter";
import renderMathInElement from "katex/dist/contrib/auto-render";
import { ExternalLink } from "lucide-react";

export default function ImagePost({ post, author, postMargin = null }) {
  const captionRef = useRef(null);
  const handleHeaderClick = () => {
    window.location.hash = "#post&" + post.id;
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
    window.location.hash = "#author&" + author.author_id;
  };

  return (
    <div
      style={{
        background: theme.colors.postBackground,
        padding: theme.spacing.postPadding,
        borderRadius: theme.layout.postRadius,
        marginBottom: postMargin !== null ? postMargin : theme.spacing.gap
      }}
    >
      {/* Header */}
      <div
        onClick={handleHeaderClick}
        style={{
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer"
        }}
      >
        <img
          src={author.image}
          alt={author.name}
          onClick={(e) => {
            e.stopPropagation();
            handleAuthorClick();
          }}
          style={{
            width: "36px",
            height: "36px",
            objectFit: "cover",
            borderRadius: "50%",
            cursor: "pointer"
          }}
        />

        <div
          onClick={(e) => {
            e.stopPropagation();
            handleAuthorClick();
          }}
          style={{ cursor: "pointer" }}
        >
          <div
            style={{
              fontSize: theme.typography.authorSize,
              fontWeight: 600,
              color: theme.colors.textPrimary
            }}
          >
            {author.name}
          </div>

          <div
            style={{
              fontSize: theme.typography.dateSize,
              color: theme.colors.textSecondary
            }}
          >
            {post.date}
          </div>
        </div>
      </div>

      {/* Image */}
      <div style={{ marginBottom: "12px" }}>
        <img
          src={post.image}
          alt={post.caption}
          style={{
            width: "100%",
            borderRadius: theme.layout.postRadius,
            objectFit: "cover"
          }}
        />
      </div>

      {/* Caption */}
      <div
        style={{
          fontSize: theme.typography.bodySize,
          color: theme.colors.textPrimary,
          lineHeight: 1.6
        }}
        ref={captionRef}
        dangerouslySetInnerHTML={{ __html: post.caption }}
      />

      

      {/* Origin Link */}
      <div
        style={{
          marginTop: "8px",
          fontSize: theme.typography.dateSize,
          color: theme.colors.textSecondary
        }}
      >
        <a
          href={post.origin.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: theme.colors.accent,
            textDecoration: "none"
          }}
        >
         {post.origin.article} <ExternalLink size={12}/> 
        </a>
      </div>

      {/* Credit */}
      {/* <div
        style={{
          marginTop: "4px",
          fontSize: "12px",
          color: theme.colors.textSecondary,
          opacity: 0.8
        }}
      >
        {post.credit}
      </div> */}

      {/* Tags */}
      <div
        style={{
          marginTop: "8px",
          fontSize: theme.typography.tagSize,
          color: theme.colors.accent,
          display: "flex",
          gap: "8px",
          flexWrap: "wrap"
        }}
      >
        {post.tags?.map(tag => (
          <button
            key={tag}
            onClick={e => {
              e.stopPropagation();
              window.location.hash = "#search&" + encodeURIComponent(tag);
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              color: theme.colors.accent,
              cursor: "pointer",
              fontSize: theme.typography.tagSize
            }}
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
