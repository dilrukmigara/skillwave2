import { createBrowserRouter, Outlet } from "react-router";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { FITPage } from "./pages/FITPage";
import { RoboIoTPage } from "./pages/RoboIoTPage";
import { DevOpsPage } from "./pages/DevOpsPage";
import { WebMasterPage } from "./pages/WebMasterPage";

function Root() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
      Page not found.
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "fit", Component: FITPage },
      { path: "robo-iot", Component: RoboIoTPage },
      { path: "devops", Component: DevOpsPage },
      { path: "web-master", Component: WebMasterPage },
      { path: "*", Component: NotFound },
    ],
  },
]);
