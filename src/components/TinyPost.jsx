import { buildAuthorPath, buildPostPath, navigateTo } from "../router/navigation";

function stripHtml(html = "") {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function firstWords(text = "", count = 14) {
  const words = text.split(" ").filter(Boolean);
  if (words.length <= count) return words.join(" ");
  return words.slice(0, count).join(" ") + "...";
}

export default function TinyPost({ post, author }) {
  const preview = firstWords(stripHtml(post.content?.html || ""));

  return (
    <div
      onClick={() => {
        navigateTo(buildPostPath(post.id));
      }}
      className="tiny-post"
      title="Open post"
    >
      <div className="tiny-post-header">
        <img
          src={author.image}
          alt={author.name}
          onClick={e => {
            e.stopPropagation();
            navigateTo(buildAuthorPath(author.author_id));
          }}
          className="tiny-post-avatar"
        />

        <div className="tiny-post-meta">
          <div className="tiny-post-author">
            {author.name}
          </div>
          <div className="tiny-post-date">
            {post.date}
          </div>
        </div>
      </div>

      <div className="tiny-post-preview">
        {preview}
      </div>

      {(post.tags || []).length > 0 && (
        <div className="tiny-post-tags">
          {(post.tags || []).slice(0, 3).map(tag => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
