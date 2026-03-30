import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AdminInitializer from "./components/AdminInitializer";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ProfileSetupDialog from "./components/ProfileSetupDialog";
import WelcomePopup from "./components/WelcomePopup";
import AboutPage from "./pages/AboutPage";
import AdminDashboard from "./pages/AdminDashboard";
import EditPostPage from "./pages/EditPostPage";
import EditProfilePage from "./pages/EditProfilePage";
import HomePage from "./pages/HomePage";
import PostDetailPage from "./pages/PostDetailPage";
import WritePostPage from "./pages/WritePostPage";

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminInitializer />
      <Header />
      <WelcomePopup />
      <ProfileSetupDialog />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="bottom-right" />
    </div>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});
const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post/$id",
  component: PostDetailPage,
});
const writeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/write",
  component: WritePostPage,
});
const editRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit/$id",
  component: EditPostPage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});
const editProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile/edit",
  component: EditProfilePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  postRoute,
  writeRoute,
  editRoute,
  adminRoute,
  aboutRoute,
  editProfileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
