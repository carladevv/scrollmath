import { useEffect, useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import { loadData } from "../utils/feed";
import uiTexts from "../data/ui_texts.json";

function normalizeQuery(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function Search({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [postsById, setPostsById] = useState({});
  const [searchIndex, setSearchIndex] = useState([]);
  const [results, setResults] = useState([]);
  const [authorsById, setAuthorsById] = useState({});
  const [loading, setLoading] = useState(true);

  // Load all posts and authors on mount
  useEffect(() => {
    async function loadAllData() {
      try {
        const { postsById: allPostsById, authorsById: allAuthorsById, searchIndex: allSearchIndex } = await loadData();
        setPostsById(allPostsById);
        setAuthorsById(allAuthorsById);
        setSearchIndex(allSearchIndex);
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
    const normalizedQuery = normalizeQuery(query);
    if (!normalizedQuery) {
      setResults([]);
      return;
    }

    const filtered = searchIndex
      .filter(item => item.text.includes(normalizedQuery))
      .map(item => postsById[item.id])
      .filter(Boolean);

    setResults(filtered);
  }, [query, searchIndex, postsById]);

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
