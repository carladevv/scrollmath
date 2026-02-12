import { promises as fs } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const postsDir = path.join(rootDir, "src", "data", "posts");
const imagesDir = path.join(rootDir, "src", "data", "images");
const authorsDir = path.join(rootDir, "src", "data", "authors");
const worksDir = path.join(rootDir, "src", "data", "works");
const outputRoot = path.join(rootDir, "public", "p");

const siteUrl = (process.env.SITE_URL || "").replace(/\/$/, "");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, maxLength) {
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

function formatPostDate(rawDate) {
  if (!rawDate) return "";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

function normalizeIsoDate(rawDate) {
  if (!rawDate) return "";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

function absoluteUrl(relativeOrAbsolute) {
  if (!relativeOrAbsolute) return "";
  if (/^https?:\/\//i.test(relativeOrAbsolute)) return relativeOrAbsolute;
  if (!siteUrl) return relativeOrAbsolute;
  const normalizedPath = relativeOrAbsolute.startsWith("/")
    ? relativeOrAbsolute
    : `/${relativeOrAbsolute}`;
  return `${siteUrl}${normalizedPath}`;
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

function buildMeta(post, author, work) {
  const isImagePost = post.type === "image" || Boolean(post.image);
  const text = isImagePost ? post.caption : stripHtml(post?.content?.html);
  const title = author?.name || "Unknown author";
  const formattedDate = formatPostDate(post.date);
  const excerpt = truncate(text || "Mathematics post.", 220);
  const description = truncate(
    [excerpt, formattedDate ? `Date: ${formattedDate}` : "", work?.title ? `From: ${work.title}` : ""]
      .filter(Boolean)
      .join(" | "),
    280
  );

  const image = post.image || author?.header || author?.image || "/headers/1.jpg";

  return {
    title,
    description,
    image: absoluteUrl(image),
    authorName: author?.name || "Unknown author",
    formattedDate,
    publishedTime: normalizeIsoDate(post.date)
  };
}

function createHtmlDocument({
  title,
  description,
  image,
  canonicalUrl,
  redirectPath,
  authorName,
  formattedDate,
  publishedTime
}) {
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  const escapedImage = escapeHtml(image);
  const escapedCanonical = escapeHtml(canonicalUrl);
  const escapedRedirectPath = escapeHtml(redirectPath);
  const escapedAuthorName = escapeHtml(authorName || "");
  const escapedFormattedDate = escapeHtml(formattedDate || "");
  const escapedPublishedTime = escapeHtml(publishedTime || "");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDescription}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="mathscroll" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDescription}" />
    <meta property="og:image" content="${escapedImage}" />
    <meta property="og:url" content="${escapedCanonical}" />
    <meta property="article:author" content="${escapedAuthorName}" />
    ${escapedPublishedTime ? `<meta property="article:published_time" content="${escapedPublishedTime}" />` : ""}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDescription}" />
    <meta name="twitter:image" content="${escapedImage}" />
    <meta name="twitter:label1" content="Author" />
    <meta name="twitter:data1" content="${escapedAuthorName}" />
    <meta name="twitter:label2" content="Date" />
    <meta name="twitter:data2" content="${escapedFormattedDate}" />

    <meta http-equiv="refresh" content="0; url=${escapedRedirectPath}" />
    <script>
      window.location.replace(${JSON.stringify(redirectPath)});
    </script>
  </head>
  <body>
    Redirecting to <a href="${escapedRedirectPath}">${escapedRedirectPath}</a>...
  </body>
</html>
`;
}

async function main() {
  const [textPosts, imagePosts, authors, works] = await Promise.all([
    loadJsonArrayFromDir(postsDir),
    loadJsonArrayFromDir(imagesDir),
    loadJsonArrayFromDir(authorsDir),
    loadJsonArrayFromDir(worksDir)
  ]);

  const posts = [...textPosts, ...imagePosts];
  const authorsById = new Map(authors.map(author => [author.author_id, author]));
  const worksById = new Map(works.map(work => [work.id, work]));

  await fs.rm(outputRoot, { recursive: true, force: true });

  let generated = 0;

  for (const post of posts) {
    if (!post?.id) continue;

    const author = authorsById.get(post.author_id) || null;
    const work = worksById.get(post.work_id) || null;
    const encodedId = encodeURIComponent(String(post.id));

    const routePath = `/p/${encodedId}`;
    const canonicalUrl = absoluteUrl(routePath) || routePath;
    const redirectPath = `/?post=${encodeURIComponent(String(post.id))}`;
    const meta = buildMeta(post, author, work);

    const html = createHtmlDocument({
      ...meta,
      canonicalUrl,
      redirectPath
    });

    const pageDir = path.join(outputRoot, encodedId);
    await fs.mkdir(pageDir, { recursive: true });
    await fs.writeFile(path.join(pageDir, "index.html"), html, "utf8");
    generated += 1;
  }

  console.log(`Generated ${generated} social preview pages in public/p.`);

  if (!siteUrl) {
    console.log("SITE_URL is not set. OG URLs/images are relative. Set SITE_URL in deploy for absolute previews.");
  }
}

main().catch(error => {
  console.error("Failed to generate social preview pages.");
  console.error(error);
  process.exitCode = 1;
});
