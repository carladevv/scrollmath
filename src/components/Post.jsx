import { useEffect, useRef, useState } from "react";
import { Heart, Share2, MessageCircle, Link as LinkIcon, Check } from "lucide-react";
import { theme } from "../theme";
import uiTexts from "../data/ui_texts.json";
import renderMathInElement from "katex/dist/contrib/auto-render";

export default function Post({ post, author }) {
  const contentRef = useRef(null);
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    const url = window.location.origin + "/#post&" + post.id;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleHeaderClick = () => {
    window.location.hash = "#post&" + post.id;
  };

  const handleAuthorClick = () => {
    window.location.hash = "#author&" + author.author_id;
  };

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
          onClick={e => {
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
          onClick={e => {
            e.stopPropagation();
            handleAuthorClick();
          }}
          style={{
            cursor: "pointer"
          }}
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "center"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: theme.colors.textSecondary,
              fontSize: theme.typography.metricSize
            }}
          >
            <Heart size={16} strokeWidth={2} />
            <span>{post.metrics.likes}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: theme.colors.textSecondary,
              fontSize: theme.typography.metricSize
            }}
          >
            <Share2 size={16} strokeWidth={2} />
            <span>{post.metrics.shares}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: theme.colors.textSecondary,
              fontSize: theme.typography.metricSize
            }}
          >
            <MessageCircle size={16} strokeWidth={2} />
            <span>{post.metrics.comments}</span>
          </div>
        </div>

        <button
          onClick={handleCopyLink}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 8px",
            color: copied ? theme.colors.accent : theme.colors.textSecondary,
            transition: "color 0.2s",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
          title={uiTexts.copyLinkTitle}
        >
          {copied ? <Check size={16} strokeWidth={2} /> : <LinkIcon size={16} strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}
