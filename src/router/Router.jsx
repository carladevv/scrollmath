import { useState, useEffect } from "react";
import Home from "../pages/Home";
import Search from "../pages/Search";
import About from "../pages/About";
import Author from "../pages/Author";
import PostPage from "../pages/PostPage";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { parseLocation } from "./navigation";

export default function Router() {
  const initialLocation = parseLocation(window.location);
  const [route, setRoute] = useState(initialLocation.route);
  const [param, setParam] = useState(initialLocation.param);

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

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return (
    <>
      {route === "home" && <Home />}

      {route === "search" && <Search key={param || ""} initialQuery={param} />}
      {route === "about" && <About />}
      {route === "author" && <Author authorId={param} />}
      {route === "post" && <PostPage postId={param} />}

      <ScrollToTopButton route={route} hidden={route === "post"} />
    </>
  );
}
