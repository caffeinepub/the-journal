import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useSaveProfile } from "../hooks/useQueries";
import { uploadImageFile } from "../utils/imageUpload";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: profile, isLoading, isError, refetch } = useCallerUserProfile();
  const saveProfile = useSaveProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Pre-fill from loaded profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setAbout(profile.about?.[0] ?? "");
      setProfilePicUrl(profile.profilePicUrl?.[0] ?? "");
    }
  }, [profile]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!identity) {
      toast.error("Please sign in before uploading a photo");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImageFile(file, identity);
      setProfilePicUrl(url);
      toast.success("Photo uploaded! Remember to save your profile.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to upload photo: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Display name is required");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        about: about.trim(),
        profilePicUrl: profilePicUrl,
      });
      toast.success("Profile saved!");
      setTimeout(() => navigate({ to: "/" }), 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to save profile: ${msg}`);
    }
  };

  if (!identity) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold mb-4">
          Sign in to edit your profile
        </h2>
        <Button onClick={login} size="lg" data-ocid="profile.primary_button">
          Sign in
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-20"
        data-ocid="profile.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="max-w-lg mx-auto px-4 py-20 text-center"
        data-ocid="profile.error_state"
      >
        <p className="text-muted-foreground mb-4">
          Could not load your profile. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const initials = name ? name.slice(0, 2).toUpperCase() : "U";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-lg mx-auto px-4 sm:px-6 py-10"
    >
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="font-serif text-4xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground mt-1">
          Add a photo and let readers know who you are.
        </p>
        {!profile && (
          <p className="text-sm text-amber-600 mt-2">
            Enter your display name below to set up your profile.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile picture */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {profilePicUrl && <AvatarImage src={profilePicUrl} alt={name} />}
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-white border border-border rounded-full p-1.5 shadow hover:bg-muted transition-colors"
              title="Change photo"
              data-ocid="profile.upload_button"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="profile.secondary_button"
          >
            {uploading ? "Uploading..." : "Change profile photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            data-ocid="profile.dropzone"
          />
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="display-name">Display Name / Pen Name *</Label>
          <Input
            id="display-name"
            placeholder="e.g. Sushmita B."
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-ocid="profile.input"
          />
        </div>

        {/* About */}
        <div className="space-y-1.5">
          <Label htmlFor="about">About Me</Label>
          <Textarea
            id="about"
            placeholder="Tell readers a little about yourself — your interests, writing style, or anything you'd like to share..."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            data-ocid="profile.textarea"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saveProfile.isPending}
            className="flex-1"
            data-ocid="profile.save_button"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
          <Button variant="outline" asChild data-ocid="profile.cancel_button">
            <Link to="/">Cancel</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
