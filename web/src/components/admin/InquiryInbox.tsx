"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { deleteInquiry, listInquiries, updateInquiryStatus } from "@/lib/api-client";
import type { AdminLabels } from "@/lib/admin";
import { formatDate } from "@/lib/utils";
import type { InquiryRead, InquiryStatus } from "@/lib/types";

const PAGE_SIZE = 10;

const STATUS_STYLES: Record<InquiryStatus, string> = {
  new: "bg-accent/15 text-accent",
  read: "bg-blue-100 text-blue-700",
  replied: "bg-primary/10 text-primary",
};

type Props = {
  labels: AdminLabels;
};

export function InquiryInbox({ labels }: Props) {
  const [items, setItems] = useState<InquiryRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (target: number, q: string, statusFilter: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listInquiries({
          page: target,
          page_size: PAGE_SIZE,
          q: q || undefined,
          status: statusFilter || undefined,
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
    [labels.error],
  );

  useEffect(() => {
    void load(1, "", "");
  }, [load]);

  function applyFilters(nextStatus: string) {
    setStatus(nextStatus);
    void load(1, query, nextStatus);
  }

  async function changeStatus(item: InquiryRead, next: InquiryStatus) {
    try {
      const updated = await updateInquiryStatus(item.id, next);
      setItems((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    }
  }

  async function remove(item: InquiryRead) {
    if (!window.confirm(labels.confirmDelete)) return;
    try {
      await deleteInquiry(item.id);
      void load(items.length === 1 && page > 1 ? page - 1 : page, query, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.error);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {labels.inquiries} <span className="text-base font-normal text-ink/50">({total})</span>
      </h1>

      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void load(1, query, status);
          }}
          className="relative flex-1 sm:max-w-xs"
        >
          <Icon
            name="mail"
            size={16}
            className="pointer-events-none absolute inset-y-0 start-3 my-auto text-ink/40"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            className="w-full rounded-lg border border-black/10 bg-white py-2 pe-3 ps-9 text-sm outline-none focus:border-primary"
          />
        </form>
        <div className="flex gap-1 rounded-lg border border-black/10 bg-white p-1 text-sm">
          {[
            { value: "", label: labels.all },
            { value: "new", label: "New" },
            { value: "read", label: "Read" },
            { value: "replied", label: "Replied" },
          ].map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              onClick={() => applyFilters(option.value)}
              className={
                status === option.value
                  ? "rounded-md bg-primary px-3 py-1 font-medium text-white"
                  : "rounded-md px-3 py-1 text-ink/60 hover:bg-surface"
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-black/5 bg-white">
        <ul className="divide-y divide-black/5">
          {loading ? (
            <li className="px-5 py-10 text-center text-sm text-ink/50">{labels.loading}</li>
          ) : items.length === 0 ? (
            <li className="px-5 py-10 text-center text-sm text-ink/50">{labels.empty}</li>
          ) : (
            items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 text-start hover:bg-surface"
                >
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[item.status]
                    }`}
                  >
                    {item.status}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.subject}</p>
                    <p className="truncate text-xs text-ink/50">
                      {item.name} · {item.email}
                      {item.phone ? ` · ${item.phone}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-ink/40">
                    {formatDate(item.created_at)}
                  </span>
                </button>

                {expanded === item.id && (
                  <div className="border-t border-black/5 bg-surface/60 px-5 py-4">
                    <p className="whitespace-pre-line text-sm text-ink/80">{item.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.status !== "read" && (
                        <button
                          type="button"
                          onClick={() => void changeStatus(item, "read")}
                          className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium"
                        >
                          {labels.markRead}
                        </button>
                      )}
                      {item.status !== "replied" && (
                        <button
                          type="button"
                          onClick={() => void changeStatus(item, "replied")}
                          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary"
                        >
                          {labels.markReplied}
                        </button>
                      )}
                      <a
                        href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject)}`}
                        className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        {labels.email}
                      </a>
                      <button
                        type="button"
                        onClick={() => void remove(item)}
                        className="ms-auto rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600"
                      >
                        {labels.delete}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-black/5 px-4 py-3 text-sm">
            <span className="text-ink/50">
              {labels.page} {page} {labels.of} {pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => void load(page - 1, query, status)}
                className="rounded-lg border border-black/10 px-3 py-1.5 disabled:opacity-40"
              >
                <Icon name="chevron-left" size={16} />
              </button>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => void load(page + 1, query, status)}
                className="rounded-lg border border-black/10 px-3 py-1.5 disabled:opacity-40"
              >
                <Icon name="chevron-right" size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
