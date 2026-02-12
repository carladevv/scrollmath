import { useState } from "react";
import { Heart, Share2, MessageCircle, Link as LinkIcon, Check } from "lucide-react";
import uiTexts from "../data/ui_texts.json";
import { buildPostPath } from "../router/navigation";

export default function PostFooter({ post }) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async (e) => {
    e.stopPropagation();

    const url = window.location.origin + buildPostPath(post.id);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="post-footer">
      <div className="post-footer-metrics">
        <Metric icon={<Heart size={16} />} value={post.metrics.likes} />
        <Metric icon={<Share2 size={16} />} value={post.metrics.shares} />
        <Metric icon={<MessageCircle size={16} />} value={post.metrics.comments} />
      </div>

      <button
        onClick={handleCopyLink}
        className={`post-footer-copy ${copied ? "is-copied" : ""}`}
        title={uiTexts.copyLinkTitle}
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
      </button>
    </div>
  );
}

function Metric({ icon, value }) {
  return (
    <div className="post-footer-metric">
      {icon}
      <span>{value}</span>
    </div>
  );
}
