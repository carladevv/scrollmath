function safeDecode(value) {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function buildHomePath() {
  return "/";
}

export function buildAboutPath() {
  return "/about";
}

export function buildSearchPath(query = "") {
  if (!query) return "/search";
  return `/search/${encodeURIComponent(query)}`;
}

export function buildAuthorPath(authorId) {
  return `/author/${encodeURIComponent(authorId)}`;
}

export function buildPostPath(postId) {
  return `/p/${encodeURIComponent(postId)}`;
}

export function navigateTo(path) {
  if (window.location.pathname === path && !window.location.search && !window.location.hash) {
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
}

function parseHash(hash) {
  const hashValue = hash.startsWith("#") ? hash.slice(1) : hash;

  if (!hashValue) {
    return { route: "home", param: null };
  }

  const [route, rawParam] = hashValue.split("&");
  return {
    route: route || "home",
    param: safeDecode(rawParam)
  };
}

export function parseLocation(location) {
  const pathname = location.pathname || "/";
  const segments = pathname.split("/").filter(Boolean);
  const searchParams = new URLSearchParams(location.search || "");

  if (segments.length === 0) {
    const postFromQuery = safeDecode(searchParams.get("post"));
    if (postFromQuery) {
      return { route: "post", param: postFromQuery, canonicalPath: buildPostPath(postFromQuery) };
    }
    return parseHash(location.hash || "");
  }

  const [base, rawParam] = segments;
  const param = safeDecode(rawParam);

  if (base === "p" && param) {
    return { route: "post", param, canonicalPath: buildPostPath(param) };
  }

  if (base === "author" && param) {
    return { route: "author", param, canonicalPath: buildAuthorPath(param) };
  }

  if (base === "search") {
    return {
      route: "search",
      param,
      canonicalPath: param ? buildSearchPath(param) : buildSearchPath()
    };
  }

  if (base === "about") {
    return { route: "about", param: null, canonicalPath: buildAboutPath() };
  }

  if (base === "home") {
    return { route: "home", param: null, canonicalPath: buildHomePath() };
  }

  return parseHash(location.hash || "");
}
