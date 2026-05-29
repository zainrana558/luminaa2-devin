"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProfile, deleteProfile } from "@/actions/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, User, Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

const AVATAR_COLORS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-purple-500",
];

export default function ProfileSelector({ profiles }: { profiles: Profile[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [managing, setManaging] = useState(false);
  const router = useRouter();

  function selectProfile(profileId: string) {
    document.cookie = `profile_id=${profileId}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.push("/browse");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);

    const formData = new FormData();
    formData.set("name", newName.trim());

    const result = await createProfile(formData);
    if (result.error) {
      alert(result.error);
    } else {
      setNewName("");
      setShowCreate(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(profileId: string) {
    if (!confirm("Delete this profile? This action cannot be undone.")) return;
    await deleteProfile(profileId);
    router.refresh();
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = "profile_id=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Who&apos;s watching?</h1>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        {profiles.map((profile, i) => (
          <div key={profile.id} className="group relative">
            <button
              onClick={() => !managing && selectProfile(profile.id)}
              className="flex flex-col items-center gap-3 rounded-lg p-4 transition-transform hover:scale-105"
            >
              <div
                className={`flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} text-3xl font-bold text-white shadow-lg`}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground">
                {profile.name}
              </span>
            </button>
            {managing && (
              <button
                onClick={() => handleDelete(profile.id)}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1.5 text-white shadow-lg hover:bg-destructive/90"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}

        {profiles.length < 5 && !showCreate && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center gap-3 rounded-lg p-4 transition-transform hover:scale-105"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
              <Plus className="h-10 w-10" />
            </div>
            <span className="text-sm text-muted-foreground">Add Profile</span>
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mx-auto flex max-w-xs gap-2">
          <Input
            placeholder="Profile name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
        </form>
      )}

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => setManaging(!managing)}>
          {managing ? "Done" : "Manage Profiles"}
        </Button>
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
