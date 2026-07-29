// tests/crud.test.mjs
//
// End-to-end test of the Firestore data layer against the local emulators.
// It signs in real test users through the Auth emulator, then exercises every
// CRUD path AS those users — so this verifies the service functions AND that
// firestore.rules allow the right things and block the wrong things.
//
// Run with:  npm run test:db
// (which starts the auth+firestore emulators, runs this file, then shuts them down)

// USE_EMULATOR must be set before firebase.js is imported, so we set it here and
// then dynamically import everything that touches Firebase.
process.env.USE_EMULATOR = "true";
process.env.VITE_FIREBASE_PROJECT_ID = "demo-instagram-clone";

let passed = 0;
let failed = 0;

function check(name, cond) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}   <-- FAILED`);
  }
}

async function expectDenied(name, fn) {
  try {
    await fn();
    failed++;
    console.log(`  ✗ ${name}   <-- FAILED (expected permission denied, but it succeeded)`);
  } catch (e) {
    const denied =
      e?.code === "permission-denied" ||
      /permission|insufficient/i.test(e?.message || "");
    if (denied) {
      passed++;
      console.log(`  ✓ ${name}`);
    } else {
      failed++;
      console.log(`  ✗ ${name}   <-- FAILED (wrong error: ${e?.message})`);
    }
  }
}

async function main() {
  const { auth } = await import("../src/firebase/firebase.js");
  const {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
  } = await import("firebase/auth");

  const {
    createUserProfile,
    getUserProfile,
    getUserByUsername,
    updateUserProfile,
    getSuggestions,
    createPost,
    getPost,
    getPostsByUser,
    getFeedPosts,
    deletePost,
    addComment,
    getCommentsForPost,
    deleteComment,
    likePost,
    unlikePost,
    toggleLike,
    hasLiked,
    getPostLikes,
    getLikedPostIds,
    savePost,
    getSavedPostIds,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing,
  } = await import("../src/services/index.js");

  // helper: create + sign in a fresh user, return uid
  async function makeUser(email) {
    try {
      await createUserWithEmailAndPassword(auth, email, "password123");
    } catch {
      await signInWithEmailAndPassword(auth, email, "password123");
    }
    return auth.currentUser.uid;
  }
  const as = (email) => signInWithEmailAndPassword(auth, email, "password123");

  console.log("\n=== Instagram clone :: Firestore data-layer tests ===\n");

  // ---- USERS ----
  console.log("users collection");
  const uidA = await makeUser("alice@test.com");
  await createUserProfile(uidA, {
    username: "alice.codes",
    name: "Alice",
    avatar: "https://i.pravatar.cc/150?img=1",
    email: "alice@test.com",
    bio: "React dev",
  });
  const profileA = await getUserProfile(uidA);
  check("createUserProfile + getUserProfile round-trips", profileA?.username === "alice.codes");
  check("new profile starts with zeroed counters", profileA.followersCount === 0 && profileA.postsCount === 0);

  const byName = await getUserByUsername("alice.codes");
  check("getUserByUsername finds the user", byName?.id === uidA);

  await updateUserProfile(uidA, { bio: "Senior React dev" });
  check("updateUserProfile edits own bio", (await getUserProfile(uidA)).bio === "Senior React dev");

  const uidB = await makeUser("bob@test.com");
  await createUserProfile(uidB, { username: "bob.builds", name: "Bob", email: "bob@test.com" });

  // rules: bob must NOT be able to rewrite alice's profile content
  await as("bob@test.com");
  await expectDenied("rules block editing another user's profile", () =>
    updateUserProfile(uidA, { bio: "hacked" })
  );

  // ---- POSTS ----
  console.log("\nposts collection");
  await as("alice@test.com");
  const postId = await createPost(
    { uid: uidA, username: "alice.codes", avatar: profileA.avatar },
    { image: "https://picsum.photos/id/1015/600/600", caption: "Tea gardens", location: "Munnar" }
  );
  const post = await getPost(postId);
  check("createPost + getPost round-trips", post?.caption === "Tea gardens");
  check("post starts with likesCount=0, commentsCount=0", post.likesCount === 0 && post.commentsCount === 0);
  check("createPost bumped author postsCount to 1", (await getUserProfile(uidA)).postsCount === 1);

  const byUser = await getPostsByUser(uidA);
  check("getPostsByUser returns the post", byUser.length === 1 && byUser[0].id === postId);

  // rules: bob cannot create a post claiming to be alice
  await as("bob@test.com");
  await expectDenied("rules block posting as another user", () =>
    createPost({ uid: uidA, username: "alice.codes" }, { image: "x" })
  );

  // ---- LIKES ----
  console.log("\nlikes");
  await as("bob@test.com");
  await likePost(postId, uidB);
  check("likePost increments likesCount", (await getPost(postId)).likesCount === 1);
  check("hasLiked is true after liking", await hasLiked(postId, uidB));
  await likePost(postId, uidB); // idempotent
  check("liking twice does not double-count", (await getPost(postId)).likesCount === 1);
  check("getPostLikes lists the liker", (await getPostLikes(postId)).includes(uidB));
  check("getLikedPostIds mirror contains the post", (await getLikedPostIds(uidB)).has(postId));
  const nowLiked = await toggleLike(postId, uidB);
  check("toggleLike un-likes (returns false)", nowLiked === false);
  check("likesCount back to 0 after unlike", (await getPost(postId)).likesCount === 0);
  await likePost(postId, uidB); // re-like for feed test later

  // ---- COMMENTS ----
  console.log("\ncomments");
  const cId = await addComment(postId, { uid: uidB, username: "bob.builds" }, "Stunning shot!");
  check("addComment increments commentsCount", (await getPost(postId)).commentsCount === 1);
  const comments = await getCommentsForPost(postId);
  check("getCommentsForPost returns the comment text", comments[0]?.text === "Stunning shot!");

  await as("alice@test.com"); // post owner can delete others' comments on her post
  await deleteComment(postId, cId);
  check("deleteComment (by post owner) decrements commentsCount", (await getPost(postId)).commentsCount === 0);

  // ---- FOLLOWS ----
  console.log("\nfollowers / following");
  await as("bob@test.com");
  await followUser(uidB, uidA);
  check("followUser: bob now follows alice", await isFollowing(uidB, uidA));
  check("alice followersCount incremented", (await getUserProfile(uidA)).followersCount === 1);
  check("bob followingCount incremented", (await getUserProfile(uidB)).followingCount === 1);
  check("getFollowers(alice) includes bob", (await getFollowers(uidA)).includes(uidB));
  check("getFollowing(bob) includes alice", (await getFollowing(uidB)).includes(uidA));
  await unfollowUser(uidB, uidA);
  check("unfollowUser reverses the follow", !(await isFollowing(uidB, uidA)));
  check("alice followersCount back to 0", (await getUserProfile(uidA)).followersCount === 0);

  // ---- SAVES ----
  console.log("\nsaved posts (bookmarks)");
  await savePost(postId, uidB);
  check("savePost records the bookmark", (await getSavedPostIds(uidB)).has(postId));

  // ---- FEED (UI-shaped output) ----
  console.log("\nfeed output shape (matches <Post/> / mockData)");
  const feed = await getFeedPosts(uidB, 20);
  const fp = feed.find((p) => p.id === postId);
  check("getFeedPosts returns the post", !!fp);
  check("feed post has UI fields (username, image, caption)", !!fp.username && !!fp.image && typeof fp.caption === "string");
  check("feed 'likes' is a number", typeof fp.likes === "number");
  check("feed 'comments' is an array of {id,username,text}", Array.isArray(fp.comments));
  check("feed 'liked' reflects viewer (bob liked it)", fp.liked === true);
  check("feed 'saved' reflects viewer (bob saved it)", fp.saved === true);
  check("feed 'timestamp' is a relative string", typeof fp.timestamp === "string" && fp.timestamp.length > 0);

  // ---- SUGGESTIONS ----
  console.log("\nsuggestions");
  const sugg = await getSuggestions(uidB, 5);
  check("getSuggestions excludes the current user", !sugg.some((s) => s.id === uidB));
  check("suggestion rows have {id,username,subtitle,avatar}", sugg.every((s) => s.username && s.avatar && "subtitle" in s));

  // ---- DELETE POST ----
  console.log("\ndelete post");
  await as("alice@test.com");
  await deletePost(postId, uidA);
  check("deletePost removes the post", (await getPost(postId)) === null);
  check("deletePost decremented author postsCount to 0", (await getUserProfile(uidA)).postsCount === 0);

  await signOut(auth).catch(() => {});

  console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===\n`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error("\nTest harness crashed:", e);
  process.exit(1);
});
