import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logo from "@/assets/motigex-logo.jpg";

export const Route = createFileRoute("/auth")({ component: AuthPage });

function AuthPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (mode: "in" | "up") => {
    setLoading(true);
    const fn = mode === "in"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { username, display_name: username } },
        });
    const { error } = await fn;
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Welcome to Motigex"); nav({ to: "/" }); }
  };

  const guest = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (error) toast.error(error.message);
    else nav({ to: "/" });
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <img src={logo} alt="Motigex" className="mx-auto h-20 w-20 rounded-2xl shadow-[var(--shadow-glow)]" />
          <h1 className="mt-4 text-3xl font-bold text-gradient">{t("appName")}</h1>
          <p className="text-muted-foreground text-sm">{t("tagline")}</p>
        </div>
        <div className="glass rounded-3xl p-6">
          <Tabs defaultValue="in">
            <TabsList className="grid grid-cols-2 w-full bg-secondary/50">
              <TabsTrigger value="in">{t("login")}</TabsTrigger>
              <TabsTrigger value="up">{t("signup")}</TabsTrigger>
            </TabsList>
            <TabsContent value="in" className="space-y-3 pt-4">
              <Input placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button className="neon-btn w-full rounded-full" disabled={loading} onClick={() => handle("in")}>{t("login")}</Button>
            </TabsContent>
            <TabsContent value="up" className="space-y-3 pt-4">
              <Input placeholder={t("username")} value={username} onChange={(e) => setUsername(e.target.value)} />
              <Input placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input type="password" placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button className="neon-btn w-full rounded-full" disabled={loading} onClick={() => handle("up")}>{t("signup")}</Button>
            </TabsContent>
          </Tabs>
          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 h-px bg-border" /> or <div className="flex-1 h-px bg-border" />
          </div>
          <Button variant="outline" className="w-full rounded-full" disabled={loading} onClick={guest}>
            {t("guest")}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
