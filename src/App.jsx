import { useEffect, useState, useMemo, useRef } from "react";
import Post from "./components/Post";
import { theme } from "./theme";

export default function App() {
  const [rawPosts, setRawPosts] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const feedRef = useRef(null);

  // -------------------------
  // Group posts by work_id
  // -------------------------
  function groupByWork(posts) {
    const map = {};

    posts.forEach(post => {
      if (!map[post.work_id]) {
        map[post.work_id] = [];
      }
      map[post.work_id].push(post);
    });

    return Object.values(map);
  }

  // -------------------------
  // Build feed while preserving internal order inside each work
  // -------------------------
  function buildFeed(posts) {
    // group by work_id
    const workMap = {};

    posts.forEach(post => {
      const key = post.work_id;
      if (!workMap[key]) workMap[key] = [];
      workMap[key].push(post);
    });

    const works = Object.values(workMap).map(work => ({
      posts: [...work],
      index: 0
    }));

    const result = [];
    let workIndex = 0;

    // Round-robin through works
    while (works.some(w => w.index < w.posts.length)) {
      const availableWorks = works.filter(w => w.index < w.posts.length);

      if (availableWorks.length === 0) break;

      // Cycle through works in order
      const currentWork = availableWorks[workIndex % availableWorks.length];

      result.push(currentWork.posts[currentWork.index]);
      currentWork.index++;

      workIndex++;
    }

    return result;
  }


  // -------------------------
  // Load Data
  // -------------------------
  useEffect(() => {
    async function loadData() {
      const postModules = import.meta.glob("./data/posts/*.json");
      const authorModules = import.meta.glob("./data/authors/*.json");

      let allPosts = [];
      let allAuthors = [];

      for (const path in postModules) {
        const module = await postModules[path]();
        allPosts = [...allPosts, ...module.default];
      }

      for (const path in authorModules) {
        const module = await authorModules[path]();
        allAuthors = [...allAuthors, ...module.default];
      }

      setRawPosts(allPosts);
      setAuthors(allAuthors);
    }

    loadData();
  }, []);

  // -------------------------
  // Build Feed Order
  // -------------------------
  useEffect(() => {
    if (rawPosts.length === 0) return;

    const ordered = buildFeed(rawPosts);

    const startIndex = Math.floor(Math.random() * ordered.length);

    const rotated = [
      ...ordered.slice(startIndex),
      ...ordered.slice(0, startIndex)
    ];

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
