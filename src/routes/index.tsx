import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import logo from "@/assets/motigex-logo.jpg";

export const Route = createFileRoute("/")({ component: Index });

type Post = {
  id: string; content: string; created_at: string; user_id: string;
  profiles?: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
};

function Index() {
  const { user, profile, isGuest } = useAuth();
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(display_name, username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);
    setPosts((data as Post[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!user || isGuest) { toast.error(t("guestMode")); return; }
    if (!content.trim()) return;
    setPosting(true);
    const { error } = await supabase.from("posts").insert({ user_id: user.id, content: content.trim() });
    setPosting(false);
    if (error) toast.error(error.message);
    else { setContent(""); load(); }
  };

  if (!user) {
    return (
      <Layout>
        <section className="text-center py-16">
          <img src={logo} alt="Motigex logo" className="mx-auto h-32 w-32 rounded-3xl shadow-[var(--shadow-glow)]" />
          <h1 className="mt-8 text-5xl md:text-6xl font-bold text-gradient">{t("welcome")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("tagline")}</p>
          <Link to="/auth" className="neon-btn inline-block mt-8 px-8 py-3 rounded-full font-semibold">
            {t("login")}
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {!isGuest && (
          <div className="glass rounded-3xl p-5 space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {(profile?.display_name ?? "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Textarea
                placeholder={t("newPost")} value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent border-glass-border resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={submit} disabled={posting} className="neon-btn rounded-full px-6">
                {t("post")}
              </Button>
            </div>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-muted-foreground">
            {t("emptyFeed")}
          </div>
        ) : (
          posts.map((p) => (
            <article key={p.id} className="glass rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.profiles?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {(p.profiles?.display_name ?? "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">{p.profiles?.display_name ?? "User"}</div>
                  <div className="text-xs text-muted-foreground">@{p.profiles?.username ?? "user"}</div>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{p.content}</p>
            </article>
          ))
        )}
      </div>
    </Layout>
  );
}
