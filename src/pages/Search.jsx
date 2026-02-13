import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import { loadData } from "../utils/feed";
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
  const sourceTitle = (post.work && post.work.title)
    ? post.work.title
    : (post.origin && post.origin.article ? post.origin.article : "");
  if (sourceTitle.toLowerCase().includes(lowerQuery)) return true;

  // Search in author name
  if (author && author.name.toLowerCase().includes(lowerQuery)) return true;

  return false;
}

export default function Search({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [posts, setPosts] = useState([]);
  const [results, setResults] = useState([]);
  const [authorsById, setAuthorsById] = useState({});
  const [loading, setLoading] = useState(true);

  // Load all posts and authors on mount
  useEffect(() => {
    async function loadAllData() {
      try {
        const { posts: allPosts, authorsById: allAuthorsById } = await loadData();
        setPosts(allPosts);
        setAuthorsById(allAuthorsById);
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

    const layoutContent = document.querySelector(".layout-content");
    if (layoutContent) {
      layoutContent.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialQuery]);

  // Filter posts whenever query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const filtered = posts.filter(post => {
      const author = authorsById[post.author_id];
      return matchesQuery(post, author, query);
    });

    setResults(filtered);
  }, [query, posts, authorsById]);

  if (loading) {
    return (
      <div className="status-message">
        {uiTexts.loading}
      </div>
    );
  }

  return (
    <div className="posts-column search-page">
      {/* Search Input */}
      <div className="search-input-wrap">
        <SearchIcon size={20} className="search-input-icon" />
        <input
          type="text"
          placeholder={uiTexts.searchPlaceholder}
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Results Section */}
      <div>
        {query.trim() === "" ? null : results.length === 0 ? (
          <div className="search-empty-results">
            {uiTexts.searchNoResults} "{query}"
          </div>
        ) : (
          <div>
            <div className="search-results-count">
              {results.length} {results.length === 1 ? "result" : "results"} {uiTexts.searchFound}
            </div>

            {results.map(post => {
              const author = authorsById[post.author_id];
              if (!author) return null;

              if (post.type === "image" || post.image) {
                return (
                  <ImagePost key={post.id + Math.random()} post={post} author={author} />
                );
              }

              return (
                <Post key={post.id + Math.random()} post={post} author={author} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
