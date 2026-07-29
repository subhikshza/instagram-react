# Firestore data model — Instagram clone

This is the database design for the app. The guiding rule was: **the data layer
should hand the frontend objects in the exact shape it already renders** (see
`src/data/mockData.js`), so switching the app from mock data to Firestore is a
drop-in change rather than a rewrite.

## Collections at a glance

```
users/{uid}                          <- profile; doc id == Firebase Auth uid
   ├─ likes/{postId}                 <- mirror: posts THIS user liked (fast feed enrichment)
   ├─ saved/{postId}                 <- bookmarked posts (drives the `saved` flag)
   ├─ following/{targetUid}          <- who this user follows
   └─ followers/{followerUid}        <- who follows this user

posts/{postId}                       <- one post; author info denormalized onto it
   ├─ comments/{commentId}           <- comments on the post
   └─ likes/{likerUid}               <- one doc per liker (source of truth for likes)
```

The rubric's five collections — **users, posts, comments, likes, followers** —
are all here. Comments and likes live as **subcollections under the post** they
belong to (Firestore's recommended pattern for one-to-many), and the follow
graph is stored as `following` / `followers` subcollections under each user.
`saved` and the per-user `likes` mirror are small extras that make the UI's
`saved` / `liked` flags cheap to compute.

## Document fields

**users/{uid}**

| field | type | notes |
|---|---|---|
| username | string | unique handle, e.g. `alice.codes` |
| name | string | display name |
| avatar | string | photo URL |
| email | string | from auth |
| bio | string | used as the "subtitle" in Suggestions |
| followersCount / followingCount / postsCount | number | denormalized counters |
| createdAt | timestamp | server time |

**posts/{postId}**

| field | type | notes |
|---|---|---|
| uid | string | author's uid |
| username / avatar | string | denormalized author info, so the feed needs no extra reads |
| image | string | Storage download URL |
| caption / location | string | |
| likesCount / commentsCount | number | kept in sync via batched writes |
| createdAt | timestamp | feed is ordered by this, and it becomes the `"2 HOURS AGO"` label |

**posts/{postId}/comments/{commentId}** — `uid`, `username`, `text`, `createdAt`
**posts/{postId}/likes/{likerUid}** — `uid`, `createdAt` (doc existence == liked)
**follow / like / saved edges** — small docs holding the related id + `createdAt`

## Why denormalized counters

Reading "how many likes does this post have" by counting a subcollection costs
one read per like. Instead, each like/comment/follow writes the edge document
**and** increments a counter on the parent in the same `writeBatch`, so the
count is always one field read. The security rules allow any signed-in user to
change *only* those counter fields on someone else's post/profile, and nothing
else — see `firestore.rules`.

## How it maps to the UI

`getFeedPosts(viewerUid)` returns objects with exactly these keys —
`id, username, avatar, location, image, caption, likes, comments, timestamp,
liked, saved` — the same shape as each entry in `posts` in `mockData.js`.
`getSuggestions()` returns `{ id, username, subtitle, avatar }`, matching the
`suggestions` array. That's what makes the frontend swap a one-line change per
component.
