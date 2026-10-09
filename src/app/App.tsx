import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./lms/Auth";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
