import { useEffect, useState } from "react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import { loadData } from "../utils/feed";
import { theme } from "../theme";
import uiTexts from "../data/ui_texts.json";

export default function Author({ authorId }) {
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadAuthorProfile() {
      try {
        const { posts: allPosts, authors: allAuthors } = await loadData();

        // Find matching author
        const foundAuthor = allAuthors.find(a => a.author_id === authorId);

        if (!foundAuthor) {
          setError(true);
          setLoading(false);
          return;
        }

        // Filter posts by author and group by work_id to maintain work order
        const authorPosts = allPosts.filter(p => p.author_id === authorId);
        const workMap = {};

        authorPosts.forEach(post => {
          const key = post.work_id;
          if (!workMap[key]) workMap[key] = [];
          workMap[key].push(post);
        });

        // Flatten while preserving work order
        const orderedPosts = Object.values(workMap).flat();

        setAuthor(foundAuthor);
        setPosts(orderedPosts);
        setLoading(false);
      } catch (err) {
        console.error("Error loading author:", err);
        setError(true);
        setLoading(false);
      }
    }

    loadAuthorProfile();
  }, [authorId]);

  if (loading) {
    return (
      <div
        style={{
          padding: theme.spacing.pagePadding,
          color: theme.colors.textLight
        }}
      >
        {uiTexts.loading}
      </div>
    );
  }

  if (error || !author) {
    return (
      <div
        style={{
          padding: theme.spacing.pagePadding,
          color: theme.colors.textLight
        }}
      >
        <h1>{uiTexts.authorNotFoundTitle}</h1>
        <p>{uiTexts.authorNotFoundMessage}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        margin: "-16px",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Author Header Card - with side padding only */}
      <div
        style={{
          background: theme.colors.postBackground,
          padding: theme.spacing.postPadding,
          borderRadius: theme.layout.postRadius,
          marginBottom: theme.spacing.gap,
          marginLeft: "16px",
          marginRight: "16px",
          marginTop: "16px"
        }}
      >
        {/* Avatar and Info Row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "flex-start",
            marginBottom: "16px"
          }}
        >
          {/* Avatar */}
          <img
            src={author.image}
            alt={author.name}
            style={{
              width: "80px",
              height: "80px",
              objectFit: "cover",
              borderRadius: theme.layout.postRadius,
              flexShrink: 0,
              cursor: "pointer"
            }}
            onClick={() => (window.location.hash = `#author&${author.author_id}`)}
            title="Click to refresh profile"
          />

          {/* Author Info */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "20px",
                fontWeight: 700,
                color: theme.colors.textPrimary,
                cursor: "pointer"
              }}
              onClick={() => (window.location.hash = `#author&${author.author_id}`)}
              title="Click to refresh profile"
            >
              {author.name}
            </h1>

            {/* Birth/Death line */}
            {(author.born || author.died) && (
              <div
                style={{
                  fontSize: theme.typography.dateSize,
                  color: theme.colors.textSecondary
                }}
              >
                {author.born && author.born.substring(0, 4)}
                {author.born && " — "}
                {author.died ? author.died.substring(0, 4) : "Present"}
              </div>
            )}
          </div>
        </div>

        {/* Bio - Full Width */}
        <p
          style={{
            margin: 0,
            fontSize: theme.typography.bodySize,
            color: theme.colors.textPrimary,
            lineHeight: 1.6
          }}
        >
          {author.bio}
        </p>
      </div>

      {/* Posts Section */}
      <div>
        {posts.length === 0 ? (
          <div
            style={{
              padding: theme.spacing.postPadding,
              background: theme.colors.postBackground,
              borderRadius: theme.layout.postRadius,
              textAlign: "center",
              color: theme.colors.textSecondary,
              marginLeft: "16px",
              marginRight: "16px"
            }}
          >
            {uiTexts.noPostsYet}
          </div>
        ) : (
          posts.map(post => (
            post.type === "image" || post.image ? (
              <ImagePost key={post.id} post={post} author={author} />
            ) : (
              <Post key={post.id} post={post} author={author} />
            )
          ))
        )}
      </div>
    </div>
  );
}
