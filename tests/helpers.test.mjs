// tests/helpers.test.mjs
// Pure-logic tests that need no Firebase — runnable anywhere with plain node.
// Verifies the time formatter and the UI-shape mapper that turns Firestore docs
// into the exact object shape <Post/> consumes.

import { timeAgo, toFeedPost, toSuggestion } from "../src/services/helpers.js";

let pass = 0, fail = 0;
const check = (n, c) => (c ? (pass++, console.log(`  ✓ ${n}`)) : (fail++, console.log(`  ✗ ${n}  <-- FAILED`)));

const HOUR = 3600 * 1000, DAY = 86400 * 1000;

console.log("\ntimeAgo()");
check("2h ago -> '2 HOURS AGO'", timeAgo(new Date(Date.now() - 2 * HOUR)) === "2 HOURS AGO");
check("1 day ago -> '1 DAY AGO'", timeAgo(new Date(Date.now() - DAY)) === "1 DAY AGO");
check("30s ago -> 'JUST NOW'", timeAgo(new Date(Date.now() - 30 * 1000)) === "JUST NOW");
check("missing -> 'JUST NOW'", timeAgo(null) === "JUST NOW");
check("Firestore Timestamp-like {seconds} works", timeAgo({ seconds: Math.floor((Date.now() - 5 * HOUR) / 1000) }) === "5 HOURS AGO");
check("Firestore Timestamp toDate() works", timeAgo({ toDate: () => new Date(Date.now() - 3 * HOUR) }) === "3 HOURS AGO");

console.log("\ntoFeedPost() — output must match mockData post shape");
const raw = {
  id: "p1", username: "kiran.travels", avatar: "a.png", location: "Munnar",
  image: "img.jpg", caption: "Tea gardens", likesCount: 482, commentsCount: 2,
  createdAt: new Date(Date.now() - 2 * HOUR),
};
const fp = toFeedPost(raw, {
  likedPostIds: new Set(["p1"]),
  savedPostIds: new Set(),
  comments: [{ id: "c1", username: "meera.codes", text: "Stunning" }],
});
const expectedKeys = ["id","username","avatar","location","image","caption","likes","comments","timestamp","liked","saved"];
check("has exactly the mockData keys", expectedKeys.every((k) => k in fp) && Object.keys(fp).length === expectedKeys.length);
check("likesCount -> likes (number)", fp.likes === 482);
check("liked flag from likedPostIds", fp.liked === true);
check("saved flag from savedPostIds", fp.saved === false);
check("comments mapped to {id,username,text}", fp.comments[0].text === "Stunning" && Object.keys(fp.comments[0]).join() === "id,username,text");
check("timestamp is relative string", fp.timestamp === "2 HOURS AGO");
check("missing location/caption default to ''", (() => { const x = toFeedPost({ id: "p2", likesCount: 0 }, {}); return x.location === "" && x.caption === ""; })());

console.log("\ntoSuggestion() — output must match suggestions row shape");
const s = toSuggestion({ id: "u1", username: "devika.ml", bio: "", avatar: "av.png" });
check("has {id,username,subtitle,avatar}", ["id","username","subtitle","avatar"].every((k) => k in s));
check("empty bio -> 'New to Instagram'", s.subtitle === "New to Instagram");
check("bio used as subtitle when present", toSuggestion({ id: "u2", username: "x", bio: "Followed by rahul_dev", avatar: "a" }).subtitle === "Followed by rahul_dev");

console.log(`\n=== helpers: ${pass} passed, ${fail} failed ===\n`);
process.exit(fail ? 1 : 0);
