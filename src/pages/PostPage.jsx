import { useEffect, useState } from "react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import TinyPost from "../components/TinyPost";
import TinyImagePost from "../components/TinyImagePost";
import { loadData } from "../utils/feed";
import { theme } from "../theme";
import uiTexts from "../data/ui_texts.json";

export default function PostPage({ postId }) {
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
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

        const currentTags = new Set(foundPost.tags || []);
        const related = posts
          .filter(p => p.id !== foundPost.id)
          .map(p => {
            const overlap = (p.tags || []).filter(tag => currentTags.has(tag)).length;
            return { post: p, overlap };
          })
          .filter(item => item.overlap > 0)
          .sort((a, b) => b.overlap - a.overlap)
          .slice(0, 3)
          .map(item => item.post);

        setPost(foundPost);
        setAuthor(foundAuthor);
        setAuthors(authors);
        setRelatedPosts(related);
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
        {uiTexts.loading}
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
        <h1>{uiTexts.postNotFoundTitle}</h1>
        <p>{uiTexts.postNotFoundMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="posts-column desktop-top-gap"
      style={{
        display: "flex",
        flexDirection: "column"
      }}
    >
      {post.type === "image" || post.image ? (
        <ImagePost post={post} author={author} />
      ) : (
        <Post post={post} author={author} />
      )}

      {relatedPosts.length > 0 && (
        <div
          style={{
            marginTop: "0px",
            marginBottom: theme.spacing.gap,
            padding: "0 8px"
          }}
        >
          <div
            style={{
              marginBottom: "8px",
              fontSize: "12px",
              color: theme.colors.textSecondary
            }}
          >
            Related posts
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "8px"
            }}
          >
            {relatedPosts.map(relatedPost => {
              const relatedAuthor = authors.find(a => a.author_id === relatedPost.author_id);
              if (!relatedAuthor) return null;

              if (relatedPost.type === "image" || relatedPost.image) {
                return (
                  <TinyImagePost
                    key={relatedPost.id}
                    post={relatedPost}
                    author={relatedAuthor}
                  />
                );
              }

              return (
                <TinyPost
                  key={relatedPost.id}
                  post={relatedPost}
                  author={relatedAuthor}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
