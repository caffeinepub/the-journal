import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, MessageCircle, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddComment,
  useAddLike,
  useCallerUserProfile,
  useCommentsByPost,
  useDeleteComment,
  useDeletePost,
  useIsAdmin,
  usePostById,
} from "../hooks/useQueries";
import {
  CATEGORY_BG_COLORS,
  CATEGORY_LABELS,
  formatDate,
} from "../utils/category";

function renderBodyWithImages(body: string) {
  const parts = body.split(/(\[image:[^\]]+\])/g);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const imageMatch = part.match(/^\[image:([^\]]+)\]$/);
    if (imageMatch) {
      nodes.push(
        <img
          key={`img-${i}`}
          src={imageMatch[1]}
          alt=""
          aria-hidden="true"
          className="w-full rounded-lg my-4 object-cover max-h-96"
        />,
      );
    } else if (part) {
      nodes.push(
        <span
          key={`text-${i}`}
          className="whitespace-pre-wrap text-foreground leading-relaxed block"
        >
          {part}
        </span>,
      );
    }
  }
  return (
    <div className="prose prose-lg max-w-none mb-10 space-y-2">{nodes}</div>
  );
}

export default function PostDetailPage() {
  const { id } = useParams({ from: "/post/$id" });
  const postId = BigInt(id);
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: post, isLoading: postLoading } = usePostById(postId);
  const { data: comments = [], isLoading: commentsLoading } =
    useCommentsByPost(postId);
  const addLike = useAddLike();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const deletePost = useDeletePost();
  const { data: isAdmin } = useIsAdmin();
  const { data: callerProfile } = useCallerUserProfile();

  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    try {
      await addLike.mutateAsync(postId);
      setLiked(true);
    } catch {
      toast.error("Could not like post");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    const name = commentName.trim() || callerProfile?.name || "Anonymous";
    try {
      await addComment.mutateAsync({
        id: BigInt(0),
        postId,
        authorName: name,
        body: commentBody.trim(),
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      setCommentBody("");
      setCommentName("");
      toast.success("Comment added!");
    } catch {
      toast.error("Could not post comment");
    }
  };

  const handleDeleteComment = async (commentId: bigint) => {
    try {
      await deleteComment.mutateAsync({ postId, commentId });
      toast.success("Comment deleted");
    } catch {
      toast.error("Could not delete comment");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Delete this post? This action cannot be undone.")) return;
    try {
      await deletePost.mutateAsync(postId);
      toast.success("Post deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Could not delete post");
    }
  };

  if (postLoading) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-4"
        data-ocid="post.loading_state"
      >
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center"
        data-ocid="post.error_state"
      >
        <p className="text-muted-foreground">Post not found.</p>
        <Link to="/">
          <Button className="mt-4">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const isAuthor =
    identity && post.authorId.toString() === identity.getPrincipal().toString();
  const canEdit = isAdmin || !!isAuthor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        data-ocid="post.back.link"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <span
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${CATEGORY_BG_COLORS[post.category]}`}
      >
        {CATEGORY_LABELS[post.category]}
      </span>

      <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-foreground mb-6">
        {post.title}
      </h1>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          {post.authorName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {post.authorName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(post.createdAt)}
          </p>
        </div>
        {canEdit && (
          <div className="ml-auto flex items-center gap-2">
            <Link to="/edit/$id" params={{ id: id }}>
              <Button variant="outline" size="sm" data-ocid="post.edit.button">
                Edit Post
              </Button>
            </Link>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeletePost}
                disabled={deletePost.isPending}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                data-ocid="post.delete_button"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                {deletePost.isPending ? "Deleting..." : "Delete"}
              </Button>
            )}
          </div>
        )}
      </div>

      {post.coverImageUrl ? (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full rounded-xl mb-8 object-cover max-h-96"
        />
      ) : null}

      {renderBodyWithImages(post.body)}

      <div className="flex items-center gap-4 py-6 border-y border-border mb-10">
        <button
          type="button"
          onClick={handleLike}
          disabled={liked || addLike.isPending}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
            liked
              ? "bg-red-50 border-red-200 text-red-500"
              : "border-border text-muted-foreground hover:border-red-200 hover:text-red-500 hover:bg-red-50"
          }`}
          data-ocid="post.like.button"
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
          <span className="text-sm font-medium">
            {(post.likeCount + (liked ? 1n : 0n)).toString()} Likes
          </span>
        </button>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
          <span className="text-sm">{comments.length} Comments</span>
        </div>
      </div>

      <section>
        <h2 className="font-serif text-2xl font-bold mb-6">Comments</h2>

        {commentsLoading ? (
          <div className="space-y-4" data-ocid="comments.loading_state">
            {Array.from({ length: 3 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div
            className="py-8 text-center text-muted-foreground"
            data-ocid="comments.empty_state"
          >
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {comments.map((comment, i) => (
              <div
                key={comment.id.toString()}
                className="group"
                data-ocid={`comments.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {comment.authorName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      data-ocid={`comments.delete_button.${i + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-foreground mt-2 ml-9 whitespace-pre-wrap">
                  {comment.body}
                </p>
                {i < comments.length - 1 && <Separator className="mt-5" />}
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#F5F5F5] rounded-xl p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">
            Leave a Comment
          </h3>
          <form onSubmit={handleComment} className="space-y-4">
            <div>
              <Label htmlFor="comment-name">Name</Label>
              <Input
                id="comment-name"
                placeholder={callerProfile?.name || "Your name"}
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                className="mt-1 bg-white"
                data-ocid="comment.name.input"
              />
            </div>
            <div>
              <Label htmlFor="comment-body">Message</Label>
              <Textarea
                id="comment-body"
                placeholder="Share your thoughts..."
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                rows={4}
                className="mt-1 bg-white resize-none"
                required
                data-ocid="comment.body.textarea"
              />
            </div>
            <Button
              type="submit"
              disabled={!commentBody.trim() || addComment.isPending}
              data-ocid="comment.submit.button"
            >
              {addComment.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        </div>
      </section>
    </motion.div>
  );
}
