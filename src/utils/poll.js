const POLL_DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard"
};

const POLL_DIFFICULTIES = Object.values(POLL_DIFFICULTY);
const POLL_SHOW_CHANCE = 0.15;
const POLL_SESSION_SEED = Math.random().toString(36).slice(2);

function hashString(input) {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seedText) {
  let state = hashString(seedText) || 1;

  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toInt(value) {
  return Number.isInteger(value) ? value : Number.parseInt(value, 10);
}

export function isValidPoll(poll) {
  if (!poll || typeof poll !== "object") return false;
  if (typeof poll.question !== "string" || !poll.question.trim()) return false;
  if (!Array.isArray(poll.options) || poll.options.length !== 3) return false;
  if (poll.options.some(option => typeof option !== "string" || !option.trim())) return false;

  const correctIndex = toInt(poll.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 2) return false;

  if (!POLL_DIFFICULTIES.includes(poll.difficulty)) return false;

  return true;
}

export function assertPostPollShape(post) {
  if (!post || typeof post !== "object") {
    throw new Error("Invalid post: expected object.");
  }

  if (!post.id) {
    throw new Error("Invalid post: missing id.");
  }

  if (!isValidPoll(post.poll)) {
    throw new Error(`Invalid poll for post ${post.id}.`);
  }
}

export function shouldRenderPoll({ postId, chance = POLL_SHOW_CHANCE }) {
  if (!postId) return false;

  const random = seededRandom(`${POLL_SESSION_SEED}:${postId}:show`);
  return random() < chance;
}

export function generatePollResults({ postId, correctIndex, difficulty }) {
  const safeCorrectIndex = Math.max(0, Math.min(2, toInt(correctIndex) || 0));
  const safeDifficulty = POLL_DIFFICULTIES.includes(difficulty) ? difficulty : POLL_DIFFICULTY.MEDIUM;
  const random = seededRandom(`${POLL_SESSION_SEED}:${postId}:${safeCorrectIndex}:${safeDifficulty}:results`);
  const totalVotes = 90 + Math.floor(random() * 900);
  const ratioRangeByDifficulty = {
    [POLL_DIFFICULTY.EASY]: { min: 0.55, max: 0.7 },
    [POLL_DIFFICULTY.MEDIUM]: { min: 0.7, max: 0.85 },
    [POLL_DIFFICULTY.HARD]: { min: 0.85, max: 1 }
  };

  const range = ratioRangeByDifficulty[safeDifficulty];
  const correctRatio = range.min + (range.max - range.min) * random();
  const correctVotes = Math.max(0, Math.min(totalVotes, Math.round(totalVotes * correctRatio)));
  const remainingVotes = totalVotes - correctVotes;

  const wrongIndices = [0, 1, 2].filter(index => index !== safeCorrectIndex);
  const wrongVotesA = remainingVotes === 0 ? 0 : Math.floor(remainingVotes * random());
  const wrongVotesB = remainingVotes - wrongVotesA;

  const counts = [0, 0, 0];
  counts[safeCorrectIndex] = correctVotes;
  counts[wrongIndices[0]] = wrongVotesA;
  counts[wrongIndices[1]] = wrongVotesB;

  const percentages = counts.map(count => (count / totalVotes) * 100);

  return {
    totalVotes,
    counts,
    percentages
  };
}

export { POLL_DIFFICULTY, POLL_DIFFICULTIES, POLL_SHOW_CHANCE };
