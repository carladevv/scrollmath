import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "src", "data", "posts");
const imagesDir = path.join(rootDir, "src", "data", "images");
const authorsDir = path.join(rootDir, "src", "data", "authors");
const worksDir = path.join(rootDir, "src", "data", "works");
const outputDir = path.join(rootDir, "public", "generated");
const outputPath = path.join(outputDir, "feed_index.json");

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
  const minLog = hasRawValues ? Math.log10(minRaw) : null;
  const maxLog = hasRawValues ? Math.log10(Math.max(...rawValues)) : null;
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
        const anchoredMaxLog = Math.log10(anchoredMax);
        if (anchoredMaxLog <= 0) {
          popularityScore = 10;
        } else {
          const scaled = Math.log10(clampedRaw) / anchoredMaxLog;
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

async function loadJsonArrayFromDir(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = entries
    .filter(entry => entry.isFile() && entry.name.endsWith(".json"))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const values = [];

  for (const file of files) {
    const content = await fs.readFile(path.join(dirPath, file), "utf8");
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      values.push(...parsed);
    } else {
      values.push(parsed);
    }
  }

  return values;
}

async function main() {
  const [textPosts, imagePosts, authors, works] = await Promise.all([
    loadJsonArrayFromDir(postsDir),
    loadJsonArrayFromDir(imagesDir),
    loadJsonArrayFromDir(authorsDir),
    loadJsonArrayFromDir(worksDir)
  ]);

  const allPosts = [...textPosts, ...imagePosts];
  const worksById = {};

  for (const work of works) {
    if (work?.id) {
      worksById[work.id] = work;
    }
  }

  const normalizedWorksById = normalizeWorks(worksById);

  const posts = allPosts.map(post => ({
    ...post,
    work: post.work_id ? normalizedWorksById[post.work_id] || null : null,
    metrics: generateMetrics(
      post,
      post.work_id ? normalizedWorksById[post.work_id]?.popularity_final : null
    )
  }));

  const output = {
    posts,
    authors,
    works: Object.values(normalizedWorksById)
  };

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`Generated precomputed feed index with ${posts.length} posts at public/generated/feed_index.json.`);
}

main().catch(error => {
  console.error("Failed to generate feed index.");
  console.error(error);
  process.exitCode = 1;
});
