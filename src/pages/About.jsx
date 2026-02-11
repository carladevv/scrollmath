import { theme } from "../theme";
import uiTexts from "../data/ui_texts.json";

export default function About() {
  return (
    <div
      style={{
        padding: theme.spacing.pagePadding,
        color: theme.colors.textLight,
        lineHeight: 1.6
      }}
    >
      <style>{`
        .about-content p {
          margin-bottom: 24px;
        }
        .about-content p:last-child {
          margin-bottom: 0;
        }
      `}</style>
      <div
        className="about-content"
        dangerouslySetInnerHTML={{ __html: uiTexts.about_html }}
      />
    </div>
  );
}
