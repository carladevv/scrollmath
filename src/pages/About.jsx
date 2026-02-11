import { theme } from "../theme";

export default function About() {
  return (
    <div
      style={{
        padding: theme.spacing.pagePadding,
        color: theme.colors.textLight
      }}
    >
      <h1>About</h1>
      <p>Learn more about scrollmath coming soon.</p>
    </div>
  );
}
