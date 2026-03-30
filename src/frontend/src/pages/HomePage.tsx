import { Input } from "@/components/ui/input";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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

const SCENES = [
  {
    id: "scenery",
    gradient: "linear-gradient(135deg, #a8d8a8 0%, #87ceeb 50%, #e8f4fd 100%)",
    elements: [
      {
        char: "🏔️",
        style: { top: "10%", left: "8%", fontSize: "3.5rem", opacity: 0.5 },
      },
      {
        char: "☁️",
        style: { top: "15%", left: "30%", fontSize: "2.8rem", opacity: 0.45 },
      },
      {
        char: "☁️",
        style: { top: "8%", right: "20%", fontSize: "2rem", opacity: 0.35 },
      },
      {
        char: "🌿",
        style: { bottom: "20%", left: "15%", fontSize: "2.5rem", opacity: 0.5 },
      },
      {
        char: "🌲",
        style: { bottom: "15%", left: "35%", fontSize: "3rem", opacity: 0.4 },
      },
      {
        char: "🌸",
        style: {
          bottom: "25%",
          right: "18%",
          fontSize: "2.5rem",
          opacity: 0.4,
        },
      },
      {
        char: "🌊",
        style: { bottom: "10%", right: "8%", fontSize: "3rem", opacity: 0.4 },
      },
      {
        char: "✦",
        style: { top: "40%", left: "5%", fontSize: "1.2rem", opacity: 0.3 },
      },
    ],
  },
  {
    id: "anime",
    gradient: "linear-gradient(135deg, #f9d4f5 0%, #c9a8f5 50%, #fce4f0 100%)",
    elements: [
      {
        char: "✨",
        style: { top: "12%", left: "10%", fontSize: "2.5rem", opacity: 0.55 },
      },
      {
        char: "🌸",
        style: { top: "8%", left: "35%", fontSize: "3rem", opacity: 0.5 },
      },
      {
        char: "⭐",
        style: { top: "20%", right: "12%", fontSize: "2rem", opacity: 0.4 },
      },
      {
        char: "🌸",
        style: {
          bottom: "18%",
          left: "20%",
          fontSize: "2.8rem",
          opacity: 0.45,
        },
      },
      {
        char: "✨",
        style: {
          bottom: "28%",
          right: "15%",
          fontSize: "2.2rem",
          opacity: 0.5,
        },
      },
      {
        char: "星",
        style: { top: "35%", left: "6%", fontSize: "2rem", opacity: 0.25 },
      },
      {
        char: "花",
        style: { bottom: "35%", right: "6%", fontSize: "2rem", opacity: 0.25 },
      },
      {
        char: "💫",
        style: { top: "55%", left: "12%", fontSize: "1.8rem", opacity: 0.4 },
      },
    ],
  },
  {
    id: "recipes",
    gradient: "linear-gradient(135deg, #fde8c8 0%, #f5c88a 50%, #fff8f0 100%)",
    elements: [
      {
        char: "🍜",
        style: { top: "10%", left: "8%", fontSize: "3rem", opacity: 0.5 },
      },
      {
        char: "☕",
        style: { top: "15%", right: "15%", fontSize: "2.8rem", opacity: 0.45 },
      },
      {
        char: "🌿",
        style: { top: "30%", left: "5%", fontSize: "2rem", opacity: 0.4 },
      },
      {
        char: "🫐",
        style: {
          bottom: "20%",
          left: "18%",
          fontSize: "2.5rem",
          opacity: 0.45,
        },
      },
      {
        char: "🍋",
        style: {
          bottom: "15%",
          right: "20%",
          fontSize: "2.8rem",
          opacity: 0.4,
        },
      },
      {
        char: "🥐",
        style: { top: "10%", left: "55%", fontSize: "2.5rem", opacity: 0.4 },
      },
      {
        char: "🌾",
        style: {
          bottom: "30%",
          right: "8%",
          fontSize: "2.2rem",
          opacity: 0.35,
        },
      },
      {
        char: "✦",
        style: { top: "50%", right: "5%", fontSize: "1.2rem", opacity: 0.3 },
      },
    ],
  },
  {
    id: "poems",
    gradient: "linear-gradient(135deg, #e8e0f5 0%, #d4cce8 50%, #f5f0ff 100%)",
    elements: [
      {
        char: "❝",
        style: { top: "8%", left: "8%", fontSize: "4rem", opacity: 0.2 },
      },
      {
        char: "✦",
        style: { top: "20%", left: "25%", fontSize: "1.5rem", opacity: 0.35 },
      },
      {
        char: "✦",
        style: { top: "15%", right: "18%", fontSize: "1rem", opacity: 0.3 },
      },
      {
        char: "❞",
        style: { bottom: "10%", right: "8%", fontSize: "4rem", opacity: 0.2 },
      },
      {
        char: "✦",
        style: { bottom: "25%", left: "12%", fontSize: "1.2rem", opacity: 0.3 },
      },
      {
        char: "🕊️",
        style: { top: "12%", right: "35%", fontSize: "2.5rem", opacity: 0.4 },
      },
      {
        char: "🌙",
        style: {
          bottom: "20%",
          right: "25%",
          fontSize: "2.5rem",
          opacity: 0.4,
        },
      },
      {
        char: "✦",
        style: { top: "45%", right: "5%", fontSize: "1.8rem", opacity: 0.25 },
      },
    ],
  },
];

function HeroBackground() {
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIndex((i) => (i + 1) % SCENES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const scene = SCENES[sceneIndex];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence mode="sync">
        <motion.div
          key={scene.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: scene.gradient }}
        >
          {scene.elements.map((el, i) => (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: static scene elements
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: el.style.opacity as number, scale: 1 }}
              transition={{ duration: 1.2, delay: i * 0.08, ease: "easeOut" }}
              className="absolute select-none pointer-events-none"
              style={{
                ...el.style,
                lineHeight: 1,
              }}
            >
              {el.char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
      {/* Frosted overlay for legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.78) 100%)",
          backdropFilter: "blur(0px)",
        }}
      />
    </div>
  );
}

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
      <section className="relative border-b border-border overflow-hidden">
        <HeroBackground />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 text-center">
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
