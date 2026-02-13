import { useEffect, useState } from "react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import TinyPost from "../components/TinyPost";
import TinyImagePost from "../components/TinyImagePost";
import { loadData } from "../utils/feed";
import uiTexts from "../data/ui_texts.json";

export default function PostPage({ postId }) {
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [authorsById, setAuthorsById] = useState({});
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadPost() {
      try {
        const { posts, postsById, authorsById: allAuthorsById } = await loadData();

        // Find matching post
        const foundPost = postsById[postId];

        if (!foundPost) {
          setError(true);
          setLoading(false);
          return;
        }

        // Find matching author
        const foundAuthor = allAuthorsById[foundPost.author_id];

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
        setAuthorsById(allAuthorsById);
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
      <div className="status-message">
        {uiTexts.loading}
      </div>
    );
  }

  if (error || !post || !author) {
    return (
      <div className="status-message">
        <h1>{uiTexts.postNotFoundTitle}</h1>
        <p>{uiTexts.postNotFoundMessage}</p>
      </div>
    );
  }

  return (
    <div className="posts-column desktop-top-gap post-page">
      {post.type === "image" || post.image ? (
        <ImagePost post={post} author={author} />
      ) : (
        <Post post={post} author={author} />
      )}

      {relatedPosts.length > 0 && (
        <div className="related-posts">
          <div className="related-posts-title">
            Related posts
          </div>
          <div className="related-posts-grid">
            {relatedPosts.map(relatedPost => {
              const relatedAuthor = authorsById[relatedPost.author_id];
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
