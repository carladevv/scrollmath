import { useState, useEffect } from "react";
import Home from "../pages/Home";
import Search from "../pages/Search";
import About from "../pages/About";
import Author from "../pages/Author";
import PostPage from "../pages/PostPage";

/**
 * Parses window.location.hash to extract route and parameters
 * Supported formats:
 * - "" or "#home" → route: "home", param: null
 * - "#search" → route: "search", param: null
 * - "#about" → route: "about", param: null
 * - "#author&ID" → route: "author", param: "ID"
 * - "#post&ID" → route: "post", param: "ID"
 */
function parseHash(hash) {
  // Remove leading "#"
  const hashValue = hash.startsWith("#") ? hash.slice(1) : hash;

  // Default to home if empty
  if (!hashValue) {
    return { route: "home", param: null };
  }

  // Split on "&" to separate route and param
  const [route, param] = hashValue.split("&");

  return {
    route: route || "home",
    param: param || null
  };
}

export default function Router() {
  const [route, setRoute] = useState("home");
  const [param, setParam] = useState(null);

  // Parse hash on mount and whenever it changes
  useEffect(() => {
    const handleHashChange = () => {
      const { route: newRoute, param: newParam } = parseHash(
        window.location.hash
      );
      setRoute(newRoute);
      setParam(newParam);
    };

    // Initial parse
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  // Render appropriate page based on route
  switch (route) {
    case "home":
      return <Home />;
    case "search":
      return <Search />;
    case "about":
      return <About />;
    case "author":
      return <Author authorId={param} />;
    case "post":
      return <PostPage postId={param} />;
    default:
      return <Home />;
  }
}
