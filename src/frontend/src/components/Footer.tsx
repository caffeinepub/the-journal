import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import BookIcon from "./BookIcon";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="border-t border-border bg-white mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
            <BookIcon className="h-5 w-5" />
            The Journal
          </span>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link
              to="/about"
              className="hover:text-foreground transition-colors"
              data-ocid="footer.about.link"
            >
              About
            </Link>
            <Link
              to="/write"
              className="hover:text-foreground transition-colors"
            >
              Write
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © {year}. Built with{" "}
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
