"use client";

import { useState, useMemo } from "react";
import {
  Mail, Send, Plus, CheckCircle, AlertCircle, Loader2,
  Users, MailCheck, Clock, X, Package,
  BarChart2, Eye, UserCheck, ChevronDown, ChevronUp, Search,
  Square, SquareCheck,
} from "lucide-react";
import { useSubscriberStore, EmailCampaign } from "@/store/subscriberStore";
import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";
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

type RecipientMode = "subscribers" | "customers" | "all" | "custom";
type ComposeType   = "new_product" | "custom";

interface SendResult {
  ok: boolean;
  status?: EmailCampaign["status"];
  successCount?: number;
  recipientCount?: number;
  error?: string;
}

// Merged entry for custom selection list
interface RecipientEntry {
  email: string;
  name: string;
  source: "subscriber" | "customer" | "both";
}

export default function AdminEmailsPage() {
  const { subscribers, emailCampaigns, addCampaign } = useSubscriberStore();
  const { products } = useProductStore();
  const { users } = useAuthStore();

  // Registered customers (non-admin)
  const customers = useMemo(
    () => users.filter((u) => u.role === "customer"),
    [users]
  );

  // ── Compose state ──────────────────────────────────────────────────────────
  const [composeOpen, setComposeOpen]         = useState(false);
  const [recipientMode, setRecipientMode]     = useState<RecipientMode>("subscribers");
  const [customTab, setCustomTab]             = useState<"subscribers" | "customers">("subscribers");
  const [customEmails, setCustomEmails]       = useState<Set<string>>(new Set());
  const [recipientSearch, setRecipientSearch] = useState("");
  const [composeType, setComposeType]         = useState<ComposeType>("new_product");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productSearch, setProductSearch]     = useState("");
  const [customSubject, setCustomSubject]     = useState("");
  const [customBody, setCustomBody]           = useState("");
  const [sending, setSending]                 = useState(false);
  const [sendResult, setSendResult]           = useState<SendResult | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<EmailCampaign | null>(null);

  // ── Computed recipient lists ────────────────────────────────────────────────
  const allEmailsUnique = useMemo(() => {
    const set = new Set([
      ...subscribers.map((s) => s.email),
      ...customers.map((u) => u.email),
    ]);
    return [...set];
  }, [subscribers, customers]);

  const finalEmails = useMemo((): string[] => {
    switch (recipientMode) {
      case "subscribers": return subscribers.map((s) => s.email);
      case "customers":   return customers.map((u) => u.email);
      case "all":         return allEmailsUnique;
      case "custom":      return [...customEmails];
    }
  }, [recipientMode, customEmails, subscribers, customers, allEmailsUnique]);

  // Merged list for custom selection
  const mergedRecipients = useMemo((): RecipientEntry[] => {
    const map = new Map<string, RecipientEntry>();
    subscribers.forEach((s) =>
      map.set(s.email, { email: s.email, name: s.email, source: "subscriber" })
    );
    customers.forEach((u) => {
      const existing = map.get(u.email);
      if (existing) {
        map.set(u.email, { ...existing, name: `${u.firstName} ${u.lastName}`, source: "both" });
      } else {
        map.set(u.email, { email: u.email, name: `${u.firstName} ${u.lastName}`, source: "customer" });
      }
    });
    return [...map.values()];
  }, [subscribers, customers]);

  const filteredCustomList = useMemo(() => {
    const base =
      customTab === "subscribers"
        ? mergedRecipients.filter((r) => r.source === "subscriber" || r.source === "both")
        : mergedRecipients.filter((r) => r.source === "customer" || r.source === "both");
    const q = recipientSearch.toLowerCase();
    return q ? base.filter((r) => r.email.includes(q) || r.name.toLowerCase().includes(q)) : base;
  }, [mergedRecipients, customTab, recipientSearch]);

  // ── Product helpers ─────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
  }, [products, productSearch]);

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCustomEmail = (email: string) => {
    setCustomEmails((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  };

  const toggleAllInCustomTab = () => {
    const allEmails = filteredCustomList.map((r) => r.email);
    const allSelected = allEmails.every((e) => customEmails.has(e));
    setCustomEmails((prev) => {
      const next = new Set(prev);
      allEmails.forEach((e) => (allSelected ? next.delete(e) : next.add(e)));
      return next;
    });
  };

  // ── Subject auto-generation ────────────────────────────────────────────────
  const autoSubject = useMemo(() => {
    if (composeType === "custom") return customSubject;
    if (selectedProducts.length === 0) return "";
    if (selectedProducts.length === 1) return `New Arrival: ${selectedProducts[0].name}`;
    return `New Arrivals at Lunelle — ${selectedProducts.slice(0, 2).map((p) => p.name).join(", ")}${selectedProducts.length > 2 ? " & more" : ""}`;
  }, [composeType, selectedProducts, customSubject]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = emailCampaigns.filter((c) => {
      const d = new Date(c.sentAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const totalReached = emailCampaigns.reduce((acc, c) => acc + c.successCount, 0);
    return { thisMonth, totalReached };
  }, [emailCampaigns]);

  // ── Send ───────────────────────────────────────────────────────────────────
  const canSend = finalEmails.length > 0 &&
    (composeType === "new_product"
      ? selectedProductIds.length > 0
      : customSubject.trim() && customBody.trim());

  const handleSend = async () => {
    if (!canSend) return;
    setSending(true);
    setSendResult(null);

    const subject = autoSubject;
    const payload =
      composeType === "new_product"
        ? {
            emails: finalEmails,
            subject,
            type: "new_product" as const,
            products: selectedProducts.map((p) => ({
              name: p.name,
              slug: p.slug,
              price: p.priceCAD ?? p.price,
              salePrice: p.salePriceCAD ?? p.salePrice,
              image: p.images[0] ?? "",
              shortDescription: p.shortDescription,
              currency: "CAD",
            })),
          }
        : {
            emails: finalEmails,
            subject: customSubject.trim(),
            type: "custom" as const,
            customHtml: customBody.trim(),
          };

    try {
      const res = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: SendResult = await res.json();
      setSendResult(data);

      if (data.ok) {
        addCampaign({
          type: composeType,
          subject: payload.subject,
          productIds:    composeType === "new_product" ? selectedProductIds : undefined,
          productNames:  composeType === "new_product" ? selectedProducts.map((p) => p.name) : undefined,
          productImage:  composeType === "new_product" ? selectedProducts[0]?.images[0] : undefined,
          recipientSource: recipientMode,
          sentAt: new Date().toISOString(),
          recipientCount: data.recipientCount ?? finalEmails.length,
          successCount:   data.successCount ?? 0,
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
    setSelectedProductIds([]);
    setCustomSubject("");
    setCustomBody("");
    setCustomEmails(new Set());
    setRecipientSearch("");
    setProductSearch("");
    setRecipientMode("subscribers");
    setComposeType("new_product");
  };

  // ── Recipient mode cards ────────────────────────────────────────────────────
  const recipientModes: { mode: RecipientMode; icon: React.ElementType; label: string; sub: string; count: number }[] = [
    { mode: "subscribers", icon: Mail,      label: "Subscribers",     sub: "Newsletter signups",    count: subscribers.length },
    { mode: "customers",   icon: UserCheck, label: "Customers",       sub: "Registered accounts",  count: customers.length },
    { mode: "all",         icon: Users,     label: "All (Combined)",  sub: "Unique emails",         count: allEmailsUnique.length },
    { mode: "custom",      icon: SquareCheck, label: "Custom",        sub: "Choose recipients",     count: customEmails.size },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-stone-900 tracking-wide">Email Campaigns</h1>
          <p className="text-xs text-stone-400 mt-1">
            {subscribers.length} subscribers · {customers.length} registered customers
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
          { label: "Subscribers",  value: subscribers.length,     icon: Mail,      color: "text-stone-700" },
          { label: "Customers",    value: customers.length,        icon: UserCheck, color: "text-blue-600" },
          { label: "This Month",   value: stats.thisMonth,         icon: Clock,     color: "text-amber-600" },
          { label: "Total Reached",value: stats.totalReached,      icon: BarChart2, color: "text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="border border-stone-100 p-4 flex items-center gap-3 bg-white">
            <div className="w-9 h-9 bg-stone-50 rounded-full flex items-center justify-center shrink-0">
              <Icon size={15} className={color} />
            </div>
            <div>
              <p className="text-[10px] tracking-widests uppercase text-stone-400">{label}</p>
              <p className="text-2xl font-light text-stone-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign History */}
      <h2 className="text-xs tracking-widests uppercase text-stone-400 mb-4">Campaign History</h2>
      {emailCampaigns.length === 0 ? (
        <div className="border border-dashed border-stone-200 py-20 text-center">
          <MailCheck size={24} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm text-stone-400 mb-1">No campaigns sent yet</p>
          <p className="text-xs text-stone-300">Compose your first campaign to get started</p>
        </div>
      ) : (
        <div className="border border-stone-100 overflow-x-auto bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {["Subject", "Type", "Recipients", "Delivered", "Status", "Sent At", ""].map((h) => (
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
                        <div className="w-8 h-8 shrink-0 bg-stone-100" style={{ backgroundImage: `url(${c.productImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                      ) : (
                        <div className="w-8 h-8 shrink-0 bg-stone-100 flex items-center justify-center">
                          <Mail size={12} className="text-stone-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-stone-800 truncate max-w-[180px]">{c.subject}</p>
                        {c.productNames && c.productNames.length > 1 && (
                          <p className="text-[10px] text-stone-400 mt-0.5">{c.productNames.length} products</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1 text-[10px] tracking-widests uppercase text-stone-500">
                      {c.type === "new_product" ? <><Package size={9} /> Product</> : <><Mail size={9} /> Custom</>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <span className="text-xs font-medium text-stone-700">{c.recipientCount}</span>
                      <p className="text-[10px] text-stone-400 mt-0.5 capitalize">{c.recipientSource?.replace("_", " ")}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-medium text-emerald-600">{c.successCount}</span>
                    <span className="text-xs text-stone-400"> / {c.recipientCount}</span>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3.5 text-xs text-stone-500 whitespace-nowrap">{formatDate(c.sentAt)}</td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setPreviewCampaign(c)} className="p-1.5 rounded text-stone-300 hover:text-stone-700 hover:bg-stone-100 transition-colors opacity-0 group-hover:opacity-100">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          Compose Modal
      ════════════════════════════════════════════════════════════════════════ */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={!sending ? closeCompose : undefined} />
          <div className="relative bg-white w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
              <h2 className="text-base font-light text-stone-900">Compose Campaign</h2>
              <button onClick={closeCompose} disabled={sending} className="p-1 text-stone-400 hover:text-stone-900 disabled:opacity-40">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-7">

              {/* ── Section 1: Recipients ── */}
              <section>
                <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-3 flex items-center gap-2">
                  <Users size={11} /> Recipients
                  {finalEmails.length > 0 && (
                    <span className="bg-stone-900 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                      {finalEmails.length}
                    </span>
                  )}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {recipientModes.map(({ mode, icon: Icon, label, sub, count }) => (
                    <button
                      key={mode}
                      onClick={() => setRecipientMode(mode)}
                      className={cn(
                        "flex flex-col items-start p-3 border text-left transition-all",
                        recipientMode === mode
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 hover:border-stone-400"
                      )}
                    >
                      <Icon size={13} className="mb-1.5" />
                      <p className="text-xs font-medium leading-tight">{label}</p>
                      <p className={cn("text-[10px] mt-0.5", recipientMode === mode ? "text-stone-300" : "text-stone-400")}>
                        {mode === "custom" ? (count > 0 ? `${count} selected` : sub) : `${count} ${sub}`}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Custom selection */}
                {recipientMode === "custom" && (
                  <div className="border border-stone-200">
                    {/* Tabs */}
                    <div className="flex border-b border-stone-100">
                      {(["subscribers", "customers"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setCustomTab(tab)}
                          className={cn(
                            "flex-1 py-2.5 text-[10px] tracking-widests uppercase transition-colors",
                            customTab === tab
                              ? "bg-stone-900 text-white"
                              : "text-stone-500 hover:bg-stone-50"
                          )}
                        >
                          {tab === "subscribers"
                            ? `Subscribers (${subscribers.length})`
                            : `Customers (${customers.length})`}
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative border-b border-stone-100">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        value={recipientSearch}
                        onChange={(e) => setRecipientSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    {/* Select all row */}
                    {filteredCustomList.length > 0 && (
                      <button
                        onClick={toggleAllInCustomTab}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-500 hover:bg-stone-50 border-b border-stone-50 transition-colors"
                      >
                        {filteredCustomList.every((r) => customEmails.has(r.email))
                          ? <SquareCheck size={13} className="text-stone-700" />
                          : <Square size={13} />
                        }
                        Select all ({filteredCustomList.length})
                      </button>
                    )}

                    {/* List */}
                    <div className="max-h-44 overflow-y-auto divide-y divide-stone-50">
                      {filteredCustomList.length === 0 ? (
                        <p className="text-xs text-stone-400 text-center py-6">No recipients found</p>
                      ) : filteredCustomList.map((r) => (
                        <button
                          key={r.email}
                          onClick={() => toggleCustomEmail(r.email)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                            customEmails.has(r.email) ? "bg-stone-50" : "hover:bg-stone-50/50"
                          )}
                        >
                          {customEmails.has(r.email)
                            ? <SquareCheck size={13} className="text-stone-700 shrink-0" />
                            : <Square size={13} className="text-stone-300 shrink-0" />
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-stone-800 truncate">{r.source !== "subscriber" ? r.name : r.email}</p>
                            {r.source !== "subscriber" && (
                              <p className="text-[10px] text-stone-400 truncate">{r.email}</p>
                            )}
                          </div>
                          <span className={cn(
                            "text-[9px] tracking-widests uppercase px-1.5 py-0.5 shrink-0",
                            r.source === "both"       ? "bg-purple-50 text-purple-500" :
                            r.source === "customer"   ? "bg-blue-50 text-blue-500" :
                            "bg-stone-100 text-stone-400"
                          )}>
                            {r.source === "both" ? "sub+cust" : r.source}
                          </span>
                        </button>
                      ))}
                    </div>

                    {customEmails.size > 0 && (
                      <div className="px-3 py-2 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                        <p className="text-[10px] text-stone-500">{customEmails.size} selected</p>
                        <button onClick={() => setCustomEmails(new Set())} className="text-[10px] text-stone-400 hover:text-stone-700">
                          Clear all
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* ── Section 2: Content Type ── */}
              <section>
                <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-3 flex items-center gap-2">
                  <Mail size={11} /> Content
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(["new_product", "custom"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setComposeType(t)}
                      className={cn(
                        "flex items-center gap-2 p-3 border text-xs text-left transition-all",
                        composeType === t
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 text-stone-600 hover:border-stone-400"
                      )}
                    >
                      {t === "new_product" ? <Package size={13} /> : <Mail size={13} />}
                      {t === "new_product" ? "New Arrivals" : "Custom Email"}
                    </button>
                  ))}
                </div>

                {/* ── New Product: multi-select grid ── */}
                {composeType === "new_product" && (
                  <div className="border border-stone-200">
                    {/* Search + count */}
                    <div className="flex items-center border-b border-stone-100">
                      <div className="relative flex-1">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className="w-full pl-8 pr-3 py-2 text-xs focus:outline-none"
                        />
                      </div>
                      {selectedProductIds.length > 0 && (
                        <span className="px-3 text-[10px] text-stone-400 shrink-0">
                          {selectedProductIds.length} selected
                        </span>
                      )}
                    </div>

                    {/* Product list */}
                    <div className="max-h-56 overflow-y-auto divide-y divide-stone-50">
                      {filteredProducts.length === 0 ? (
                        <p className="text-xs text-stone-400 text-center py-8">No products found</p>
                      ) : filteredProducts.map((p) => {
                        const checked = selectedProductIds.includes(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => toggleProduct(p.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                              checked ? "bg-stone-50" : "hover:bg-stone-50/50"
                            )}
                          >
                            {checked
                              ? <SquareCheck size={14} className="text-stone-800 shrink-0" />
                              : <Square size={14} className="text-stone-300 shrink-0" />
                            }
                            {p.images[0] ? (
                              <div className="w-9 h-9 shrink-0 bg-stone-100" style={{ backgroundImage: `url(${p.images[0]})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                            ) : (
                              <div className="w-9 h-9 shrink-0 bg-stone-100 flex items-center justify-center">
                                <Package size={12} className="text-stone-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-stone-800 truncate">{p.name}</p>
                              <p className="text-[10px] text-stone-400 mt-0.5">
                                CAD ${(p.salePriceCAD ?? p.priceCAD ?? p.salePrice ?? p.price).toFixed(2)}
                                {p.isNew && <span className="ml-1.5 text-emerald-500">✦ New</span>}
                              </p>
                            </div>
                            <span className="text-[10px] text-stone-300 capitalize shrink-0">{p.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Custom type ── */}
                {composeType === "custom" && (
                  <div className="space-y-3">
                    <input
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Email subject..."
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                    />
                    <textarea
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      placeholder="Email body (HTML or plain text)..."
                      rows={6}
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors resize-y font-mono"
                    />
                  </div>
                )}
              </section>

              {/* ── Preview summary ── */}
              {(autoSubject || finalEmails.length > 0) && !sendResult && (
                <div className="bg-stone-50 border border-stone-100 p-4 space-y-2 text-xs">
                  <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-2">Preview</p>
                  {autoSubject && (
                    <div className="flex items-start gap-2">
                      <span className="text-stone-400 shrink-0">Subject:</span>
                      <span className="text-stone-700 font-medium">{autoSubject}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="text-stone-400 shrink-0">To:</span>
                    <span className="text-stone-700">
                      {finalEmails.length} recipient{finalEmails.length !== 1 ? "s" : ""}
                      {" "}
                      <span className="text-stone-400">
                        ({recipientMode === "custom" ? "custom selection" : recipientMode.replace("_", " ")})
                      </span>
                    </span>
                  </div>
                  {composeType === "new_product" && selectedProducts.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-stone-400 shrink-0">Products:</span>
                      <span className="text-stone-700">{selectedProducts.map((p) => p.name).join(", ")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ── Send result ── */}
              {sendResult && (
                <div className={cn(
                  "flex items-start gap-3 p-4 border",
                  sendResult.ok ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
                )}>
                  {sendResult.ok
                    ? <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    : <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  }
                  <div>
                    {sendResult.ok ? (
                      <p className="text-xs font-medium text-emerald-700">
                        Campaign sent — {sendResult.successCount} of {sendResult.recipientCount} delivered
                        {sendResult.status === "partial" && <span className="font-normal text-emerald-600 ml-1">(some failed)</span>}
                      </p>
                    ) : (
                      <p className="text-xs text-red-600">{sendResult.error ?? "Send failed. Check SMTP settings."}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-stone-100 shrink-0">
              <button
                onClick={closeCompose}
                disabled={sending}
                className="flex-1 border border-stone-200 text-stone-600 text-xs tracking-widests uppercase py-3 hover:bg-stone-50 transition-colors disabled:opacity-40"
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
                  {sending
                    ? <><Loader2 size={13} className="animate-spin" /> Sending...</>
                    : <><Send size={13} /> Send to {finalEmails.length} recipient{finalEmails.length !== 1 ? "s" : ""}</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Campaign detail ────────────────────────────────────────────────── */}
      {previewCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreviewCampaign(null)} />
          <div className="relative bg-white w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-stone-900">Campaign Details</h3>
              <button onClick={() => setPreviewCampaign(null)} className="p-1 text-stone-400 hover:text-stone-900">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {[
                ["Subject",    previewCampaign.subject],
                ["Type",       previewCampaign.type.replace("_", " ")],
                ["Recipients", previewCampaign.recipientSource ?? "—"],
                ["Sent at",    formatDate(previewCampaign.sentAt)],
                ["Total",      String(previewCampaign.recipientCount)],
                ["Delivered",  String(previewCampaign.successCount)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-stone-400 shrink-0">{k}</span>
                  <span className="text-stone-800 text-right capitalize truncate max-w-[60%]">{v}</span>
                </div>
              ))}
              {previewCampaign.productNames && previewCampaign.productNames.length > 0 && (
                <div>
                  <span className="text-stone-400 block mb-1.5">Products</span>
                  <div className="space-y-1">
                    {previewCampaign.productNames.map((name) => (
                      <p key={name} className="text-stone-700 text-xs">· {name}</p>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t border-stone-50">
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
