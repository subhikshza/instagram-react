# Instagram clone — Database & CRUD layer (Member 2)

This is the Firestore data layer for the app: the schema, the CRUD functions the
rest of the team calls, the security rules, and tests. It's built to plug into
the existing React frontend with minimal changes — every read returns data in
the same shape the components already render (`src/data/mockData.js`).

## What's in here

```
src/firebase/firebase.js     Firebase init (emulator-aware upgrade of the existing file)
src/services/
  users.js       create/get/update/delete profiles, getSuggestions()
  posts.js       createPost, getPost, getPostsByUser, getFeedPosts, deletePost, subscribeToFeed
  comments.js    addComment, getCommentsForPost, deleteComment, subscribeToComments
  likes.js       likePost, unlikePost, toggleLike, hasLiked, getLikedPostIds
  saves.js       savePost, unsavePost, toggleSave  (drives the "saved" bookmark flag)
  follows.js     followUser, unfollowUser, isFollowing, getFollowers, getFollowing
  storage.js     uploadPostImage, uploadAvatar  (shared with Member 3 — image upload)
  helpers.js     timeAgo(), toFeedPost(), toSuggestion()  (Firestore doc -> UI shape)
  index.js       barrel: import anything from "../services"
firestore.rules            security rules
firestore.indexes.json     composite index for getPostsByUser
storage.rules              storage security rules
tests/crud.test.mjs        full read/write test against the emulator
tests/helpers.test.mjs     pure-logic tests (no Firebase needed)
```

See **SCHEMA.md** for the full data model and design rationale.

## Install

Add these files into the repo. Copy `src/services/`, the root config files
(`firestore.rules`, `firestore.indexes.json`, `firebase.json`, `storage.rules`),
and merge `src/firebase/firebase.js` over the existing one (same exports, so
nothing breaks).

Your repo already has a `package.json` — **don't overwrite it.** Just merge in
these two `scripts` and the one devDependency (that's all my `package.json` here
adds):

```jsonc
"scripts": {
  "test:db": "firebase emulators:exec --only auth,firestore --project demo-instagram-clone \"node tests/crud.test.mjs\"",
  "emulators": "firebase emulators:start --only auth,firestore,storage --project demo-instagram-clone"
},
"devDependencies": { "firebase-tools": "^13.0.0" }
```

Then from the project root:

```bash
npm install                      # firebase is already a dependency
npm install -D firebase-tools    # only needed to run the DB tests
```

## Using it in the frontend

The frontend currently imports mock data. Swapping to the real DB is a small
change per component. For example, `Feed.jsx`:

```jsx
import { useEffect, useState } from "react";
import { getFeedPosts } from "../services";
import { auth } from "../firebase/firebase";
import Post from "./Post";
import Stories from "./Stories";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getFeedPosts(auth.currentUser?.uid).then(setPosts);
  }, []);

  return (
    <div>
      <Stories />
      {posts.map((post) => <Post key={post.id} post={post} />)}
    </div>
  );
}
```

`getFeedPosts()` returns the identical shape `Post` already expects, so `Post.jsx`
needs no changes. Other common calls:

```js
import {
  createUserProfile, createPost, addComment, toggleLike, followUser,
  getSuggestions, uploadPostImage,
} from "../services";

// after signup (Member 1's auth gives you `user`):
await createUserProfile(user.uid, { username, name, avatar: user.photoURL, email: user.email });

// create a post (image upload is Member 3's area, helper provided):
const image = await uploadPostImage(file, user.uid);
await createPost({ uid: user.uid, username, avatar }, { image, caption, location });

// like / comment / follow:
await toggleLike(postId, user.uid);
await addComment(postId, { uid: user.uid, username }, "nice shot!");
await followUser(user.uid, targetUid);
```

## Environment variables (local + Vercel)

Copy `.env.example` to `.env` for local dev and fill in the Firebase values.
In **Vercel → Project → Settings → Environment Variables**, add the same
`VITE_FIREBASE_*` keys. Vite only exposes variables prefixed with `VITE_`, and
they're read at build time — so after adding them in Vercel, redeploy.

Do **not** set `VITE_USE_EMULATOR` in production.

## Running the database tests

The main test signs in real test users through the Auth emulator and runs every
CRUD path against the actual security rules — no real Firebase project touched,
nothing billed:

```bash
npm run test:db      # boots auth+firestore emulators, runs tests/crud.test.mjs, shuts down
```

Requires Java (for the emulators) and `firebase-tools`. The pure-logic tests need
neither Firebase nor the emulator:

```bash
node tests/helpers.test.mjs
```

## Security rules summary

Anyone signed in can read the public feed, profiles, comments and the follow
graph. You can only write your own data. The denormalized counters
(`likesCount`, `commentsCount`, `followersCount`, `followingCount`) are the one
exception — any signed-in user may change *only* those fields on another user's
post/profile, which is what lets like/comment/follow update counts without Cloud
Functions. Deploy rules with:

```bash
firebase deploy --only firestore:rules,storage
```
