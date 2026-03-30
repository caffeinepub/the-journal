import { Input } from "@/components/ui/input";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Category } from "../backend";
import BookIcon from "../components/BookIcon";
import PostCard from "../components/PostCard";
import PostCardSkeleton from "../components/PostCardSkeleton";
import { useAllPosts, useSeedSample } from "../hooks/useQueries";
import { CATEGORY_LABELS } from "../utils/category";

const CHIPS = [
  { label: "All", value: "all" },
  ...Object.values(Category).map((c) => ({
    label: CATEGORY_LABELS[c],
    value: c,
  })),
];

export default function HomePage() {
  const { data: posts, isLoading } = useAllPosts();
  const seedSample = useSeedSample();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { category?: string };

  const [activeCategory, setActiveCategory] = useState<string>(
    search.category || "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (search.category) {
      setActiveCategory(search.category);
    }
  }, [search.category]);

  useEffect(() => {
    if (!seeded && posts !== undefined && posts.length === 0) {
      setSeeded(true);
      seedSample.mutate();
    }
  }, [posts, seeded, seedSample]);

  const filtered = (posts || []).filter((p) => {
    const matchCategory =
      activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleChipClick = (value: string) => {
    setActiveCategory(value);
    if (value !== "all") {
      navigate({ to: "/", search: { category: value } });
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <>
      {/* Hero Band */}
      <section className="bg-[#F5F5F5] border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <BookIcon className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              THE JOURNAL
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-muted-foreground text-lg max-w-lg mx-auto"
          >
            Insightful stories, diverse voices, community curation.
          </motion.p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search + Category filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2" data-ocid="category.filter.tab">
            {CHIPS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => handleChipClick(chip.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === chip.value
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#EFEFEF] text-[#333] hover:bg-[#E0E0E0]"
                }`}
                data-ocid={`category.${chip.value}.tab`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-ocid="home.search_input"
            />
          </div>
        </div>

        {isLoading || seedSample.isPending ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            data-ocid="posts.loading_state"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" data-ocid="posts.empty_state">
            <div className="text-5xl mb-4">✦</div>
            <p className="text-muted-foreground text-lg">
              No posts found in this category yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Be the first to write something!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <PostCard key={post.id.toString()} post={post} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
