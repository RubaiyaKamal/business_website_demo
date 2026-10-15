"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ImageField } from "@/components/admin/ImageField";
import {
  createResource,
  deleteResource,
  listResource,
  setPublished,
  updateResource,
} from "@/lib/api-client";
import {
  allFields,
  buildPayload,
  defaultFormValue,
  recordToForm,
  type AdminLabels,
  type ResourceDef,
} from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import type { ResourceRecord } from "@/lib/types";

const PAGE_SIZE = 10;

type Props = {
  resource: ResourceDef;
  labels: AdminLabels;
};

export function ResourceManager({ resource, labels }: Props) {
  const fields = allFields(resource);

  const [items, setItems] = useState<ResourceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceRecord | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(
    async (target: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listResource(resource.endpoint, {
          page: target,
          page_size: PAGE_SIZE,
        });
        setItems(result.items);
        setTotal(result.total);
        setPages(result.pages);
        setPage(result.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : labels.error);
      } finally {
        setLoading(false);
      }
    },
    [resource.endpoint, labels.error],
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  function openCreate() {
    const defaults: Record<string, unknown> = {};
    for (const field of fields) defaults[field.name] = defaultFormValue(field, resource);
    setValues(defaults);
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(record: ResourceRecord) {
    setValues(recordToForm(record, fields));
    setEditing(record);
    setFormError(null);
    setFormOpen(true);
  }

  function setField(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = buildPayload(values, fields);
      if (editing) {
        await updateResource(resource.endpoint, editing.id, payload);
      } else {
        await createResource(resource.endpoint, payload);
      }
      setFormOpen(false);
      await load(editing ? page : 1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : labels.error);
    } finally {
      setSaving(false);
    }
  }

  async function remove(record: ResourceRecord) {
    if (!window.confirm(labels.confirmDelete)) return;
    try {
      await deleteResource(resource.endpoint, record.id);
      await load(items.length === 1 && page > 1 ? page - 1 : page);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    }
  }

  async function togglePublish(record: ResourceRecord) {
    try {
      await setPublished(resource.endpoint, record.id, !record.is_published);
      await load(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    }
  }

  function renderCell(record: ResourceRecord, name: string, kind?: string) {
    const raw = record[name];
    if (kind === "image") {
      return raw ? (
        <Image
          src={String(raw)}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded object-cover"
          unoptimized
        />
      ) : (
        <span className="grid h-11 w-11 place-items-center rounded bg-surface text-ink/30">
          <Icon name="image" size={16} />
        </span>
      );
    }
    if (kind === "bool") {
      return raw ? (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {labels.published}
        </span>
      ) : (
        <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs font-medium text-ink/50">
          {labels.draft}
        </span>
      );
    }
    if (raw === null || raw === undefined || raw === "") return <span className="text-ink/30">—</span>;
    if (name.endsWith("_at")) return formatDate(String(raw));
    return <span className="line-clamp-2">{String(raw)}</span>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{labels[resource.titleKey]}</h1>
          <p className="text-sm text-ink/50">{total}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark"
        >
          <Icon name="plus" size={16} />
          {labels.create}
        </button>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button type="button" onClick={() => void load(page)} className="font-semibold underline">
            {labels.retry}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-black/5 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-start text-xs uppercase text-ink/50">
              <tr>
                {resource.columns.map((column) => (
                  <th key={column.name} className="px-4 py-3 font-medium">
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-end font-medium">{labels.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={resource.columns.length + 1} className="px-4 py-10 text-center text-ink/50">
                    {labels.loading}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={resource.columns.length + 1} className="px-4 py-10 text-center text-ink/50">
                    {labels.empty}
                  </td>
                </tr>
              ) : (
                items.map((record) => (
                  <tr key={record.id} className="align-middle">
                    {resource.columns.map((column) => (
                      <td key={column.name} className="px-4 py-3">
                        {renderCell(record, column.name, column.kind)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {resource.hasPublish && (
                          <button
                            type="button"
                            onClick={() => void togglePublish(record)}
                            className="rounded p-1.5 text-ink/60 hover:bg-surface"
                            title={record.is_published ? labels.unpublish : labels.publish}
                          >
                            <Icon name={record.is_published ? "x" : "check"} size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(record)}
                          className="rounded p-1.5 text-primary hover:bg-primary/10"
                          title={labels.edit}
                        >
                          <Icon name="pencil" size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(record)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                          title={labels.delete}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-black/5 px-4 py-3 text-sm">
            <span className="text-ink/50">
              {labels.page} {page} {labels.of} {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => void load(page - 1)}
                className="rounded-lg border border-black/10 px-3 py-1.5 disabled:opacity-40"
              >
                <Icon name="chevron-left" size={16} />
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => void load(page + 1)}
                className="rounded-lg border border-black/10 px-3 py-1.5 disabled:opacity-40"
              >
                <Icon name="chevron-right" size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
          <form
            onSubmit={submit}
            className="w-full max-w-3xl rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
              <h2 className="text-lg font-bold">
                {editing ? labels.edit : labels.create} · {labels[resource.titleKey]}
              </h2>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded p-1 text-ink/50 hover:bg-surface"
                aria-label={labels.close}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
                  {field.type !== "checkbox" && (
                    <label className="mb-1 block text-sm font-medium" htmlFor={`f-${field.name}`}>
                      {field.label}
                      {field.required && <span className="text-red-500"> *</span>}
                    </label>
                  )}
                  {field.type === "textarea" ? (
                    <textarea
                      id={`f-${field.name}`}
                      value={String(values[field.name] ?? "")}
                      rows={field.rows ?? 4}
                      required={field.required}
                      placeholder={field.placeholder}
                      onChange={(event) => setField(field.name, event.target.value)}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  ) : field.type === "list" ? (
                    <textarea
                      id={`f-${field.name}`}
                      value={String(values[field.name] ?? "")}
                      rows={3}
                      placeholder={field.placeholder}
                      onChange={(event) => setField(field.name, event.target.value)}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  ) : field.type === "image" ? (
                    <ImageField
                      id={`f-${field.name}`}
                      value={String(values[field.name] ?? "")}
                      onChange={(url) => setField(field.name, url)}
                      labels={labels}
                    />
                  ) : field.type === "checkbox" ? (
                    <label className="mt-6 flex items-center gap-2 text-sm">
                      <input
                        id={`f-${field.name}`}
                        type="checkbox"
                        checked={Boolean(values[field.name])}
                        onChange={(event) => setField(field.name, event.target.checked)}
                        className="h-4 w-4 rounded border-black/20 text-primary"
                      />
                      {field.label}
                    </label>
                  ) : (
                    <input
                      id={`f-${field.name}`}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={String(values[field.name] ?? "")}
                      required={field.required}
                      placeholder={field.placeholder}
                      onChange={(event) => setField(field.name, event.target.value)}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  )}
                </div>
              ))}
            </div>

            {formError && (
              <p className="mx-6 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-black/5 px-6 py-4">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium"
              >
                {labels.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark disabled:opacity-60"
              >
                {saving ? labels.saving : labels.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
