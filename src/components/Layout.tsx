import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Home, User, Search, MessageCircle, Sun, Moon, LogOut, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/motigex-logo.jpg";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, isGuest } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Motigex" className="h-9 w-9 rounded-xl shadow-[var(--shadow-glow)]" />
            <span className="font-bold text-lg text-gradient hidden sm:inline">Motigex</span>
          </Link>
          <nav className="flex items-center gap-1 ml-auto">
            <NavLink to="/" icon={<Home size={18} />} label={t("feed")} />
            <NavLink to="/search" icon={<Search size={18} />} label={t("search")} />
            <NavLink to="/messages" icon={<MessageCircle size={18} />} label={t("messages")} />
            <NavLink to="/profile" icon={<User size={18} />} label={t("profile")} />
          </nav>
          <button onClick={toggle} className="p-2 rounded-full hover:bg-secondary transition" aria-label="theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-full hover:bg-secondary transition flex items-center gap-1 text-xs uppercase font-semibold">
              <Globe size={16} /> {lang}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass">
              <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("uz")}>O'zbek</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("ru")}>Русский</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 ring-2 ring-primary/40">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {(profile?.display_name ?? "G")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass" align="end">
                <DropdownMenuItem onClick={() => nav({ to: "/profile" })}>{t("profile")}</DropdownMenuItem>
                <DropdownMenuItem onClick={async () => { await signOut(); nav({ to: "/auth" }); }}>
                  <LogOut size={14} className="mr-2" />{t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="neon-btn px-4 py-2 rounded-full text-sm font-medium">{t("login")}</Link>
          )}
        </div>
        {isGuest && (
          <div className="bg-primary/10 text-center text-xs py-1.5 text-primary-foreground/80">
            {t("guestMode")} <Link to="/auth" className="underline font-semibold">{t("signup")}</Link>
          </div>
        )}
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      <footer className="mt-auto py-6 text-center text-xs text-muted-foreground">
        {t("createdBy")}
      </footer>
    </div>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm hover:bg-secondary transition"
      activeProps={{ className: "bg-primary/15 text-primary font-semibold" }}
    >
      {icon}<span className="hidden md:inline">{label}</span>
    </Link>
  );
}
