"use client";

import { useState, useMemo } from "react";
import {
  Mail, Send, Plus, CheckCircle, AlertCircle, Loader2,
  Users, MailCheck, Clock, ChevronRight, X, Package,
  BarChart2, Eye,
} from "lucide-react";
import { useSubscriberStore, EmailCampaign } from "@/store/subscriberStore";
import { useProductStore } from "@/store/productStore";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: EmailCampaign["status"] }) {
  const map = {
    sent:    { label: "Sent",    cls: "bg-emerald-50 text-emerald-600", icon: CheckCircle },
    partial: { label: "Partial", cls: "bg-amber-50 text-amber-600",     icon: AlertCircle },
    failed:  { label: "Failed",  cls: "bg-red-50 text-red-500",         icon: AlertCircle },
  };
  const { label, cls, icon: Icon } = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-[10px] tracking-widest uppercase font-medium", cls)}>
      <Icon size={9} /> {label}
    </span>
  );
}

type ComposeType = "new_product" | "custom";

interface SendResult {
  ok: boolean;
  status?: string;
  successCount?: number;
  recipientCount?: number;
  error?: string;
}

export default function AdminEmailsPage() {
  const { subscribers, emailCampaigns, addCampaign } = useSubscriberStore();
  const { products } = useProductStore();

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeType, setComposeType] = useState<ComposeType>("new_product");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  const [previewCampaign, setPreviewCampaign] = useState<EmailCampaign | null>(null);

  const activeSubscribers = subscribers; // all are active
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const stats = useMemo(() => {
    const total = emailCampaigns.length;
    const sent = emailCampaigns.filter((c) => c.status === "sent").length;
    const thisMonth = emailCampaigns.filter((c) => {
      const d = new Date(c.sentAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const totalReached = emailCampaigns.reduce((acc, c) => acc + c.successCount, 0);
    return { total, sent, thisMonth, totalReached };
  }, [emailCampaigns]);

  const handleSend = async () => {
    if (activeSubscribers.length === 0) return;

    let subject = "";
    let product = undefined;
    let customHtml = undefined;

    if (composeType === "new_product") {
      if (!selectedProduct) return;
      subject = `New Arrival: ${selectedProduct.name}`;
      product = {
        name: selectedProduct.name,
        slug: selectedProduct.slug,
        price: selectedProduct.price,
        salePrice: selectedProduct.salePrice,
        image: selectedProduct.images[0] ?? "",
        shortDescription: selectedProduct.shortDescription,
        currency: "CAD",
      };
    } else {
      if (!customSubject.trim() || !customBody.trim()) return;
      subject = customSubject.trim();
      customHtml = customBody.trim();
    }

    setSending(true);
    setSendResult(null);

    try {
      const emails = activeSubscribers.map((s) => s.email);
      const res = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emails,
          subject,
          type: composeType,
          product,
          customHtml,
        }),
      });
      const data: SendResult & {
        status?: EmailCampaign["status"];
        successCount?: number;
        recipientCount?: number;
      } = await res.json();

      setSendResult(data);

      if (data.ok) {
        addCampaign({
          type: composeType,
          subject,
          productId: selectedProduct?.id,
          productName: selectedProduct?.name,
          productImage: selectedProduct?.images[0],
          sentAt: new Date().toISOString(),
          recipientCount: data.recipientCount ?? emails.length,
          successCount: data.successCount ?? 0,
          status: data.status ?? "sent",
        });
      }
    } catch {
      setSendResult({ ok: false, error: "Network error. Please try again." });
    } finally {
      setSending(false);
    }
  };

  const closeCompose = () => {
    setComposeOpen(false);
    setSendResult(null);
    setSelectedProductId("");
    setCustomSubject("");
    setCustomBody("");
    setComposeType("new_product");
  };

  const canSend =
    activeSubscribers.length > 0 &&
    (composeType === "new_product"
      ? !!selectedProductId
      : customSubject.trim() && customBody.trim());

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-stone-900 tracking-wide">Email Campaigns</h1>
          <p className="text-xs text-stone-400 mt-1">
            Send newsletters to {activeSubscribers.length} subscriber{activeSubscribers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setComposeOpen(true)}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-stone-700 transition-colors"
        >
          <Plus size={13} /> Compose
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Subscribers",     value: activeSubscribers.length, icon: Users,    color: "text-stone-700" },
          { label: "Campaigns Sent",  value: stats.total,              icon: MailCheck, color: "text-emerald-600" },
          { label: "This Month",      value: stats.thisMonth,          icon: Clock,    color: "text-blue-600" },
          { label: "Total Reached",   value: stats.totalReached,       icon: BarChart2, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="border border-stone-100 p-4 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
              <Icon size={15} className={color} />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-stone-400">{label}</p>
              <p className="text-2xl font-light text-stone-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign History */}
      <div>
        <h2 className="text-xs tracking-widest uppercase text-stone-400 mb-4">Campaign History</h2>

        {emailCampaigns.length === 0 ? (
          <div className="border border-dashed border-stone-200 py-20 text-center">
            <Mail size={24} className="mx-auto text-stone-300 mb-3" />
            <p className="text-sm text-stone-400 mb-1">No campaigns sent yet</p>
            <p className="text-xs text-stone-300">Compose your first campaign to get started</p>
          </div>
        ) : (
          <div className="border border-stone-100 overflow-x-auto bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  {["Subject", "Type", "Sent At", "Recipients", "Delivered", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-[10px] tracking-widests uppercase text-stone-400 font-normal px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {emailCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex items-center gap-2">
                        {c.productImage ? (
                          <div
                            className="w-8 h-8 shrink-0 bg-stone-100"
                            style={{ backgroundImage: `url(${c.productImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
                          />
                        ) : (
                          <div className="w-8 h-8 shrink-0 bg-stone-100 flex items-center justify-center">
                            <Mail size={12} className="text-stone-400" />
                          </div>
                        )}
                        <p className="text-xs text-stone-800 truncate max-w-[200px]">{c.subject}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] tracking-widests uppercase text-stone-500">
                        {c.type === "new_product" ? <><Package size={9} /> Product</> : <><Mail size={9} /> Custom</>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-stone-500 whitespace-nowrap">
                      {formatDate(c.sentAt)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-stone-600 font-medium">
                      {c.recipientCount}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-stone-700">{c.successCount}</span>
                      <span className="text-xs text-stone-400"> / {c.recipientCount}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setPreviewCampaign(c)}
                        className="p-1.5 rounded text-stone-300 hover:text-stone-700 hover:bg-stone-100 transition-colors opacity-0 group-hover:opacity-100"
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Compose Modal ── */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeCompose} />
          <div className="relative bg-white w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-base font-light text-stone-900">Compose Campaign</h2>
                <p className="text-[10px] tracking-widests uppercase text-stone-400 mt-0.5">
                  {activeSubscribers.length} recipient{activeSubscribers.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button onClick={closeCompose} className="p-1 text-stone-400 hover:text-stone-900">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* No subscribers warning */}
              {activeSubscribers.length === 0 && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100">
                  <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    No subscribers yet. Share your newsletter signup form to grow your list.
                  </p>
                </div>
              )}

              {/* Type selector */}
              <div>
                <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-3">Campaign Type</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["new_product", "custom"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setComposeType(t)}
                      className={cn(
                        "flex items-center gap-2 p-3.5 border text-xs transition-all text-left",
                        composeType === t
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 text-stone-600 hover:border-stone-400"
                      )}
                    >
                      {t === "new_product" ? <Package size={13} /> : <Mail size={13} />}
                      {t === "new_product" ? "New Arrival" : "Custom Email"}
                    </button>
                  ))}
                </div>
              </div>

              {/* New product type */}
              {composeType === "new_product" && (
                <div>
                  <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-3">Select Product</p>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors bg-white"
                  >
                    <option value="">— Choose a product —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.isNew ? "✦ New" : ""}
                      </option>
                    ))}
                  </select>

                  {selectedProduct && (
                    <div className="mt-3 flex items-center gap-3 p-3 border border-stone-100 bg-stone-50">
                      {selectedProduct.images[0] && (
                        <div
                          className="w-12 h-12 shrink-0 bg-stone-200"
                          style={{ backgroundImage: `url(${selectedProduct.images[0]})`, backgroundSize: "cover", backgroundPosition: "center" }}
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-stone-900 truncate">{selectedProduct.name}</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          CAD ${selectedProduct.salePrice?.toFixed(2) ?? selectedProduct.price.toFixed(2)}
                          {selectedProduct.salePrice && (
                            <span className="line-through text-stone-300 ml-1.5">${selectedProduct.price.toFixed(2)}</span>
                          )}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-stone-300 ml-auto shrink-0" />
                    </div>
                  )}

                  {selectedProduct && (
                    <p className="text-[11px] text-stone-400 mt-3">
                      Subject: <span className="text-stone-700 font-medium">New Arrival: {selectedProduct.name}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Custom type */}
              {composeType === "custom" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] tracking-widests uppercase text-stone-400 block mb-2">Subject</label>
                    <input
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Your email subject..."
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-widests uppercase text-stone-400 block mb-2">
                      Body <span className="normal-case text-[10px] text-stone-300">(HTML or plain text)</span>
                    </label>
                    <textarea
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      placeholder="Write your email content here..."
                      rows={8}
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors resize-y font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Send result */}
              {sendResult && (
                <div className={cn(
                  "flex items-start gap-3 p-4 border",
                  sendResult.ok
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-red-50 border-red-100"
                )}>
                  {sendResult.ok
                    ? <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    : <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  }
                  <div>
                    {sendResult.ok ? (
                      <>
                        <p className="text-xs font-medium text-emerald-700">
                          Campaign sent — {sendResult.successCount} of {sendResult.recipientCount} delivered
                        </p>
                        {sendResult.status === "partial" && (
                          <p className="text-[11px] text-emerald-600 mt-0.5">
                            Some emails failed. Check SMTP logs.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-red-600">{sendResult.error ?? "Send failed. Check SMTP configuration."}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeCompose}
                  className="flex-1 border border-stone-200 text-stone-600 text-xs tracking-widests uppercase py-3 hover:bg-stone-50 transition-colors"
                >
                  {sendResult?.ok ? "Close" : "Cancel"}
                </button>
                {!sendResult?.ok && (
                  <button
                    onClick={handleSend}
                    disabled={sending || !canSend}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 bg-stone-900 text-white text-xs tracking-widests uppercase py-3 transition-colors",
                      sending || !canSend ? "opacity-40 cursor-not-allowed" : "hover:bg-stone-700"
                    )}
                  >
                    {sending ? (
                      <><Loader2 size={13} className="animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={13} /> Send to {activeSubscribers.length} subscribers</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Campaign detail preview ── */}
      {previewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewCampaign(null)} />
          <div className="relative bg-white w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-stone-900">Campaign Details</h3>
              <button onClick={() => setPreviewCampaign(null)} className="p-1 text-stone-400 hover:text-stone-900">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">Subject</span>
                <span className="text-stone-800 font-medium text-right max-w-[60%] truncate">{previewCampaign.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Type</span>
                <span className="text-stone-700 capitalize">{previewCampaign.type.replace("_", " ")}</span>
              </div>
              {previewCampaign.productName && (
                <div className="flex justify-between">
                  <span className="text-stone-400">Product</span>
                  <span className="text-stone-700">{previewCampaign.productName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-400">Sent at</span>
                <span className="text-stone-700">{formatDate(previewCampaign.sentAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Recipients</span>
                <span className="text-stone-700">{previewCampaign.recipientCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Delivered</span>
                <span className="text-emerald-600 font-medium">{previewCampaign.successCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Status</span>
                <StatusBadge status={previewCampaign.status} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
