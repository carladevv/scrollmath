import { theme } from "../theme";

export default function PostPage({ postId }) {
  return (
    <div
      style={{
        padding: theme.spacing.pagePadding,
        color: theme.colors.textLight
      }}
    >
      <h1>Post Page</h1>
      <p>Post ID: {postId || "(none)"}</p>
      <p>Post details coming soon.</p>
    </div>
  );
}
