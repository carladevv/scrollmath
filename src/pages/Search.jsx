import { useEffect, useState } from "react";
import Post from "../components/Post";
import { loadData } from "../utils/feed";
import { theme } from "../theme";

/**
 * Strip HTML tags from a string
 */
function stripHTML(html) {
  return html.replace(/<[^>]+>/g, "");
}

/**
 * Check if a post matches the search query
 */
function matchesQuery(post, author, query) {
  const lowerQuery = query.toLowerCase();

  // Search in post content (stripped of HTML)
  const content = stripHTML(post.content.html).toLowerCase();
  if (content.includes(lowerQuery)) return true;

  // Search in post tags
  if (post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

  // Search in source work title
  if (post.source.work.toLowerCase().includes(lowerQuery)) return true;

  // Search in author name
  if (author && author.name.toLowerCase().includes(lowerQuery)) return true;

  return false;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [results, setResults] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all posts and authors on mount
  useEffect(() => {
    async function loadAllData() {
      try {
        const { posts: allPosts, authors: allAuthors } = await loadData();
        setPosts(allPosts);
        setAuthors(allAuthors);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data for search:", err);
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Filter posts whenever query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = posts.filter(post => {
      const author = authors.find(a => a.author_id === post.author_id);
      return matchesQuery(post, author, query);
    });

    setResults(filtered);
  }, [query, posts, authors]);

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

  return (
    <div
      style={{
        padding: theme.spacing.pagePadding
      }}
    >
      {/* Search Input */}
      <div
        style={{
          marginBottom: theme.spacing.gap
        }}
      >
        <input
          type="text"
          placeholder="Search posts, authors, tags..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: theme.typography.bodySize,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.layout.postRadius,
            boxSizing: "border-box",
            color: theme.colors.textPrimary,
            background: theme.colors.postBackground
          }}
        />
      </div>

      {/* Results Section */}
      <div>
        {query.trim() === "" ? (
          <div
            style={{
              padding: theme.spacing.postPadding,
              background: theme.colors.postBackground,
              borderRadius: theme.layout.postRadius,
              color: theme.colors.textSecondary,
              textAlign: "center"
            }}
          >
            Enter a search query to find posts
          </div>
        ) : results.length === 0 ? (
          <div
            style={{
              padding: theme.spacing.postPadding,
              background: theme.colors.postBackground,
              borderRadius: theme.layout.postRadius,
              color: theme.colors.textSecondary,
              textAlign: "center"
            }}
          >
            No results found for "{query}"
          </div>
        ) : (
          <div>
            <div
              style={{
                marginBottom: theme.spacing.gap,
                fontSize: theme.typography.dateSize,
                color: theme.colors.textSecondary
              }}
            >
              {results.length} {results.length === 1 ? "result" : "results"} found
            </div>

            {results.map(post => {
              const author = authors.find(a => a.author_id === post.author_id);
              if (!author) return null;

              return (
                <Post
                  key={post.id}
                  post={post}
                  author={author}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
