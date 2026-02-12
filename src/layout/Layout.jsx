import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="layout-root">
      {/* Header */}
      <Header />

      {/* Page Content */}
      <div className="layout-content">
        {children}
      </div>

      {/* Footer */}
      <div className="layout-footer">
        © 2026 scrollmath
      </div>
    </div>
  );
}
