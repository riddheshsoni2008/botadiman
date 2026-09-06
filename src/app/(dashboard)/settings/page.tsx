"use client";

import { useState, useEffect } from "react";
import { getStudioSettings, updateStudioSettings } from "@/actions/settings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings, Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studioName: "",
    phone: "",
    address: "",
  });
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await getStudioSettings();
      if (res.success && res.data) {
        setForm({
          studioName: res.data.studioName || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
        });
        setSettings(res.data);
      }
      setLoading(false);
    })();
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await updateStudioSettings(form);
    if (res.success) {
      toast.success("Settings updated");
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Studio Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure your studio profile and details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-500" /> Studio Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Studio Name
            </label>
            <Input value={form.studioName} onChange={(e) => setForm({ ...form, studioName: e.target.value })} placeholder="Botadi Studio" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Phone
            </label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Studio phone number" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Address
            </label>
            <Textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Studio address"
              rows={3}
            />
          </div>

          {settings && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
              <p><span className="font-semibold">Owner:</span> {settings.ownerName}</p>
              <p><span className="font-semibold">Email:</span> {settings.email}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
