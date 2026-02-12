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

  const postsWithWork = allPosts.map(post => ({
    ...post,
    work: post.work_id ? worksById[post.work_id] || null : null
  }));

  return { posts: postsWithWork, authors: allAuthors, works: Object.values(worksById) };
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
