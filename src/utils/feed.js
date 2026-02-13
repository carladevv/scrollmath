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

let loadDataPromise = null;

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

// -------------------------
// Load Data
// -------------------------
async function loadPrecomputedData() {
  const response = await fetch("/generated/feed_index.json");
  if (!response.ok) {
    throw new Error(`Failed to fetch precomputed feed index: ${response.status}`);
  }

  const data = await response.json();
  if (
    !data ||
    !Array.isArray(data.posts) ||
    !Array.isArray(data.authors) ||
    !Array.isArray(data.works) ||
    !data.authorsById ||
    typeof data.authorsById !== "object" ||
    !data.postsById ||
    typeof data.postsById !== "object"
  ) {
    throw new Error("Invalid precomputed feed index format.");
  }

  return data;
}

export async function loadData() {
  if (loadDataPromise) return loadDataPromise;

  loadDataPromise = loadPrecomputedData().catch(error => {
    loadDataPromise = null;
    throw error;
  });

  return loadDataPromise;
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
