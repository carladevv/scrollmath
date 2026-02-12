import uiTexts from "../data/ui_texts.json";
import { buildAboutPath, buildHomePath, buildSearchPath, navigateTo } from "../router/navigation";

export default function Header() {
  const handleNavigation = (path) => {
    navigateTo(path);
  };

  return (
    <div className="app-header">
      {/* Project Name */}
      <div
        className="app-header-brand"
        onClick={() => handleNavigation(buildHomePath())}
      >
        {uiTexts.projectName}
      </div>

      {/* Navigation Links */}
      <nav className="app-header-nav">
        <button
          onClick={() => handleNavigation(buildHomePath())}
          className="app-header-nav-button"
        >
          {uiTexts.navHome}
        </button>

        <button
          onClick={() => handleNavigation(buildSearchPath())}
          className="app-header-nav-button"
        >
          {uiTexts.navSearch}
        </button>

        <button
          onClick={() => handleNavigation(buildAboutPath())}
          className="app-header-nav-button"
        >
          {uiTexts.navAbout}
        </button>
      </nav>
    </div>
  );
}
