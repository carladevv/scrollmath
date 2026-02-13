function isWikimediaUploadUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.hostname === "upload.wikimedia.org" && url.pathname.includes("/wikipedia/commons/");
  } catch {
    return false;
  }
}

export function buildWikimediaThumbUrl(imageUrl, width) {
  if (!isWikimediaUploadUrl(imageUrl)) return imageUrl;

  try {
    const url = new URL(imageUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const filename = parts[parts.length - 1];
    const hashA = parts[parts.length - 3];
    const hashB = parts[parts.length - 2];

    if (!filename || !hashA || !hashB) return imageUrl;

    return `${url.origin}/wikipedia/commons/thumb/${hashA}/${hashB}/${filename}/${width}px-${filename}`;
  } catch {
    return imageUrl;
  }
}

export function buildWikimediaThumbSrcSet(imageUrl, widths) {
  if (!isWikimediaUploadUrl(imageUrl)) return undefined;

  const entries = widths
    .map(width => `${buildWikimediaThumbUrl(imageUrl, width)} ${width}w`)
    .join(", ");

  return entries || undefined;
}
