import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  PenLine,
  X,
} from "lucide-react";
import { useState } from "react";
import { Category } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useIsAdmin } from "../hooks/useQueries";
import { CATEGORY_LABELS } from "../utils/category";
import BookIcon from "./BookIcon";

export default function Header() {
  const { login, clear, identity, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const { data: profile } = useCallerUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const isLoggedIn = !!identity;
  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 8)}...`
    : "";
  const displayName = profile?.name || principalShort || "";
  const initials = profile?.name ? profile.name.slice(0, 2).toUpperCase() : "U";

  const categories = Object.values(Category);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#EAEAEA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-serif text-2xl font-bold text-foreground tracking-tight hover:opacity-80 transition-opacity"
        >
          <BookIcon className="h-6 w-6" />
          The Journal
        </Link>

        <nav
          className="hidden md:flex items-center gap-6"
          data-ocid="header.panel"
        >
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.home.link"
          >
            Home
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="nav.categories.dropdown_menu"
            >
              Categories <ChevronDown className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {categories.map((cat) => (
                <DropdownMenuItem key={cat} asChild>
                  <Link
                    to="/"
                    search={{ category: cat }}
                    className="cursor-pointer"
                    data-ocid="nav.category.link"
                  >
                    {CATEGORY_LABELS[cat]}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.about.link"
          >
            About
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              data-ocid="nav.admin.link"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.navigate({ to: "/write" })}
                className="gap-2"
                data-ocid="header.write.button"
              >
                <PenLine className="h-4 w-4" /> Write
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  data-ocid="header.user.dropdown_menu"
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground">{displayName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={clear}
                    className="text-destructive"
                    data-ocid="header.logout.button"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="header.login.button"
            >
              {isLoggingIn ? "Signing in..." : "Sign in"}
            </Button>
          )}
        </div>

        <button
          type="button"
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium"
            data-ocid="mobile.nav.home.link"
          >
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-muted-foreground"
              data-ocid="mobile.nav.category.link"
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className="block text-sm font-medium"
            data-ocid="mobile.nav.about.link"
          >
            About
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium"
              data-ocid="mobile.nav.admin.link"
            >
              Admin
            </Link>
          )}
          <div className="pt-2 border-t border-border">
            {isLoggedIn ? (
              <div className="space-y-3">
                <Link
                  to="/write"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                  data-ocid="mobile.nav.write.link"
                >
                  <PenLine className="h-4 w-4" /> Write a Post
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{displayName}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    data-ocid="mobile.logout.button"
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                className="w-full"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="mobile.login.button"
              >
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
