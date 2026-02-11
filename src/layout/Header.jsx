import { theme } from "../theme";

export default function Header() {
  const handleNavigation = (hash) => {
    window.location.hash = hash;
  };

  return (
    <div
      style={{
        height: theme.layout.headerHeight,
        background: theme.colors.header,
        display: "flex",
        alignItems: "center",
        padding: `0 ${theme.spacing.pagePadding}`,
        borderBottom: `1px solid ${theme.colors.border}`,
        gap: theme.spacing.gap
      }}
    >
      {/* Project Name */}
      <div
        style={{
          fontSize: "18px",
          fontWeight: "bold",
          color: theme.colors.textLight,
          cursor: "pointer",
          marginRight: "auto"
        }}
        onClick={() => handleNavigation("#home")}
      >
        scrollmath
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          display: "flex",
          gap: theme.spacing.gap,
          alignItems: "center"
        }}
      >
        <button
          onClick={() => handleNavigation("#home")}
          style={{
            background: "none",
            border: "none",
            color: theme.colors.textLight,
            fontSize: "14px",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          Home
        </button>

        <button
          onClick={() => handleNavigation("#search")}
          style={{
            background: "none",
            border: "none",
            color: theme.colors.textLight,
            fontSize: "14px",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          Search
        </button>

        <button
          onClick={() => handleNavigation("#about")}
          style={{
            background: "none",
            border: "none",
            color: theme.colors.textLight,
            fontSize: "14px",
            cursor: "pointer",
            padding: "8px 12px",
            borderRadius: "4px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
        >
          About
        </button>
      </nav>
    </div>
  );
}
