import { motion } from "motion/react";
import BookIcon from "../components/BookIcon";

export default function AboutPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 py-20"
    >
      {/* Decorative header */}
      <div className="flex flex-col items-center text-center mb-14">
        <BookIcon className="h-10 w-10 text-foreground mb-5" />
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
          The Journal
        </h1>
        <div className="w-16 h-px bg-foreground/30 my-5" />
        <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
          A curated space for stories worth reading — spanning Health, Anime,
          Lifestyle, Travel, Recipes, and more.
        </p>
      </div>

      {/* Story */}
      <section className="mb-12 space-y-5 text-foreground/80 leading-[1.85] text-[1.05rem]">
        <p>
          The Journal began as a simple idea: that the best stories come from
          people who live them. Not journalists with deadlines, but curious
          souls who cook unusual recipes at midnight, who stay up rewatching
          anime arcs they've seen a dozen times, who travel not for the photos
          but for the feeling.
        </p>
        <p>
          This is a place for those people — and for anyone willing to sit down
          and read what they have to say.
        </p>
      </section>

      {/* Founder */}
      <section className="border-l-2 border-foreground/20 pl-6 mb-12">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Founded by
        </p>
        <p className="font-serif text-2xl font-semibold text-foreground">
          Sushmita Biswas
        </p>
      </section>

      {/* Mission */}
      <section className="mb-14">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
          Our Mission
        </h2>
        <p className="text-foreground/80 leading-[1.85] text-[1.05rem]">
          To be a platform for curious, creative voices — a place where writers
          share what moves them, what inspires them, and what truly matters to
          them. No algorithms deciding what's worth your time. Just honest,
          human writing, published with care.
        </p>
      </section>

      {/* Closing ornament */}
      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="flex-1 h-px bg-border" />
        <BookIcon className="h-5 w-5" />
        <div className="flex-1 h-px bg-border" />
      </div>
    </motion.div>
  );
}
