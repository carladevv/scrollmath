import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton({ hidden = false, route }) {
  if (hidden) return null;

  const handleClick = () => {
    const targets = [];
    const homeFeed = document.querySelector(".home-feed");
    const layoutContent = document.querySelector(".layout-content");

    if (route === "home" && homeFeed) targets.push(homeFeed);
    if (layoutContent) targets.push(layoutContent);
    if (homeFeed && !targets.includes(homeFeed)) targets.push(homeFeed);

    targets.forEach(target => {
      target.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      className="scroll-top-button"
      onClick={handleClick}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp size={34} />
    </button>
  );
}
