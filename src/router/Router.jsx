import { useState, useEffect } from "react";
import Home from "../pages/Home";
import Search from "../pages/Search";
import About from "../pages/About";
import Author from "../pages/Author";
import PostPage from "../pages/PostPage";
import { parseLocation } from "./navigation";

export default function Router() {
  const [route, setRoute] = useState("home");
  const [param, setParam] = useState(null);

  useEffect(() => {
    const handleRouteChange = () => {
      const { route: newRoute, param: newParam, canonicalPath } = parseLocation(window.location);

      setRoute(newRoute);
      setParam(newParam);

      if (canonicalPath) {
        const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        if (current !== canonicalPath) {
          window.history.replaceState({}, "", canonicalPath);
        }
      }
    };

    handleRouteChange();

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  switch (route) {
    case "home":
      return <Home />;
    case "search":
      return <Search initialQuery={param} />;
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
