import { useEffect, useState } from "react";
import Post from "../components/Post";
import { loadData } from "../utils/feed";
import { theme } from "../theme";

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
        Loading...
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
        <h1>Author Not Found</h1>
        <p>The author you're looking for doesn't exist.</p>
      </div>
    );
  }

  const avatarSize = 120;
  const avatarOffset = 60;

  return (
    <div
      style={{
        background: "#f5f5f5",
        minHeight: "100vh"
      }}
    >
      {/* Header Section */}
      <div
        style={{
          position: "relative",
          paddingBottom: avatarOffset
        }}
      >
        {/* Header Image */}
        <img
          src={author.header}
          alt={author.name}
          style={{
            width: "100%",
            height: "300px",
            objectFit: "cover",
            display: "block"
          }}
        />

        {/* Author Info Card */}
        <div
          style={{
            position: "relative",
            marginTop: `-${avatarOffset}px`,
            marginLeft: theme.spacing.pagePadding,
            marginRight: theme.spacing.pagePadding,
            background: "white",
            borderRadius: "8px",
            padding: theme.spacing.postPadding,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
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
                width: avatarSize,
                height: avatarSize,
                objectFit: "cover",
                borderRadius: "50%",
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
                  fontSize: "24px",
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
                    fontSize: "13px",
                    color: theme.colors.textSecondary,
                    marginBottom: "8px"
                  }}
                >
                  {author.born && author.born.substring(0, 4)}
                  {author.born && author.died && " — "}
                  {author.died && author.died.substring(0, 4)}
                </div>
              )}

              {/* Bio */}
              <p
                style={{
                  margin: 0,
                  fontSize: theme.typography.bodySize,
                  color: theme.colors.textPrimary,
                  lineHeight: 1.5
                }}
              >
                {author.bio}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div
        style={{
          padding: theme.spacing.pagePadding,
          paddingTop: "24px",
          maxWidth: "800px",
          margin: "0 auto"
        }}
      >
        {posts.length === 0 ? (
          <div
            style={{
              padding: "24px",
              background: "white",
              borderRadius: "8px",
              textAlign: "center",
              color: theme.colors.textSecondary
            }}
          >
            No posts yet
          </div>
        ) : (
          posts.map(post => (
            <Post key={post.id} post={post} author={author} />
          ))
        )}
      </div>
    </div>
  );
}
