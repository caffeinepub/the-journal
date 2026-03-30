import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import type { BlogPost } from "../backend";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatDate,
} from "../utils/category";

interface PostCardProps {
  post: BlogPost;
  index?: number;
}

const FALLBACK_GRADIENTS: Record<string, string> = {
  health: "from-emerald-100 to-emerald-200",
  anime: "from-orange-100 to-pink-200",
  lifestyle: "from-amber-100 to-yellow-200",
  travel: "from-teal-100 to-cyan-200",
  recipes: "from-blue-100 to-indigo-200",
  tech: "from-slate-100 to-gray-200",
  other: "from-gray-100 to-gray-200",
};

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const gradient =
    FALLBACK_GRADIENTS[post.category] || FALLBACK_GRADIENTS.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
    >
      <Link
        to="/post/$id"
        params={{ id: post.id.toString() }}
        className="group block h-full"
      >
        <article className="h-full bg-white rounded-xl border border-border shadow-card hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col">
          {/* Cover image */}
          <div className="aspect-video w-full overflow-hidden">
            {post.coverImageUrl ? (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <span className="text-4xl opacity-40">✦</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-5">
            <span
              className={`text-xs font-semibold uppercase tracking-wide mb-2 ${CATEGORY_COLORS[post.category]}`}
            >
              {CATEGORY_LABELS[post.category]}
            </span>
            <h2 className="font-serif font-bold text-xl leading-snug text-foreground line-clamp-3 mb-3 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
              {post.body.slice(0, 120).replace(/\n/g, " ")}
              {post.body.length > 120 ? "..." : ""}
            </p>

            {/* Meta row */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {post.authorName.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-medium text-foreground">
                    {post.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">
                    · {formatDate(post.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" />
                  {post.likeCount.toString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
