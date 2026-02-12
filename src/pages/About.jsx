import uiTexts from "../data/ui_texts.json";

export default function About() {
  return (
    <div className="about-page">
      <div
        className="about-content"
        dangerouslySetInnerHTML={{ __html: uiTexts.about_html }}
      />
    </div>
  );
}
