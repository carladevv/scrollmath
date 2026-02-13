function normalizeWhitespace(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function stripHtml(html = "") {
  return normalizeWhitespace(html.replace(/<[^>]+>/g, " "));
}

function countWords(text = "") {
  const cleaned = normalizeWhitespace(text);
  if (!cleaned) return 0;
  return cleaned.split(" ").length;
}

function splitIntoMathAwareParts(text = "") {
  const mathRegex = /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g;
  const parts = [];
  let lastIndex = 0;
  let match = null;

  while ((match = mathRegex.exec(text)) !== null) {
    const start = match.index;
    const end = mathRegex.lastIndex;

    if (start > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, start) });
    }

    parts.push({ type: "math", value: match[0] });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts;
}

export function buildMathAwarePreviewFromHtml(html = "", maxWords = 14) {
  const text = stripHtml(html);
  if (!text) return "";

  const parts = splitIntoMathAwareParts(text);
  const tokens = [];
  let wordsUsed = 0;
  let truncated = false;

  for (const part of parts) {
    if (wordsUsed >= maxWords) {
      truncated = true;
      break;
    }

    if (part.type === "text") {
      const words = normalizeWhitespace(part.value).split(" ").filter(Boolean);
      const remaining = maxWords - wordsUsed;

      if (words.length > remaining) {
        tokens.push(...words.slice(0, remaining));
        wordsUsed += remaining;
        truncated = true;
        break;
      }

      tokens.push(...words);
      wordsUsed += words.length;
      continue;
    }

    const mathWordCount = countWords(
      part.value
        .replace(/^\\\(/, "")
        .replace(/\\\)$/, "")
        .replace(/^\\\[/, "")
        .replace(/\\\]$/, "")
    );

    if (wordsUsed + mathWordCount <= maxWords) {
      tokens.push(part.value);
      wordsUsed += mathWordCount;
    } else {
      truncated = true;
      break;
    }
  }

  const preview = tokens.join(" ").trim();
  if (!preview) return "";
  return truncated ? `${preview}...` : preview;
}

