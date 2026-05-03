import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ImagePlus, Film, X } from "lucide-react";

export const Route = createFileRoute("/create")({ component: Create });

function Create() {
  const { user, isGuest } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const [tab, setTab] = useState<"post" | "reel">("post");

  if (!user || isGuest) {
    return (
      <Layout>
        <div className="glass rounded-3xl p-12 text-center max-w-md mx-auto">
          <p className="text-muted-foreground">{t("guestMode")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gradient text-center">{t("create")}</h1>
        <Tabs value={tab} onValueChange={(v) => setTab(v as "post" | "reel")}>
          <TabsList className="grid w-full grid-cols-2 glass">
            <TabsTrigger value="post"><ImagePlus size={16} className="mr-2" />{t("createPost")}</TabsTrigger>
            <TabsTrigger value="reel"><Film size={16} className="mr-2" />{t("createReel")}</TabsTrigger>
          </TabsList>
          <TabsContent value="post">
            <Composer kind="post" userId={user.id} onDone={() => nav({ to: "/" })} />
          </TabsContent>
          <TabsContent value="reel">
            <Composer kind="reel" userId={user.id} onDone={() => nav({ to: "/reels" })} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function Composer({ kind, userId, onDone }: { kind: "post" | "reel"; userId: string; onDone: () => void }) {
  const { t } = useI18n();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const accept = kind === "reel" ? "video/*" : "image/*,video/*";

  const onFile = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    if (kind === "reel" && !file) { toast.error(t("chooseMedia")); return; }
    if (!content.trim() && !file) return;
    setBusy(true);
    try {
      let media_url: string | null = null;
      let media_type: "image" | "video" | "none" = "none";
      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${userId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("media").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        media_url = data.publicUrl;
        media_type = file.type.startsWith("video") ? "video" : "image";
      }
      if (kind === "reel") media_type = "video";
      const { error } = await supabase.from("posts").insert({
        user_id: userId, content: content.trim(), media_url, media_type,
      });
      if (error) throw error;
      toast.success("✓");
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-5 space-y-4 mt-4">
      <Textarea
        placeholder={t("newPost")} value={content}
        onChange={(e) => setContent(e.target.value)}
        className="bg-transparent border-glass-border resize-none min-h-24"
      />
      <label className="block">
        <input type="file" accept={accept} className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        <div className="border-2 border-dashed border-glass-border rounded-2xl p-6 text-center cursor-pointer hover:bg-secondary/40 transition">
          <p className="text-sm text-muted-foreground">{t("chooseMedia")}</p>
        </div>
      </label>
      {preview && file && (
        <div className="relative rounded-2xl overflow-hidden">
          <button type="button" onClick={() => onFile(null)}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/60 text-white">
            <X size={14} />
          </button>
          {file.type.startsWith("video")
            ? <video src={preview} controls className="w-full max-h-96 bg-black" />
            : <img src={preview} alt="" className="w-full max-h-96 object-contain bg-black" />}
        </div>
      )}
      <Button onClick={submit} disabled={busy} className="neon-btn rounded-full w-full">
        {busy ? t("uploading") : t("post")}
      </Button>
    </div>
  );
}
