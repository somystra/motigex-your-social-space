import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, profile, refreshProfile, isGuest } = useAuth();
  const { t } = useI18n();
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) nav({ to: "/auth" });
  }, [user, nav]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const upload = async (file: File) => {
    if (!user || isGuest) { toast.error(t("guestMode")); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const { error: updErr } = await supabase.from("profiles").update({ avatar_url: pub.publicUrl }).eq("id", user.id);
    setUploading(false);
    if (updErr) toast.error(updErr.message);
    else { toast.success("Photo updated"); refreshProfile(); }
  };

  const save = async () => {
    if (!user || isGuest) { toast.error(t("guestMode")); return; }
    const { error } = await supabase.from("profiles")
      .update({ display_name: displayName, bio }).eq("id", user.id);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); refreshProfile(); }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-xl mx-auto glass rounded-3xl p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <Avatar className="h-32 w-32 ring-4 ring-primary/40 shadow-[var(--shadow-glow)]">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {(profile?.display_name ?? "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading || isGuest}
              className="absolute bottom-0 right-0 neon-btn rounded-full p-3"
              aria-label={t("uploadAvatar")}
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileRef} type="file" accept="image/*" hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{uploading ? "Uploading..." : t("uploadAvatar")}</p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">{t("displayName")}</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={isGuest} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t("bio")}</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={isGuest} />
          </div>
          <Button className="neon-btn w-full rounded-full" onClick={save} disabled={isGuest}>{t("save")}</Button>
        </div>
      </div>
    </Layout>
  );
}
