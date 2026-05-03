import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({ component: MessagesPage });

type P = { id: string; username: string | null; display_name: string | null; avatar_url: string | null };
type M = { id: string; sender_id: string; recipient_id: string; content: string; created_at: string };

function MessagesPage() {
  const { user, isGuest } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [people, setPeople] = useState<P[]>([]);
  const [active, setActive] = useState<P | null>(null);
  const [msgs, setMsgs] = useState<M[]>([]);
  const [text, setText] = useState("");

  useEffect(() => { if (!user) nav({ to: "/auth" }); }, [user, nav]);

  useEffect(() => {
    supabase.from("profiles").select("id, username, display_name, avatar_url").limit(30)
      .then(({ data }) => setPeople(((data as P[]) ?? []).filter((p) => p.id !== user?.id)));
  }, [user]);

  useEffect(() => {
    if (!user || !active) return;
    const load = async () => {
      const { data } = await supabase.from("messages").select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${active.id}),and(sender_id.eq.${active.id},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMsgs((data as M[]) ?? []);
    };
    load();
    const ch = supabase.channel(`dm-${active.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, active]);

  const send = async () => {
    if (!user || !active) return;
    if (isGuest) { toast.error(t("guestMode")); return; }
    if (!text.trim()) return;
    const { error } = await supabase.from("messages")
      .insert({ sender_id: user.id, recipient_id: active.id, content: text.trim() });
    if (error) toast.error(error.message);
    else setText("");
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="grid md:grid-cols-[260px_1fr] gap-4 h-[70vh]">
        <aside className="glass rounded-3xl p-3 overflow-y-auto">
          {people.map((p) => (
            <button key={p.id} onClick={() => setActive(p)}
              className={`w-full flex items-center gap-3 p-2 rounded-2xl transition ${active?.id === p.id ? "bg-primary/15" : "hover:bg-secondary/50"}`}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={p.avatar_url ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                  {(p.display_name ?? "U")[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium">{p.display_name ?? p.username}</div>
                <div className="text-xs text-muted-foreground">@{p.username}</div>
              </div>
            </button>
          ))}
        </aside>
        <section className="glass rounded-3xl flex flex-col">
          {!active ? (
            <div className="flex-1 grid place-items-center text-muted-foreground">{t("selectChat")}</div>
          ) : (
            <>
              <header className="p-4 border-b border-glass-border flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={active.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs">
                    {(active.display_name ?? "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold">{active.display_name}</div>
              </header>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {msgs.map((m) => (
                  <div key={m.id} className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    m.sender_id === user.id ? "ml-auto neon-btn" : "bg-secondary/60"
                  }`}>
                    {m.content}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-glass-border flex gap-2">
                <Input value={text} onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder={t("typeMessage")} className="rounded-full" />
                <Button onClick={send} className="neon-btn rounded-full"><Send size={16} /></Button>
              </div>
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
