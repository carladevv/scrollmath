import { theme } from "../theme";

export default function TinyImagePost({ post, author }) {
  return (
    <div
      onClick={() => {
        window.location.hash = "#post&" + post.id;
      }}
      style={{
        background: theme.colors.postBackground,
        borderRadius: theme.layout.postRadius,
        padding: "8px",
        cursor: "pointer",
        minWidth: 0
      }}
      title="Open post"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "8px"
        }}
      >
        <img
          src={author.image}
          alt={author.name}
          onClick={e => {
            e.stopPropagation();
            window.location.hash = "#author&" + author.author_id;
          }}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
            flexShrink: 0
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: theme.colors.textPrimary,
              lineHeight: 1.1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {author.name}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: theme.colors.textSecondary,
              lineHeight: 1.1
            }}
          >
            {post.date}
          </div>
        </div>
      </div>

      <img
        src={post.image}
        alt={post.caption || "Related image post"}
        style={{
          width: "100%",
          height: "64px",
          objectFit: "cover",
          borderRadius: theme.layout.postRadius
        }}
      />

      {(post.tags || []).length > 0 && (
        <div
          style={{
            marginTop: "6px",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            fontSize: "10px",
            color: theme.colors.accent,
            lineHeight: 1.2
          }}
        >
          {(post.tags || []).slice(0, 3).map(tag => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
