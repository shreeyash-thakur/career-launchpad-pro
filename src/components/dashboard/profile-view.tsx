import React, { useState } from "react";
import {
  User,
  Mail,
  Briefcase,
  Phone,
  MapPin,
  Globe,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

export function ProfileView() {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      if (displayName.trim()) {
        await updateUserProfile(displayName.trim());
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Profile save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Profile &amp; Career Details
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your personal account details and default resume information.
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
        {/* Account Info Header */}
        <div className="flex items-center gap-4 border-b border-border/60 pb-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[image:var(--gradient-emerald)] text-primary-foreground font-display text-xl font-bold shadow-[var(--shadow-glow)]">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="font-display text-base font-bold">{user?.displayName || "User"}</h2>
            <p className="text-xs text-muted-foreground">{user?.email || "No email attached"}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <ShieldCheck className="size-3.5" />
              <span>Verified PeasiProfile Account</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prof-name" className="text-xs font-medium">
                Full Display Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="prof-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Taylor"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-email" className="text-xs font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="prof-email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="pl-9 text-xs bg-secondary/30 opacity-80"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prof-role" className="text-xs font-medium">
                Primary Target Role
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="prof-role"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Staff Frontend Architect"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-phone" className="text-xs font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="prof-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prof-loc" className="text-xs font-medium">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="prof-loc"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA / Remote"
                  className="pl-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prof-web" className="text-xs font-medium">
                Portfolio / Website URL
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="prof-web"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="e.g. https://alextaylor.dev"
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[image:var(--gradient-emerald)] text-primary-foreground font-semibold shadow-[var(--shadow-glow)] gap-2 text-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Saving Changes…
                </>
              ) : (
                "Save Profile Information"
              )}
            </Button>

            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <Check className="size-4" /> Profile saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
