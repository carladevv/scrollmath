import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "src", "data", "posts");
const difficulties = ["easy", "medium", "hard"];

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seedText) {
  let state = hashString(seedText) || 1;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeTag(tag) {
  return String(tag || "").trim().toLowerCase();
}

function pickUnique(items, count, random) {
  const pool = [...new Set(items)];
  const result = [];

  while (pool.length > 0 && result.length < count) {
    const index = Math.floor(random() * pool.length);
    result.push(pool[index]);
    pool.splice(index, 1);
  }

  return result;
}

function buildQuestion(difficulty) {
  if (difficulty === "easy") {
    return "Which topic is central to this math excerpt?";
  }

  if (difficulty === "hard") {
    return "Which concept is most directly referenced in this passage?";
  }

  return "Which tag best matches the main mathematical idea in this post?";
}

function buildPoll(post, allTags) {
  const random = createSeededRandom(post.id || JSON.stringify(post));
  const tags = Array.isArray(post.tags) ? post.tags.map(normalizeTag).filter(Boolean) : [];
  const correctTag = tags[0] || "mathematics";
  const difficulty = difficulties[hashString(`${post.id}:difficulty`) % difficulties.length];
  const distractorPool = allTags.filter(tag => tag !== correctTag && !tags.includes(tag));
  const fallbackPool = allTags.filter(tag => tag !== correctTag);
  const chosenDistractors = pickUnique(
    distractorPool.length >= 2 ? distractorPool : fallbackPool,
    2,
    random
  );

  while (chosenDistractors.length < 2) {
    chosenDistractors.push(`topic ${chosenDistractors.length + 1}`);
  }

  const options = [correctTag, ...chosenDistractors];

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  const correctIndex = options.indexOf(correctTag);

  return {
    question: buildQuestion(difficulty),
    options,
    correctIndex,
    difficulty
  };
}

async function main() {
  const files = (await fs.readdir(postsDir))
    .filter(name => name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  const parsedFiles = [];
  const allTagsSet = new Set();

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const content = await fs.readFile(fullPath, "utf8");
    const parsed = JSON.parse(content);
    parsedFiles.push({ file, fullPath, posts: parsed });

    for (const post of parsed) {
      const tags = Array.isArray(post.tags) ? post.tags : [];
      tags.forEach(tag => allTagsSet.add(normalizeTag(tag)));
    }
  }

  const allTags = [...allTagsSet].filter(Boolean).sort((a, b) => a.localeCompare(b));

  for (const entry of parsedFiles) {
    const withPolls = entry.posts.map(post => ({
      ...post,
      poll: buildPoll(post, allTags)
    }));

    await fs.writeFile(entry.fullPath, `${JSON.stringify(withPolls, null, 2)}\n`, "utf8");
  }

  console.log(`Added polls to ${parsedFiles.length} post files.`);
}

main().catch(error => {
  console.error("Failed to add polls.");
  console.error(error);
  process.exitCode = 1;
});
