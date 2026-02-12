import { useEffect, useState, useRef } from "react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import { buildFeed, loadData, initializeFeed } from "../utils/feed";

export default function Home() {
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
      ref={feedRef}
      style={{
        height: "100%",
        overflowY: "auto",
        margin: "-16px"
      }}
    >
      {feedPosts.map(post => {
        const author = authors.find(a => a.author_id === post.author_id);
        if (!author) return null;

        // Render image posts with ImagePost, otherwise use regular Post
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
  );
}
