import { useEffect, useState } from "react";
import Post from "../components/Post";
import { loadData } from "../utils/feed";
import { theme } from "../theme";

export default function PostPage({ postId }) {
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const { posts, authors } = await loadData();

        // Find matching post
        const foundPost = posts.find(p => p.id === postId);

        if (!foundPost) {
          setError(true);
          setLoading(false);
          return;
        }

        // Find matching author
        const foundAuthor = authors.find(a => a.author_id === foundPost.author_id);

        setPost(foundPost);
        setAuthor(foundAuthor);
        setLoading(false);
      } catch (err) {
        console.error("Error loading post:", err);
        setError(true);
        setLoading(false);
      }
    }

    loadPost();
  }, [postId]);

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

  if (error || !post || !author) {
    return (
      <div
        style={{
          padding: theme.spacing.pagePadding,
          color: theme.colors.textLight
        }}
      >
        <h1>Post Not Found</h1>
        <p>The post you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: theme.spacing.pagePadding,
        maxWidth: "800px"
      }}
    >
      <Post post={post} author={author} />
    </div>
  );
}
