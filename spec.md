# The Journal

## Current State
A multi-author blog platform with categories, user registration (Internet Identity), comments, likes, profile editing, image uploads, and an admin dashboard. Likes and post creation require a signed-in user. The admin dashboard shows posts, users, and seed data tabs.

## Requested Changes (Diff)

### Add
- Pen-name-based liking: any visitor with a pen name (from localStorage) can like a post without signing in
- Post view counter: `recordPostView(postId)` called when a post is opened, tracked anonymously
- Activity feed backend: stores recent likes (with pen name), recent comments, and new posts in a time-ordered list
- `getActivityFeed(limit)` query for admin — returns recent activity items (kind: like/comment/post, actorName, postTitle, postId, timestamp)
- `getAnalytics()` query for admin — returns array of per-post stats (postId, title, views, likes, comments) plus site totals
- Analytics tab in AdminDashboard showing: total views/likes/comments cards, per-post stats table, recent activity feed

### Modify
- `addLikeToPost(postId, penName)` — removes auth requirement, deduplicates by pen name using a separate `anonLikes: Map<Nat, Set<Text>>` map, still updates likeCount on the post
- Frontend `useAddLike` mutation — now passes pen name from localStorage alongside postId
- PostDetailPage like button — works for any visitor who has a pen name (stored in localStorage); if no pen name, prompts them to set one via the welcome popup
- Comment form — already allows any name; no changes needed

### Remove
- Nothing removed

## Implementation Plan
1. Update `main.mo`: add anonLikes map, postViews map, activityFeed list, ActivityItem type, PostStats type; update addLikeToPost signature; add recordPostView, getActivityFeed, getAnalytics methods
2. Update `backend.d.ts`: add new types (ActivityItem, PostStats, AnalyticsResult) and method signatures
3. Update `useQueries.ts`: update useAddLike to pass penName; add useRecordPostView, useActivityFeed, useAnalytics hooks
4. Update PostDetailPage: call recordPostView on mount; update handleLike to use stored pen name
5. Update AdminDashboard: add Analytics tab with summary cards and activity feed
