import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useSaveProfile } from "../hooks/useQueries";

export default function ProfileSetupDialog() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useCallerUserProfile();
  const saveProfile = useSaveProfile();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (identity && !isLoading && profile !== undefined && !profile?.name) {
      // Pre-fill pen name from welcome popup if available
      const pendingPenName = localStorage.getItem("journal_pending_penname");
      if (pendingPenName) {
        setName(pendingPenName);
        localStorage.removeItem("journal_pending_penname");
      }
      setOpen(true);
    }
  }, [identity, isLoading, profile]);

  const handleSave = async () => {
    if (!name.trim()) return;
    await saveProfile.mutateAsync({
      name: name.trim(),
      about: "",
      profilePicUrl: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent data-ocid="profile.dialog">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Welcome to The Journal!
          </DialogTitle>
          <DialogDescription>
            Set a display name so readers know who you are.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            placeholder="e.g. Alex Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="mt-1.5"
            data-ocid="profile.input"
          />
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            data-ocid="profile.cancel_button"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveProfile.isPending}
            data-ocid="profile.save_button"
          >
            {saveProfile.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
