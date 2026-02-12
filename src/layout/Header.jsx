import uiTexts from "../data/ui_texts.json";

export default function Header() {
  const handleNavigation = (hash) => {
    window.location.hash = hash;
  };

  return (
    <div className="app-header">
      {/* Project Name */}
      <div
        className="app-header-brand"
        onClick={() => handleNavigation("#home")}
      >
        {uiTexts.projectName}
      </div>

      {/* Navigation Links */}
      <nav className="app-header-nav">
        <button
          onClick={() => handleNavigation("#home")}
          className="app-header-nav-button"
        >
          {uiTexts.navHome}
        </button>

        <button
          onClick={() => handleNavigation("#search")}
          className="app-header-nav-button"
        >
          {uiTexts.navSearch}
        </button>

        <button
          onClick={() => handleNavigation("#about")}
          className="app-header-nav-button"
        >
          {uiTexts.navAbout}
        </button>
      </nav>
    </div>
  );
}
