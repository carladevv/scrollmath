// -------------------------
// Group posts by work_id
// -------------------------
export function groupByWork(posts) {
  const map = {};

  posts.forEach(post => {
    if (!map[post.work_id]) {
      map[post.work_id] = [];
    }
    map[post.work_id].push(post);
  });

  return Object.values(map);
}

// -------------------------
// Build feed while preserving internal order inside each work
// -------------------------
export function buildFeed(posts) {
  // group by work_id
  const workMap = {};

  posts.forEach(post => {
    const key = post.work_id;
    if (!workMap[key]) workMap[key] = [];
    workMap[key].push(post);
  });

  const works = Object.values(workMap).map(work => ({
    posts: [...work],
    index: 0
  }));

  const result = [];
  let workIndex = 0;

  // Round-robin through works
  while (works.some(w => w.index < w.posts.length)) {
    const availableWorks = works.filter(w => w.index < w.posts.length);

    if (availableWorks.length === 0) break;

    // Cycle through works in order
    const currentWork = availableWorks[workIndex % availableWorks.length];

    result.push(currentWork.posts[currentWork.index]);
    currentWork.index++;

    workIndex++;
  }

  return result;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function createSeededRandom(seedText) {
  let hash = 2166136261;

  for (let i = 0; i < seedText.length; i++) {
    hash ^= seedText.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  let state = hash >>> 0;

  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeWorks(worksById) {
  const works = Object.values(worksById);
  const rawValues = works
    .filter(work => {
      const anchoredMax = Number(work.popularity_reference_max);
      return !(Number.isFinite(anchoredMax) && anchoredMax > 0);
    })
    .map(work => Number(work.popularity_raw))
    .filter(value => Number.isFinite(value) && value > 0);

  const hasRawValues = rawValues.length > 0;
  const minRaw = hasRawValues ? Math.min(...rawValues) : null;
  const maxRaw = hasRawValues ? Math.max(...rawValues) : null;
  const minLog = hasRawValues ? Math.log10(minRaw) : null;
  const maxLog = hasRawValues ? Math.log10(maxRaw) : null;
  const logRange = hasRawValues ? (maxLog - minLog) : null;

  const normalized = {};

  works.forEach(work => {
    const raw = Number(work.popularity_raw);
    const hasRaw = Number.isFinite(raw) && raw > 0;
    const anchoredMax = Number(work.popularity_reference_max);
    const hasAnchoredMax = Number.isFinite(anchoredMax) && anchoredMax > 0;
    const popularityScale = work.popularity_scale || (hasAnchoredMax ? "ratio" : "log");
    const visibilityAdjustment = Number.isFinite(Number(work.visibility_adjustment))
      ? Number(work.visibility_adjustment)
      : 1;

    let popularityScore = 5;

    if (hasRaw && hasAnchoredMax) {
      const clampedRaw = clampNumber(raw, 1, anchoredMax);
      if (popularityScale === "log") {
        const maxLog = Math.log10(anchoredMax);
        if (maxLog <= 0) {
          popularityScore = 10;
        } else {
          const scaled = Math.log10(clampedRaw) / maxLog;
          popularityScore = 1 + 9 * scaled;
        }
      } else {
        const scaled = clampedRaw / anchoredMax;
        popularityScore = 1 + 9 * scaled;
      }
    } else if (hasRaw && hasRawValues) {
      if (!logRange || logRange <= 0) {
        popularityScore = 10;
      } else {
        const scaled = (Math.log10(raw) - minLog) / logRange;
        popularityScore = 1 + 9 * scaled;
      }
    }

    popularityScore = roundToOneDecimal(clampNumber(popularityScore, 1, 10));
    const popularityFinal = roundToOneDecimal(
      clampNumber(popularityScore * visibilityAdjustment, 1, 10)
    );

    normalized[work.id] = {
      ...work,
      visibility_adjustment: visibilityAdjustment,
      popularity_score: popularityScore,
      popularity_final: popularityFinal
    };
  });

  return normalized;
}

function generateMetrics(post, popularityFinal) {
  const score = clampNumber(Number(popularityFinal) || 5, 1, 10);
  const random = createSeededRandom(`${post.id}:${post.work_id || "no_work"}`);

  const baseLikes = 60 + Math.pow(score, 2.15) * 24;
  const likesVariance = 0.7 + random() * 0.9;
  const likes = Math.max(1, Math.round(baseLikes * likesVariance));

  const shareRate = 0.06 + score * 0.008 + random() * 0.08;
  const commentRate = 0.02 + score * 0.004 + random() * 0.05;

  const shares = Math.max(1, Math.round(likes * shareRate));
  const comments = Math.max(1, Math.round(likes * commentRate));

  return { likes, shares, comments };
}

// -------------------------
// Load Data
// -------------------------
export async function loadData() {
  const postModules = import.meta.glob("../data/posts/*.json");
  const imageModules = import.meta.glob("../data/images/*.json");
  const authorModules = import.meta.glob("../data/authors/*.json");
  const workModules = import.meta.glob("../data/works/*.json");

  let allPosts = [];
  let allAuthors = [];
  const worksById = {};

  for (const path in postModules) {
    const module = await postModules[path]();
    allPosts = [...allPosts, ...module.default];
  }

  // Also load image posts so they can be mixed into feeds
  for (const path in imageModules) {
    const module = await imageModules[path]();
    allPosts = [...allPosts, ...module.default];
  }

  for (const path in authorModules) {
    const module = await authorModules[path]();
    allAuthors = [...allAuthors, ...module.default];
  }

  for (const path in workModules) {
    const module = await workModules[path]();
    const work = module.default;
    worksById[work.id] = work;
  }

  const normalizedWorksById = normalizeWorks(worksById);

  const postsWithWork = allPosts.map(post => ({
    ...post,
    work: post.work_id ? normalizedWorksById[post.work_id] || null : null,
    metrics: generateMetrics(
      post,
      post.work_id ? normalizedWorksById[post.work_id]?.popularity_final : null
    )
  }));

  return { posts: postsWithWork, authors: allAuthors, works: Object.values(normalizedWorksById) };
}

// -------------------------
// Initialize feed with rotation
// -------------------------
export function initializeFeed(posts) {
  const ordered = buildFeed(posts);
  const startIndex = Math.floor(Math.random() * ordered.length);

  return [
    ...ordered.slice(startIndex),
    ...ordered.slice(0, startIndex)
  ];
}
