import { useEffect, useRef } from "react";
import { theme } from "../theme";
import renderMathInElement from "katex/dist/contrib/auto-render";

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
  }, [post.content.html]);

  return (
    <div
      style={{
        background: theme.colors.postBackground,
        padding: theme.spacing.postPadding,
        borderRadius: theme.layout.postRadius,
        marginBottom: theme.spacing.gap
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "8px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <img
          src={author.image}
          alt={author.name}
          style={{
            width: "36px",
            height: "36px",
            objectFit: "cover",
            borderRadius: "50%"
          }}
        />

        <div>
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

      {/* Content */}
      <div
        ref={contentRef}
        style={{
          fontSize: theme.typography.bodySize,
          color: theme.colors.textPrimary,
          lineHeight: 1.6
        }}
        dangerouslySetInnerHTML={{ __html: post.content.html }}
      />

      {/* Source */}
      <div
        style={{
          marginTop: "12px",
          fontSize: theme.typography.dateSize,
          color: theme.colors.textSecondary
        }}
      >
        {post.source.work}
      </div>

      {/* Tags */}
      <div
        style={{
          marginTop: "8px",
          fontSize: theme.typography.tagSize,
          color: theme.colors.accent
        }}
      >
        {post.tags.map(tag => `#${tag}`).join(" ")}
      </div>

      {/* Metrics */}
      <div
        style={{
          marginTop: "12px",
          fontSize: theme.typography.metricSize,
          color: theme.colors.textSecondary,
          display: "flex",
          gap: "16px"
        }}
      >
        <span>❤ {post.metrics.likes}</span>
        <span>↻ {post.metrics.shares}</span>
        <span>💬 {post.metrics.comments}</span>
      </div>
    </div>
  );
}
