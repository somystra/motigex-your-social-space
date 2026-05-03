import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/reels")({ component: Reels });

type Reel = {
  id: string; content: string; media_url: string; created_at: string;
  profiles?: { display_name: string | null; username: string | null; avatar_url: string | null } | null;
};

function Reels() {
  const { t } = useI18n();
  const [reels, setReels] = useState<Reel[]>([]);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*, profiles(display_name, username, avatar_url)")
      .eq("media_type", "video")
      .not("media_url", "is", null)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setReels((data as Reel[]) ?? []));
  }, []);

  return (
    <Layout>
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gradient text-center">{t("reels")}</h1>
        {reels.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-muted-foreground">{t("noReels")}</div>
        ) : (
          reels.map((r) => <ReelCard key={r.id} reel={r} />)
        )}
      </div>
    </Layout>
  );
}

function ReelCard({ reel }: { reel: Reel }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <div className="glass rounded-3xl overflow-hidden">
      <video
        ref={ref}
        src={reel.media_url}
        className="w-full aspect-[9/16] bg-black object-cover"
        controls
        playsInline
        loop
      />
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={reel.profiles?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
            {(reel.profiles?.display_name ?? "U")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{reel.profiles?.display_name ?? "User"}</div>
          {reel.content && <div className="text-xs text-muted-foreground truncate">{reel.content}</div>}
        </div>
      </div>
    </div>
  );
}
