import { useCallback, useEffect, useState, useRef } from "react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import { buildFeed, loadData, initializeFeed } from "../utils/feed";

export default function Home() {
  const [rawPosts, setRawPosts] = useState([]);
  const [authorsById, setAuthorsById] = useState({});
  const [feedEntries, setFeedEntries] = useState([]);
  const feedRef = useRef(null);
  const entryCountRef = useRef(0);

  const createFeedEntries = useCallback((posts) => {
    return posts.map(post => {
      entryCountRef.current += 1;
      return {
        entryId: `${post.id}:${entryCountRef.current}`,
        post
      };
    });
  }, []);

  // -------------------------
  // Load Data
  // -------------------------
  useEffect(() => {
    async function load() {
      const { posts, authorsById: allAuthorsById } = await loadData();
      setRawPosts(posts);
      setFeedEntries(createFeedEntries(initializeFeed(posts)));
      setAuthorsById(allAuthorsById);
    }

    load();
  }, [createFeedEntries]);

  // -------------------------
  // Infinite Scroll Loop
  // -------------------------
  useEffect(() => {
    const handleScroll = () => {
      const el = feedRef.current;
      if (!el) return;

      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
        setFeedEntries(prev => [...prev, ...createFeedEntries(buildFeed(rawPosts))]);
      }
    };

    const el = feedRef.current;
    if (el) el.addEventListener("scroll", handleScroll);

    return () => {
      if (el) el.removeEventListener("scroll", handleScroll);
    };
  }, [createFeedEntries, rawPosts]);

  return (
    <div
      ref={feedRef}
      className="posts-column desktop-top-gap home-feed"
    >
      {feedEntries.map(entry => {
        const { entryId, post } = entry;
        const author = authorsById[post.author_id];
        if (!author) return null;

        // Render image posts with ImagePost, otherwise use regular Post
        if (post.type === "image" || post.image) {
          return (
            <ImagePost key={entryId} post={post} author={author} />
          );
        }

        return (
          <Post key={entryId} post={post} author={author} showPollEligible />
        );
      })}
    </div>
  );
}
