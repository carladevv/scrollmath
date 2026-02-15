import { promises as fs } from "node:fs";
import path from "node:path";
import { assertPostPollShape } from "../src/utils/poll.js";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "src", "data", "posts");

async function main() {
  const files = (await fs.readdir(postsDir))
    .filter(name => name.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  let total = 0;

  for (const file of files) {
    const fullPath = path.join(postsDir, file);
    const content = await fs.readFile(fullPath, "utf8");
    const posts = JSON.parse(content);

    if (!Array.isArray(posts)) {
      throw new Error(`Expected array in ${file}`);
    }

    posts.forEach(post => {
      try {
        assertPostPollShape(post);
        total += 1;
      } catch (error) {
        throw new Error(`${file} -> ${error.message}`);
      }
    });
  }

  console.log(`Validated polls for ${total} posts across ${files.length} files.`);
}

main().catch(error => {
  console.error("Poll validation failed.");
  console.error(error.message || error);
  process.exitCode = 1;
});
