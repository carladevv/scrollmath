import { useState } from "react";
import { Heart, Share2, MessageCircle, Link as LinkIcon, Check } from "lucide-react";
import { theme } from "../theme";
import uiTexts from "../data/ui_texts.json";

export default function PostFooter({ post }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (e) => {
    e.stopPropagation();

    const url = window.location.origin + "/#post&" + post.id;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
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
        <Metric icon={<Heart size={16} />} value={post.metrics.likes} />
        <Metric icon={<Share2 size={16} />} value={post.metrics.shares} />
        <Metric icon={<MessageCircle size={16} />} value={post.metrics.comments} />
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
          alignItems: "center"
        }}
        title={uiTexts.copyLinkTitle}
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      </button>
    </div>
  );
}

function Metric({ icon, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: theme.colors.textSecondary,
        fontSize: theme.typography.metricSize
      }}
    >
      {icon}
      <span>{value}</span>
    </div>
  );
}
