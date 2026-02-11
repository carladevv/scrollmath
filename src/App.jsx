import { useEffect, useState, useMemo, useRef } from "react";
import Post from "./components/Post";
import { theme } from "./theme";
import { buildFeed, loadData, initializeFeed } from "./utils/feed";

export default function App() {
  const [rawPosts, setRawPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const feedRef = useRef(null);


  // -------------------------
  // Load Data
  // -------------------------
  useEffect(() => {
    async function load() {
      const { posts, authors } = await loadData();
      setRawPosts(posts);
      setAuthors(authors);
    }

    load();
  }, []);

  // -------------------------
  // Build Feed Order
  // -------------------------
  useEffect(() => {
    if (rawPosts.length === 0) return;

    const rotated = initializeFeed(rawPosts);
    setFeedPosts(rotated);
  }, [rawPosts]);


  // -------------------------
  // Infinite Scroll Loop
  // -------------------------
  useEffect(() => {
    const handleScroll = () => {
      const el = feedRef.current;
      if (!el) return;

      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
        setFeedPosts(prev => [...prev, ...buildFeed(rawPosts)]);
      }
    };

    const el = feedRef.current;
    if (el) el.addEventListener("scroll", handleScroll);

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, [rawPosts]);

  return (
    <div
      style={{
        background: theme.colors.background,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <div
        style={{
          height: theme.layout.headerHeight,
          background: theme.colors.header
        }}
      />

      {/* Feed */}
      <div
        ref={feedRef}
        style={{
          flex: 1,
          padding: theme.spacing.pagePadding,
          overflowY: "auto"
        }}
      >
        {feedPosts.map(post => {
          const author = authors.find(a => a.author_id === post.author_id);
          if (!author) return null;

          return (
            <Post
              key={post.id + Math.random()}
              post={post}
              author={author}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          height: theme.layout.footerHeight,
          background: theme.colors.footer
        }}
      />
    </div>
  );
}
