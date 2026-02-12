import { useEffect, useState } from "react";
import Post from "../components/Post";
import ImagePost from "../components/ImagePost";
import { loadData } from "../utils/feed";
import uiTexts from "../data/ui_texts.json";
import { buildAuthorPath, navigateTo } from "../router/navigation";

export default function Author({ authorId }) {
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadAuthorProfile() {
      try {
        const { posts: allPosts, authors: allAuthors } = await loadData();

        // Find matching author
        const foundAuthor = allAuthors.find(a => a.author_id === authorId);

        if (!foundAuthor) {
          setError(true);
          setLoading(false);
          return;
        }

        // Filter posts by author and group by work_id to maintain work order
        const authorPosts = allPosts.filter(p => p.author_id === authorId);
        const workMap = {};

        authorPosts.forEach(post => {
          const key = post.work_id;
          if (!workMap[key]) workMap[key] = [];
          workMap[key].push(post);
        });

        // Flatten while preserving work order
        const orderedPosts = Object.values(workMap).flat();

        setAuthor(foundAuthor);
        setPosts(orderedPosts);
        setLoading(false);
      } catch (err) {
        console.error("Error loading author:", err);
        setError(true);
        setLoading(false);
      }
    }

    loadAuthorProfile();
  }, [authorId]);

  if (loading) {
    return (
      <div className="status-message">
        {uiTexts.loading}
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="status-message">
        <h1>{uiTexts.authorNotFoundTitle}</h1>
        <p>{uiTexts.authorNotFoundMessage}</p>
      </div>
    );
  }

  return (
    <div className="posts-column desktop-top-gap author-page">
      {/* Author Header Card - with side padding only */}
      <div className="author-header-card">
        {/* Avatar and Info Row */}
        <div className="author-header-row">
          {/* Avatar */}
          <img
            src={author.image}
            alt={author.name}
            className="author-avatar"
            onClick={() => navigateTo(buildAuthorPath(author.author_id))}
            title="Click to refresh profile"
          />

          {/* Author Info */}
          <div className="author-info">
            <h1
              className="author-name"
              onClick={() => navigateTo(buildAuthorPath(author.author_id))}
              title="Click to refresh profile"
            >
              {author.name}
            </h1>

            {/* Birth/Death line */}
            {(author.born || author.died) && (
              <div className="author-dates">
                {author.born && author.born.substring(0, 4)}
                {author.born && " — "}
                {author.died ? author.died.substring(0, 4) : "Present"}
              </div>
            )}
          </div>
        </div>

        {/* Bio - Full Width */}
        <p className="author-bio">
          {author.bio}
        </p>
      </div>

      {/* Posts Section */}
      <div className="author-posts">
        {posts.length === 0 ? (
          <div className="author-empty-posts">
            {uiTexts.noPostsYet}
          </div>
        ) : (
          posts.map(post => (
            post.type === "image" || post.image ? (
              <ImagePost key={post.id} post={post} author={author} />
            ) : (
              <Post key={post.id} post={post} author={author} />
            )
          ))
        )}
      </div>
    </div>
  );
}
