"use client";

import { useEffect, useState } from "react";
import { getAdminSettings, saveAdminSettings } from "@/lib/api-client";
import type { AdminLabels } from "@/lib/admin";

type FieldSpec = { key: string; label: string; type?: "text" | "email" | "tel" | "textarea" | "url" };

const GROUPS: { title: string; fields: FieldSpec[] }[] = [
  {
    title: "Contact",
    fields: [
      { key: "contact_email", label: "Contact email", type: "email" },
      { key: "contact_phone", label: "Contact phone", type: "tel" },
      { key: "whatsapp_number", label: "WhatsApp number", type: "tel" },
      { key: "shop_hours", label: "Shop hours" },
    ],
  },
  {
    title: "Address",
    fields: [
      { key: "address_street", label: "Street address" },
      { key: "address_city", label: "City" },
    ],
  },
  {
    title: "Map & analytics",
    fields: [
      { key: "google_maps_embed_url", label: "Google Maps embed URL", type: "url" },
      { key: "google_analytics_id", label: "Google Analytics ID" },
    ],
  },
  {
    title: "Social links",
    fields: [
      { key: "social_facebook", label: "Facebook URL", type: "url" },
      { key: "social_instagram", label: "Instagram URL", type: "url" },
      { key: "social_tiktok", label: "TikTok URL", type: "url" },
    ],
  },
];

type Props = {
  labels: AdminLabels;
};

export function SettingsForm({ labels }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAdminSettings()
      .then(setValues)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : labels.error))
      .finally(() => setLoading(false));
  }, [labels.error]);

  function set(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const items = Object.entries(values).map(([key, value]) => ({ key, value }));
      const updated = await saveAdminSettings(items);
      setValues(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-ink/50">{labels.loading}</p>;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{labels.settings}</h1>
        {saved && <span className="text-sm font-medium text-primary">{labels.settingsSaved}</span>}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {GROUPS.map((group) => (
        <section key={group.title} className="rounded-xl border border-black/5 bg-white p-5">
          <h2 className="mb-4 font-semibold">{group.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div key={field.key} className={field.type === "url" ? "sm:col-span-2" : ""}>
                <label className="mb-1 block text-sm font-medium" htmlFor={field.key}>
                  {field.label}
                </label>
                <input
                  id={field.key}
                  type={field.type ?? "text"}
                  value={values[field.key] ?? ""}
                  onChange={(event) => set(field.key, event.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-dark disabled:opacity-60"
        >
          {saving ? labels.saving : labels.saveSettings}
        </button>
      </div>
    </form>
  );
}
