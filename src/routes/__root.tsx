import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../style.css?url";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md text-center p-10 rounded-3xl">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <p className="mt-4 text-muted-foreground">Page not found</p>
        <Link to="/" className="neon-btn inline-block mt-6 px-6 py-2 rounded-full">Go home</Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Motigex — A new social experience" },
      { name: "description", content: "Motigex by NetGlobal team — Magic OS inspired social network." },
      { property: "og:title", content: "Motigex — A new social experience" },
      { name: "twitter:title", content: "Motigex — A new social experience" },
      { property: "og:description", content: "Motigex by NetGlobal team — Magic OS inspired social network." },
      { name: "twitter:description", content: "Motigex by NetGlobal team — Magic OS inspired social network." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/59ee6637-9fdc-4db8-838b-33e3d2ac4af7/id-preview-915afb01--977f46b4-a066-4940-ac5b-401521460bc0.lovable.app-1777870767644.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/59ee6637-9fdc-4db8-838b-33e3d2ac4af7/id-preview-915afb01--977f46b4-a066-4940-ac5b-401521460bc0.lovable.app-1777870767644.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <Outlet />
          <Toaster />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
