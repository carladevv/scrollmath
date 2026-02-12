import { buildAuthorPath, buildPostPath, navigateTo } from "../router/navigation";

export default function TinyImagePost({ post, author }) {
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

      <img
        src={post.image}
        alt={post.caption || "Related image post"}
        className="tiny-image-post-image"
      />

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
