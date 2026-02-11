import { theme } from "../theme";
import uiTexts from "../data/ui_texts.json";

export default function About() {
  return (
    <div
      style={{
        padding: theme.spacing.pagePadding,
        background: theme.colors.postBackground,
        borderRadius: theme.layout.postRadius,
        color: theme.colors.textPrimary,
        lineHeight: 1.6
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: uiTexts.about_html }}
      />
    </div>
  );
}
