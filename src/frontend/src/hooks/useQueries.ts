import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BlogPost, Category, Comment, UserProfile } from "../backend";
import { createActorWithConfig } from "../config";
import { useActor } from "./useActor";

export function useAllPosts() {
  const { actor } = useActor();
  return useQuery<BlogPost[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      // Use the authenticated actor if available, otherwise create an anonymous one
      const a = actor || (await createActorWithConfig());
      return a.getAllPosts();
    },
    // Always enabled — posts are public and should load for everyone
    enabled: true,
    refetchOnMount: true,
  });
}

export function usePostById(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<BlogPost>({
    queryKey: ["post", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getPostById(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCommentsByPost(postId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Comment[]>({
    queryKey: ["comments", postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommentsByPost(postId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSeedSample() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.seedSample();
      // Attach cover images to the two sample posts
      try {
        const [post1, post2] = await Promise.all([
          actor.getPostById(BigInt(1)),
          actor.getPostById(BigInt(2)),
        ]);
        await Promise.all([
          actor.updatePost(BigInt(1), {
            ...post1,
            coverImageUrl:
              "/assets/generated/cover-romance-anime.dim_800x450.jpg",
          }),
          actor.updatePost(BigInt(2), {
            ...post2,
            coverImageUrl:
              "/assets/generated/cover-japan-travel.dim_800x450.jpg",
          }),
        ]);
      } catch {
        // Cover image update is best-effort
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: BlogPost) => {
      if (!actor) throw new Error("No actor");
      return actor.createPost(post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, post }: { id: bigint; post: BlogPost }) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePost(id, post);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id.toString()] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deletePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useAddLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.addLikeToPost(postId);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ["post", postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: Comment) => {
      if (!actor) throw new Error("No actor");
      return actor.addCommentToPost(comment);
    },
    onSuccess: (_, comment) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", comment.postId.toString()],
      });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
    }: { postId: bigint; commentId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteComment(postId, commentId);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", postId.toString()],
      });
    },
  });
}

// Accept plain strings and convert to Candid-compatible format internally
export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: {
      name: string;
      about: string;
      profilePicUrl: string;
    }) => {
      if (!actor) throw new Error("Not signed in");
      // Explicitly convert to Candid opt format ([] | [string]) so the
      // actor never receives undefined for optional fields.
      const candidProfile = {
        name: profile.name,
        about: profile.about.trim() ? [profile.about.trim()] : ([] as string[]),
        profilePicUrl: profile.profilePicUrl
          ? [profile.profilePicUrl]
          : ([] as string[]),
      };
      return actor.saveCallerUserProfile(candidProfile as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useSetAdminRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      principal,
      isAdmin,
    }: {
      principal: import("@icp-sdk/core/principal").Principal;
      isAdmin: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.setAdminRole(principal, isAdmin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
