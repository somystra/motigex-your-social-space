import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({ component: SearchPage });

type P = { id: string; username: string | null; display_name: string | null; avatar_url: string | null };

function SearchPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<P[]>([]);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      const { data } = await supabase.from("profiles").select("id, username, display_name, avatar_url")
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`).limit(20);
      setResults((data as P[]) ?? []);
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <Layout>
      <div className="max-w-xl mx-auto">
        <div className="glass rounded-full p-2 flex items-center gap-2 px-4">
          <SearchIcon size={18} className="text-muted-foreground" />
          <Input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="bg-transparent border-0 focus-visible:ring-0"
          />
        </div>
        <div className="mt-6 space-y-2">
          {results.length === 0 && q ? (
            <p className="text-center text-sm text-muted-foreground py-8">{t("noResults")}</p>
          ) : (
            results.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {(p.display_name ?? "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">{p.display_name}</div>
                  <div className="text-xs text-muted-foreground">@{p.username}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
