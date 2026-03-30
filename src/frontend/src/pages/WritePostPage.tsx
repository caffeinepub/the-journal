import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ImagePlus, Link2, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Category } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerUserProfile, useCreatePost } from "../hooks/useQueries";
import { CATEGORY_LABELS } from "../utils/category";
import { uploadImageFile } from "../utils/imageUpload";

export default function WritePostPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { data: profile } = useCallerUserProfile();
  const createPost = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyFileInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const linkCursorRef = useRef<number | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>(Category.lifestyle);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingBody, setUploadingBody] = useState(false);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, identity ?? undefined);
      setCoverImageUrl(url);
      toast.success("Image uploaded!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to upload image: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBodyImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const cursor = bodyTextareaRef.current?.selectionStart ?? -1;
    setUploadingBody(true);
    try {
      const url = await uploadImageFile(file, identity ?? undefined);
      const tag = `[image:${url}]`;
      setBody((prev) => {
        const pos = cursor === -1 ? prev.length : cursor;
        return prev.slice(0, pos) + tag + prev.slice(pos);
      });
      toast.success("Image inserted!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to upload image: ${msg}`);
    } finally {
      setUploadingBody(false);
      if (bodyFileInputRef.current) bodyFileInputRef.current.value = "";
    }
  };

  const applyFormat = (marker: string) => {
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = body.slice(start, end);
    const wrapped = selected
      ? `${marker}${selected}${marker}`
      : `${marker}text${marker}`;
    setBody((prev) => prev.slice(0, start) + wrapped + prev.slice(end));
  };

  const handleInsertLink = () => {
    linkCursorRef.current = bodyTextareaRef.current?.selectionStart ?? null;
    setShowLinkForm(true);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    const tag = `[link:${linkText || linkUrl}|${linkUrl}]`;
    setBody((prev) => {
      const pos = linkCursorRef.current ?? prev.length;
      return prev.slice(0, pos) + tag + prev.slice(pos);
    });
    setShowLinkForm(false);
    setLinkText("");
    setLinkUrl("");
  };

  if (!identity) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold mb-4">Sign in to Write</h2>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to write a post on The Journal.
        </p>
        <Button onClick={login} size="lg" data-ocid="write.login.button">
          Sign in to Continue
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      await createPost.mutateAsync({
        id: BigInt(0),
        title: title.trim(),
        body: body.trim(),
        category,
        coverImageUrl: coverImageUrl.trim() || undefined,
        authorId: identity.getPrincipal(),
        authorName: profile?.name || "Anonymous",
        likeCount: BigInt(0),
        likes: [],
        createdAt: BigInt(Date.now()) * BigInt(1_000_000),
      });
      toast.success("Post published!");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to publish post");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8"
        data-ocid="write.back.link"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="font-serif text-4xl font-bold mb-8">Write a New Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="An unforgettable headline..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1.5 text-lg h-12"
            required
            data-ocid="write.title.input"
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as Category)}
          >
            <SelectTrigger
              id="category"
              className="mt-1.5"
              data-ocid="write.category.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Category).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cover Image Upload */}
        <div>
          <Label>Cover Image (optional)</Label>
          <div className="mt-1.5 space-y-3">
            {coverImageUrl && (
              <div className="relative inline-block">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="h-32 w-auto rounded-lg object-cover border border-border"
                />
                <button
                  type="button"
                  onClick={() => setCoverImageUrl("")}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                data-ocid="write.upload_button"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Or paste a URL
              </p>
              <Input
                placeholder="https://..."
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                data-ocid="write.cover_image.input"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="body">Content</Label>
          <Textarea
            id="body"
            ref={bodyTextareaRef}
            placeholder="Tell your story..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="mt-1.5 resize-none leading-relaxed"
            required
            data-ocid="write.body.textarea"
          />
          {/* Formatting toolbar */}
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyFormat("**")}
              className="font-bold text-muted-foreground hover:text-foreground px-2.5"
              title="Bold"
              data-ocid="write.bold.button"
            >
              B
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => applyFormat("*")}
              className="italic text-muted-foreground hover:text-foreground px-2.5"
              title="Italic"
              data-ocid="write.italic.button"
            >
              I
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <input
              ref={bodyFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBodyImageUpload}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploadingBody}
              onClick={() => bodyFileInputRef.current?.click()}
              className="gap-2 text-muted-foreground hover:text-foreground"
              data-ocid="write.insert_image.button"
            >
              {uploadingBody ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="h-4 w-4" />
              )}
              {uploadingBody ? "Uploading..." : "Insert Image"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleInsertLink}
              className="gap-2 text-muted-foreground hover:text-foreground"
              data-ocid="write.insert_link.button"
            >
              <Link2 className="h-4 w-4" />
              Insert Link
            </Button>
          </div>
          {showLinkForm && (
            <form
              onSubmit={handleLinkSubmit}
              className="mt-3 p-3 border border-border rounded-lg bg-muted/30 space-y-2"
              data-ocid="write.link.panel"
            >
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Link text (optional)"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="flex-1 min-w-[140px] h-8 text-sm"
                  data-ocid="write.link_text.input"
                />
                <Input
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="flex-1 min-w-[180px] h-8 text-sm"
                  required
                  data-ocid="write.link_url.input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs"
                  data-ocid="write.link.submit_button"
                >
                  Insert
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setShowLinkForm(false);
                    setLinkText("");
                    setLinkUrl("");
                  }}
                  data-ocid="write.link.cancel_button"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={!title.trim() || !body.trim() || createPost.isPending}
            data-ocid="write.submit.button"
          >
            {createPost.isPending ? "Publishing..." : "Publish Post"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate({ to: "/" })}
            data-ocid="write.cancel.button"
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
