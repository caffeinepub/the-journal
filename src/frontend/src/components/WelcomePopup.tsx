import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, PenLine } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function WelcomePopup() {
  const { login } = useInternetIdentity();
  const [open, setOpen] = useState(
    () => !localStorage.getItem("journal_welcomed"),
  );
  const [penName, setPenName] = useState("");

  const dismiss = () => {
    localStorage.setItem("journal_welcomed", "true");
    setOpen(false);
  };

  const handleSignUp = () => {
    if (penName.trim()) {
      localStorage.setItem("journal_pending_penname", penName.trim());
    }
    localStorage.setItem("journal_welcomed", "true");
    setOpen(false);
    login();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) dismiss();
      }}
    >
      <DialogContent
        data-ocid="welcome.popup"
        className="max-w-md p-0 overflow-hidden border border-neutral-200 shadow-2xl rounded-none"
      >
        {/* Top accent strip */}
        <div className="h-1 w-full bg-neutral-900" />

        <div className="px-8 pt-8 pb-10 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="font-serif text-3xl text-neutral-900 leading-snug tracking-tight">
              Where every story
              <br />
              finds its voice
            </h2>
            <p
              className="text-neutral-500 text-sm leading-relaxed max-w-xs mx-auto"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1rem",
              }}
            >
              A quiet corner for curious minds and creative souls — sign up or
              choose a pen name to begin writing.
            </p>
          </div>

          {/* Pen name input */}
          <div className="w-full text-left space-y-1.5">
            <Label
              htmlFor="welcome-penname"
              className="font-serif text-sm text-neutral-600 tracking-wide"
            >
              Your pen name{" "}
              <span className="text-neutral-400 text-xs font-sans">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <PenLine
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
                strokeWidth={1.5}
              />
              <Input
                id="welcome-penname"
                data-ocid="welcome.penname.input"
                placeholder="e.g. Luna Voss"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="pl-9 font-serif text-base border-neutral-200 rounded-none focus-visible:ring-0 focus-visible:border-neutral-800 transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <Button
              data-ocid="welcome.signup.button"
              onClick={handleSignUp}
              className="w-full rounded-none bg-neutral-900 hover:bg-neutral-700 text-white font-serif text-base tracking-wide py-5"
            >
              Sign Up &amp; Start Writing
            </Button>
            <button
              type="button"
              data-ocid="welcome.dismiss.button"
              onClick={dismiss}
              className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors py-1 font-serif tracking-wide"
            >
              Explore first
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
