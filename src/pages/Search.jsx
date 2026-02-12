import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import { loadData } from "../utils/feed";
import { theme } from "../theme";
import uiTexts from "../data/ui_texts.json";

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
  const rawContent = post.content && post.content.html ? post.content.html : (post.caption || "");
  const content = stripHTML(rawContent).toLowerCase();
  if (content.includes(lowerQuery)) return true;

  // Search in post tags
  if (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) return true;

  // Search in source work title
  const sourceTitle = (post.source && post.source.work) ? post.source.work : (post.origin && post.origin.article ? post.origin.article : "");
  if (sourceTitle.toLowerCase().includes(lowerQuery)) return true;

  // Search in author name
  if (author && author.name.toLowerCase().includes(lowerQuery)) return true;

  return false;
}

export default function Search({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery || "");
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
    // Update local query when route param changes
    setQuery(initialQuery || "");
  }, [initialQuery]);

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
        {uiTexts.loading}
      </div>
    );
  }

  return (
    <div
      className="posts-column"
      style={{
        marginTop: "-16px",
        padding: "16px"
      }}
    >
      {/* Search Input */}
      <div
        style={{
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px",
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.layout.postRadius,
          background: theme.colors.postBackground,
          boxSizing: "border-box"
        }}
      >
        <SearchIcon size={20} color={theme.colors.textSecondary} />
        <input
          type="text"
          placeholder={uiTexts.searchPlaceholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            fontSize: theme.typography.bodySize,
            color: theme.colors.textPrimary,
            background: "transparent",
            outline: "none"
          }}
        />
      </div>

      {/* Results Section */}
      <div>
        {query.trim() === "" ? null : results.length === 0 ? (
          <div
            style={{
              padding: theme.spacing.postPadding,
              background: theme.colors.postBackground,
              borderRadius: theme.layout.postRadius,
              color: theme.colors.textSecondary,
              textAlign: "center"
            }}
          >
            {uiTexts.searchNoResults} "{query}"
          </div>
        ) : (
          <div>
            <div
              style={{
                marginBottom: "16px",
                fontSize: theme.typography.dateSize,
                color: theme.colors.textSecondary
              }}
            >
              {results.length} {results.length === 1 ? "result" : "results"} {uiTexts.searchFound}
            </div>

            {results.map(post => {
              const author = authors.find(a => a.author_id === post.author_id);
              if (!author) return null;

              if (post.type === "image" || post.image) {
                return (
                  <ImagePost key={post.id + Math.random()} post={post} author={author} postMargin="16px" />
                );
              }

              return (
                <Post key={post.id + Math.random()} post={post} author={author} postMargin="16px" />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
