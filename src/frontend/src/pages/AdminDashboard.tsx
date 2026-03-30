import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Edit, Loader2, PenLine, RefreshCw, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllPosts,
  useAllUsers,
  useDeletePost,
  useIsAdmin,
  useSeedSample,
  useSetAdminRole,
} from "../hooks/useQueries";
import {
  CATEGORY_BG_COLORS,
  CATEGORY_LABELS,
  formatDate,
} from "../utils/category";
import { storeSessionParameter } from "../utils/urlParams";

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [adminToken, setAdminToken] = useState("");
  const [claiming, setClaiming] = useState(false);

  const { data: posts = [], isLoading: postsLoading } = useAllPosts();
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const deletePost = useDeletePost();
  const seedSample = useSeedSample();
  const setAdminRole = useSetAdminRole();

  const handleClaimAdmin = async () => {
    if (!actor || !adminToken.trim()) return;
    setClaiming(true);
    try {
      storeSessionParameter("caffeineAdminToken", adminToken.trim());
      await actor._initializeAccessControlWithSecret(adminToken.trim());
      await queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
      await queryClient.refetchQueries({ queryKey: ["isAdmin"] });
      toast.success("Admin access granted! Refreshing...");
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error("Invalid token. Please check and try again.");
    } finally {
      setClaiming(false);
    }
  };

  if (!identity) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-3xl font-bold mb-4">
          Access Restricted
        </h2>
        <p className="text-muted-foreground">
          Sign in to access the admin dashboard.
        </p>
      </div>
    );
  }

  if (adminLoading) {
    return (
      <div
        className="flex items-center justify-center py-20"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="max-w-md mx-auto px-4 py-20 text-center"
        data-ocid="admin.error_state"
      >
        <h2 className="font-serif text-3xl font-bold mb-3">Admin Access</h2>
        <p className="text-muted-foreground mb-8">
          Enter your admin token to claim administrator privileges. You can find
          this token in the Caffeine deployment link provided when the app was
          published.
        </p>
        <div className="flex flex-col gap-3 text-left">
          <label htmlFor="admin-token-input" className="text-sm font-medium">
            Admin Token
          </label>
          <Input
            id="admin-token-input"
            type="password"
            placeholder="Paste your admin token here"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleClaimAdmin()}
            data-ocid="admin.input"
          />
          <Button
            onClick={handleClaimAdmin}
            disabled={!adminToken.trim() || claiming}
            className="w-full"
            data-ocid="admin.submit_button"
          >
            {claiming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying...
              </>
            ) : (
              "Claim Admin Access"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Tip: The token is in the URL that Caffeine shows you after deployment
          — look for <code>caffeineAdminToken=</code> in the link.
        </p>
      </div>
    );
  }

  const handleDeletePost = async (postId: bigint) => {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost.mutateAsync(postId);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleToggleAdmin = async (
    principal: Principal,
    currentRole: UserRole,
  ) => {
    const isCurrentAdmin = currentRole === UserRole.admin;
    try {
      await setAdminRole.mutateAsync({ principal, isAdmin: !isCurrentAdmin });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-10"
    >
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage posts, users, and site content.
        </p>
      </div>

      <Tabs defaultValue="posts" data-ocid="admin.panel">
        <TabsList className="mb-6">
          <TabsTrigger value="posts" data-ocid="admin.posts.tab">
            Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="admin.users.tab">
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="seed" data-ocid="admin.seed.tab">
            Seed Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} total
            </p>
            <Button
              asChild
              size="sm"
              className="gap-2"
              data-ocid="admin.posts.primary_button"
            >
              <Link to="/write">
                <PenLine className="h-4 w-4" /> New Post
              </Link>
            </Button>
          </div>
          {postsLoading ? (
            <div
              className="flex justify-center py-12"
              data-ocid="admin.posts.loading_state"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="admin.posts.empty_state"
            >
              No posts yet.
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post, i) => (
                    <TableRow
                      key={post.id.toString()}
                      data-ocid={`admin.posts.row.${i + 1}`}
                    >
                      <TableCell className="font-medium max-w-xs">
                        <Link
                          to="/post/$id"
                          params={{ id: post.id.toString() }}
                          className="hover:underline line-clamp-1"
                        >
                          {post.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {post.authorName}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_BG_COLORS[post.category]}`}
                        >
                          {CATEGORY_LABELS[post.category]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(post.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {post.likeCount.toString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate({
                                to: "/edit/$id",
                                params: { id: post.id.toString() },
                              })
                            }
                            data-ocid={`admin.post.edit_button.${i + 1}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeletePost(post.id)}
                            data-ocid={`admin.post.delete_button.${i + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          {usersLoading ? (
            <div
              className="flex justify-center py-12"
              data-ocid="admin.users.loading_state"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="admin.users.empty_state"
            >
              No users yet.
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Principal</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Toggle Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, i) => (
                    <TableRow
                      key={user.principal.toString()}
                      data-ocid={`admin.users.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {user.principal.toString().slice(0, 16)}...
                      </TableCell>
                      <TableCell>{user.profile?.name || "\u2014"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === UserRole.admin
                              ? "default"
                              : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={user.role === UserRole.admin}
                          onCheckedChange={() =>
                            handleToggleAdmin(user.principal, user.role)
                          }
                          data-ocid={`admin.users.switch.${i + 1}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="seed">
          <div className="max-w-lg">
            <div className="bg-[#F5F5F5] rounded-xl p-8">
              <h3 className="font-serif text-xl font-bold mb-2">
                Seed Sample Data
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Populate the blog with sample posts including "Top 5 Best
                Romance Anime" and "Best Places to Visit in Japan". This will
                add posts if they don't already exist.
              </p>
              <Button
                onClick={() => {
                  seedSample.mutate(undefined, {
                    onSuccess: () => toast.success("Sample data seeded!"),
                    onError: () => toast.error("Failed to seed data"),
                  });
                }}
                disabled={seedSample.isPending}
                className="gap-2"
                data-ocid="admin.seed.button"
              >
                {seedSample.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Seeding...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" /> Seed Sample Posts
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
