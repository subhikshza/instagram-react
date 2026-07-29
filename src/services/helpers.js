// src/services/helpers.js
// Small shared utilities used by the service layer.

/**
 * Convert a Firestore Timestamp (or Date, or millis) into the uppercase
 * relative-time string the UI expects, e.g. "2 HOURS AGO", "1 DAY AGO".
 * Falls back to "JUST NOW" for very recent / missing timestamps.
 */
export function timeAgo(value) {
  if (!value) return "JUST NOW";

  let date;
  if (typeof value.toDate === "function") date = value.toDate(); // Firestore Timestamp
  else if (value instanceof Date) date = value;
  else if (typeof value === "number") date = new Date(value);
  else if (value.seconds) date = new Date(value.seconds * 1000);
  else return "JUST NOW";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "JUST NOW";

  const units = [
    ["YEAR", 31536000],
    ["MONTH", 2592000],
    ["WEEK", 604800],
    ["DAY", 86400],
    ["HOUR", 3600],
    ["MINUTE", 60],
  ];
  for (const [label, secs] of units) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${label}${n > 1 ? "S" : ""} AGO`;
  }
  return "JUST NOW";
}

/**
 * Turn a Firestore post document + viewer context into the EXACT object
 * shape the <Post /> component consumes (see src/data/mockData.js).
 *
 * @param {object} postDoc  - { id, ...fields } from Firestore
 * @param {object} ctx
 * @param {Set<string>} [ctx.likedPostIds]  - post ids the viewer has liked
 * @param {Set<string>} [ctx.savedPostIds]  - post ids the viewer has saved
 * @param {Array}       [ctx.comments]      - preview comments for this post
 */
export function toFeedPost(postDoc, ctx = {}) {
  const { likedPostIds = new Set(), savedPostIds = new Set(), comments = [] } =
    ctx;
  return {
    id: postDoc.id,
    uid: postDoc.uid,
    username: postDoc.username,
    avatar: postDoc.avatar,
    location: postDoc.location || "",
    image: postDoc.image,
    caption: postDoc.caption || "",
    likes: postDoc.likesCount ?? 0,
    comments: comments.map((c) => ({
      id: c.id,
      username: c.username,
      text: c.text,
    })),
    timestamp: timeAgo(postDoc.createdAt),
    liked: likedPostIds.has(postDoc.id),
    saved: savedPostIds.has(postDoc.id),
  };
}

/** Map a Firestore user doc to the `suggestions` row shape used by the UI. */
export function toSuggestion(userDoc) {
  return {
    id: userDoc.id,
    username: userDoc.username,
    subtitle: userDoc.bio || "New to Instagram",
    avatar: userDoc.avatar,
  };
}
