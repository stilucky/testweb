"use client";

import { useState, useMemo } from "react";
import { Mail, Trash2, Search, Download, Check, X, Users } from "lucide-react";
import { useSubscriberStore } from "@/store/subscriberStore";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminSubscribersPage() {
  const { subscribers, deleteSubscriber } = useSubscriberStore();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...subscribers]
      .sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime())
      .filter((s) => s.email.toLowerCase().includes(q) || s.couponCode.toLowerCase().includes(q));
  }, [subscribers, search]);

  const handleExport = () => {
    const lines = [
      "Email,Coupon Code,Subscribed At,Coupon Used",
      ...subscribers.map(
        (s) =>
          `${s.email},${s.couponCode},${new Date(s.subscribedAt).toLocaleDateString("en-US")},${s.couponUsed ? "Yes" : "No"}`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lunelle-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEmails = () => {
    const text = subscribers.map((s) => s.email).join("\n");
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-stone-900 tracking-wide">Subscribers</h1>
          <p className="text-xs text-stone-400 mt-1">{subscribers.length} newsletter subscribers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyEmails}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 border border-stone-200 text-stone-600 text-xs tracking-widests uppercase px-4 py-2.5 hover:bg-stone-50 transition-colors disabled:opacity-40"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Mail size={13} />}
            {copied ? "Copied!" : "Copy Emails"}
          </button>
          <button
            onClick={handleExport}
            disabled={subscribers.length === 0}
            className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widests uppercase px-5 py-2.5 hover:bg-stone-700 transition-colors disabled:opacity-40"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
        {[
          { label: "Total Subscribers", value: subscribers.length, icon: Users },
          {
            label: "Coupon Claimed",
            value: subscribers.filter((s) => s.couponUsed).length,
            icon: Check,
          },
          {
            label: "Coupon Pending",
            value: subscribers.filter((s) => !s.couponUsed).length,
            icon: Mail,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-stone-100 p-4 flex items-center gap-4">
            <div className="w-9 h-9 bg-stone-100 rounded-full flex items-center justify-center shrink-0">
              <Icon size={15} className="text-stone-500" />
            </div>
            <div>
              <p className="text-[10px] tracking-widests uppercase text-stone-400">{label}</p>
              <p className="text-2xl font-light text-stone-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search email or code..."
          className="w-full pl-9 pr-3 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-stone-200">
          <Mail size={24} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm text-stone-400">
            {search ? "No subscribers match your search" : "No subscribers yet"}
          </p>
          {!search && (
            <p className="text-xs text-stone-300 mt-1">
              Subscribers appear here when someone signs up via the newsletter form
            </p>
          )}
        </div>
      ) : (
        <div className="border border-stone-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {["Email", "Welcome Code", "Subscribed", "Coupon Status", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal px-4 py-3 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-stone-50/50 transition-colors group">
                  {/* Email */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-[10px] text-stone-500 font-medium shrink-0 uppercase">
                        {sub.email[0]}
                      </div>
                      <span className="text-xs text-stone-800">{sub.email}</span>
                    </div>
                  </td>

                  {/* Coupon code */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs font-medium tracking-widest text-stone-900 bg-stone-100 px-2 py-0.5">
                      {sub.couponCode}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-stone-500 whitespace-nowrap">
                    {formatDate(sub.subscribedAt)}
                  </td>

                  {/* Coupon status */}
                  <td className="px-4 py-3.5">
                    {sub.couponUsed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-widests uppercase bg-stone-100 text-stone-400">
                        <Check size={9} /> Used
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-widests uppercase bg-emerald-50 text-emerald-600">
                        <Mail size={9} /> Pending
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setDeleteConfirm(sub.id)}
                      className="p-1.5 rounded text-stone-300 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50">
            <p className="text-[11px] text-stone-400">
              {filtered.length} of {subscribers.length} subscribers
            </p>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-medium mb-2">Remove subscriber?</h3>
            <p className="text-xs text-stone-500 mb-5">
              This will remove{" "}
              <span className="font-medium text-stone-900">
                {subscribers.find((s) => s.id === deleteConfirm)?.email}
              </span>{" "}
              from your subscriber list. Their coupon code will remain active.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-stone-200 text-xs tracking-widests uppercase text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteSubscriber(deleteConfirm); setDeleteConfirm(null); }}
                className="px-4 py-2 bg-red-600 text-white text-xs tracking-widests uppercase hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
