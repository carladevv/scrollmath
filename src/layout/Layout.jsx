import { theme } from "../theme";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div
      style={{
        background: theme.colors.background,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <Header />

      {/* Page Content */}
      <div
        style={{
          flex: 1,
          padding: theme.spacing.pagePadding,
          overflowY: "auto"
        }}
      >
        {children}
      </div>

      {/* Footer */}
      <div
        style={{
          height: theme.layout.footerHeight,
          background: theme.colors.footer,
          borderTop: `1px solid ${theme.colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          color: theme.colors.textSecondary
        }}
      >
        © 2026 scrollmath
      </div>
    </div>
  );
}
