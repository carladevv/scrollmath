import { useEffect, useRef, useState } from "react";
import { Heart, Share2, MessageCircle, Link as LinkIcon, Check } from "lucide-react";
import { theme } from "../theme";
import uiTexts from "../data/ui_texts.json";
import renderMathInElement from "katex/dist/contrib/auto-render";
import PostFooter from "./PostFooter";


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
          color: theme.colors.accent,
          display: "flex",
          gap: "8px",
          flexWrap: "wrap"
        }}
      >
        {post.tags.map(tag => (
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

      {/* Metrics */}
      <PostFooter post={post} />
    </div>
  );
}
