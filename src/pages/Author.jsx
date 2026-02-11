import { theme } from "../theme";

export default function Author({ authorId }) {
  return (
    <div
      style={{
        padding: theme.spacing.pagePadding,
        color: theme.colors.textLight
      }}
    >
      <h1>Author Page</h1>
      <p>Author ID: {authorId || "(none)"}</p>
      <p>Author details coming soon.</p>
    </div>
  );
}
