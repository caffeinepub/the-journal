import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BlogPost {
    id: bigint;
    coverImageUrl?: string;
    title: string;
    likeCount: bigint;
    authorId: Principal;
    body: string;
    createdAt: bigint;
    authorName: string;
    likes: Array<Principal>;
    category: Category;
}
export interface Comment {
    id: bigint;
    body: string;
    createdAt: bigint;
    authorName: string;
    postId: bigint;
}
export interface UserInfo {
    principal: Principal;
    role: UserRole;
    profile?: UserProfile;
}
export interface UserProfile {
    name: string;
    about?: Array<string>;
    profilePicUrl?: Array<string>;
}
export type ActivityKind = { like: null } | { comment: null } | { post: null };
export interface ActivityItem {
    kind: ActivityKind;
    actorName: string;
    postTitle: string;
    postId: bigint;
    timestamp: bigint;
}
export interface PostStats {
    postId: bigint;
    title: string;
    views: bigint;
    likes: bigint;
    comments: bigint;
}
export interface AnalyticsResult {
    posts: Array<PostStats>;
    totalViews: bigint;
    totalLikes: bigint;
    totalComments: bigint;
    recentActivity: Array<ActivityItem>;
}
export enum Category {
    anime = "anime",
    recipes = "recipes",
    other = "other",
    travel = "travel",
    tech = "tech",
    lifestyle = "lifestyle",
    health = "health",
    poetries = "poetries"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCommentToPost(comment: Comment): Promise<bigint>;
    addLikeToPost(postId: bigint, penName: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(post: BlogPost): Promise<{
        id: bigint;
        createdAt: bigint;
    }>;
    deleteComment(postId: bigint, commentId: bigint): Promise<void>;
    deletePost(postId: bigint): Promise<void>;
    getAllCategories(): Promise<Array<Category>>;
    getAllPosts(): Promise<Array<BlogPost>>;
    getAnalytics(): Promise<AnalyticsResult>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsByPost(postId: bigint): Promise<Array<Comment>>;
    getPopularPosts(limit: bigint): Promise<Array<BlogPost>>;
    getPostById(id: bigint): Promise<BlogPost>;
    getPostsByCategory(category: Category): Promise<Array<BlogPost>>;
    getUniqueAuthors(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUsers(): Promise<Array<UserInfo>>;
    isCallerAdmin(): Promise<boolean>;
    recordPostView(postId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    seedSample(): Promise<void>;
    setAdminRole(user: Principal, isAdmin: boolean): Promise<void>;
    updatePost(postId: bigint, post: BlogPost): Promise<void>;
}
