import { useState, useEffect } from "react";
import Home from "../pages/Home";
import Search from "../pages/Search";
import About from "../pages/About";
import Author from "../pages/Author";
import PostPage from "../pages/PostPage";
import ScrollToTopButton from "../components/ScrollToTopButton";
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

  let page = <Home />;

  switch (route) {
    case "home":
      page = <Home />;
      break;
    case "search":
      page = <Search initialQuery={param} />;
      break;
    case "about":
      page = <About />;
      break;
    case "author":
      page = <Author authorId={param} />;
      break;
    case "post":
      page = <PostPage postId={param} />;
      break;
    default:
      page = <Home />;
      break;
  }

  return (
    <>
      {page}
      <ScrollToTopButton route={route} hidden={route === "post"} />
    </>
  );
}
