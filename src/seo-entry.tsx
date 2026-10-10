import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { ThemeProvider } from "next-themes";
import { Navbar } from "./app/components/Navbar";
import { Footer } from "./app/components/Footer";
import { HomePage } from "./app/pages/HomePage";
import { FITPage } from "./app/pages/FITPage";
import { RoboIoTPage } from "./app/pages/RoboIoTPage";
import { DevOpsPage } from "./app/pages/DevOpsPage";
import { WebMasterPage } from "./app/pages/WebMasterPage";
import { NewsPage } from "./app/pages/NewsPage";
export { publicPages } from "./seo";
const pages: Record<string, React.ComponentType> = {
  "/": HomePage,
  "/fit": FITPage,
  "/robo-iot": RoboIoTPage,
  "/devops": DevOpsPage,
  "/web-master": WebMasterPage,
  "/news": NewsPage,
};
export function render(path: string) {
  const Page = pages[path];
  if (!Page) return "";
  return renderToString(
    <StaticRouter location={path}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Navbar />
        <main>
          <Page />
        </main>
        <Footer />
      </ThemeProvider>
    </StaticRouter>,
  );
}
