"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Tag,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Search,
  X,
  CalendarDays,
  Infinity,
  Hash,
} from "lucide-react";
import { useCouponStore, type Coupon, type DiscountType, type UsageLimit } from "@/store/couponStore";
import { cn } from "@/lib/utils";

// ─── Form state ──────────────────────────────────────────────────────────────

interface FormState {
  code: string;
  label: string;
  type: DiscountType;
  value: string;
  usageLimit: UsageLimit;
  maxUses: string;
  expiresAt: string;
  hasExpiry: boolean;
  minOrderAmount: string;
  hasMinOrder: boolean;
  isActive: boolean;
}

const emptyForm = (): FormState => ({
  code: "",
  label: "",
  type: "percent",
  value: "",
  usageLimit: "unlimited",
  maxUses: "",
  expiresAt: "",
  hasExpiry: false,
  minOrderAmount: "",
  hasMinOrder: false,
  isActive: true,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(coupon: Coupon) {
  if (!coupon.isActive)
    return <span className="px-2 py-0.5 text-[10px] tracking-widest uppercase bg-stone-100 text-stone-400">Inactive</span>;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return <span className="px-2 py-0.5 text-[10px] tracking-widest uppercase bg-red-50 text-red-400">Expired</span>;
  if (coupon.usageLimit === "limited" && coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)
    return <span className="px-2 py-0.5 text-[10px] tracking-widests uppercase bg-amber-50 text-amber-500">Exhausted</span>;
  return <span className="px-2 py-0.5 text-[10px] tracking-widest uppercase bg-emerald-50 text-emerald-600">Active</span>;
}

function usageLine(coupon: Coupon) {
  if (coupon.usageLimit === "unlimited") return "Unlimited";
  if (coupon.usageLimit === "once") return `${coupon.usedCount} / 1 use`;
  return `${coupon.usedCount} / ${coupon.maxUses ?? "∞"}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  form: FormState;
  onChange: (f: FormState) => void;
  onSave: () => void;
  onClose: () => void;
  errors: Partial<Record<keyof FormState, string>>;
  isEdit: boolean;
}

function CouponModal({ form, onChange, onSave, onClose, errors, isEdit }: ModalProps) {
  const set = (patch: Partial<FormState>) => onChange({ ...form, ...patch });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <h2 className="text-xs tracking-widest uppercase font-medium">
            {isEdit ? "Edit Coupon" : "New Coupon"}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Code */}
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
              Promo Code *
            </label>
            <input
              value={form.code}
              onChange={(e) => set({ code: e.target.value.toUpperCase().replace(/\s/g, "") })}
              placeholder="e.g. SUMMER20"
              className={cn(
                "w-full border px-3 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:border-stone-900 transition-colors",
                errors.code ? "border-red-300" : "border-stone-200"
              )}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
          </div>

          {/* Label */}
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
              Description *
            </label>
            <input
              value={form.label}
              onChange={(e) => set({ label: e.target.value })}
              placeholder="e.g. 20% off summer styles"
              className={cn(
                "w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors",
                errors.label ? "border-red-300" : "border-stone-200"
              )}
            />
            {errors.label && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
                Discount Type
              </label>
              <div className="flex border border-stone-200">
                {(["percent", "fixed"] as DiscountType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => set({ type: t })}
                    className={cn(
                      "flex-1 py-2 text-xs tracking-wider uppercase transition-colors",
                      form.type === t ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-50"
                    )}
                  >
                    {t === "percent" ? "%" : "$"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
                Value *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                  {form.type === "percent" ? "%" : "$"}
                </span>
                <input
                  type="number"
                  min={0}
                  max={form.type === "percent" ? 100 : undefined}
                  value={form.value}
                  onChange={(e) => set({ value: e.target.value })}
                  placeholder="0"
                  className={cn(
                    "w-full border pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors",
                    errors.value ? "border-red-300" : "border-stone-200"
                  )}
                />
              </div>
              {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value}</p>}
            </div>
          </div>

          {/* Usage limit */}
          <div>
            <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-2">
              Usage Limit
            </label>
            <div className="flex gap-2">
              {([
                { val: "once", label: "Single use", icon: Hash },
                { val: "limited", label: "Limited", icon: Tag },
                { val: "unlimited", label: "Unlimited", icon: Infinity },
              ] as { val: UsageLimit; label: string; icon: React.ElementType }[]).map(({ val, label, icon: Icon }) => (
                <button
                  key={val}
                  onClick={() => set({ usageLimit: val })}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-3 border text-xs transition-all",
                    form.usageLimit === val
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 text-stone-500 hover:border-stone-400"
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {form.usageLimit === "limited" && (
              <div className="mt-3">
                <label className="block text-[10px] tracking-widests uppercase text-stone-400 mb-1.5">
                  Max Uses *
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses}
                  onChange={(e) => set({ maxUses: e.target.value })}
                  placeholder="e.g. 100"
                  className={cn(
                    "w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900",
                    errors.maxUses ? "border-red-300" : "border-stone-200"
                  )}
                />
                {errors.maxUses && <p className="text-xs text-red-500 mt-1">{errors.maxUses}</p>}
              </div>
            )}
          </div>

          {/* Expiry */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-widests uppercase text-stone-400">
                Expiry Date
              </label>
              <button
                onClick={() => set({ hasExpiry: !form.hasExpiry, expiresAt: "" })}
                className="text-xs text-stone-500 flex items-center gap-1.5 hover:text-stone-900 transition-colors"
              >
                <CalendarDays size={13} />
                {form.hasExpiry ? "Remove expiry" : "Set expiry date"}
              </button>
            </div>
            {form.hasExpiry && (
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => set({ expiresAt: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className={cn(
                  "w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-stone-900",
                  errors.expiresAt ? "border-red-300" : "border-stone-200"
                )}
              />
            )}
            {!form.hasExpiry && (
              <p className="text-xs text-stone-400">No expiry — valid indefinitely</p>
            )}
            {errors.expiresAt && <p className="text-xs text-red-500 mt-1">{errors.expiresAt}</p>}
          </div>

          {/* Min order */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-widests uppercase text-stone-400">
                Minimum Order Amount
              </label>
              <button
                onClick={() => set({ hasMinOrder: !form.hasMinOrder, minOrderAmount: "" })}
                className="text-xs text-stone-500 flex items-center gap-1.5 hover:text-stone-900 transition-colors"
              >
                {form.hasMinOrder ? "Remove minimum" : "Set minimum"}
              </button>
            </div>
            {form.hasMinOrder && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input
                  type="number"
                  min={0}
                  value={form.minOrderAmount}
                  onChange={(e) => set({ minOrderAmount: e.target.value })}
                  placeholder="0"
                  className="w-full border border-stone-200 pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-stone-900"
                />
              </div>
            )}
            {!form.hasMinOrder && (
              <p className="text-xs text-stone-400">No minimum — applies to any order</p>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs tracking-widests uppercase text-stone-500">Active</span>
            <button
              onClick={() => set({ isActive: !form.isActive })}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                form.isActive ? "text-emerald-600" : "text-stone-400"
              )}
            >
              {form.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              {form.isActive ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-stone-200 text-xs tracking-widests uppercase text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 bg-stone-900 text-white text-xs tracking-widests uppercase hover:bg-stone-700 transition-colors"
          >
            {isEdit ? "Save Changes" : "Create Coupon"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useCouponStore();

  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ open: boolean; editId: string | null }>({
    open: false,
    editId: null,
  });
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) || c.label.toLowerCase().includes(q)
    );
  }, [coupons, search]);

  // ─── Open modal ───
  const openNew = () => {
    setForm(emptyForm());
    setErrors({});
    setModal({ open: true, editId: null });
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      label: c.label,
      type: c.type,
      value: String(c.value),
      usageLimit: c.usageLimit,
      maxUses: c.maxUses !== null ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
      hasExpiry: !!c.expiresAt,
      minOrderAmount: c.minOrderAmount !== null ? String(c.minOrderAmount) : "",
      hasMinOrder: c.minOrderAmount !== null,
      isActive: c.isActive,
    });
    setErrors({});
    setModal({ open: true, editId: c.id });
  };

  // ─── Validate ───
  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.code.trim()) e.code = "Code is required";
    else if (
      !modal.editId &&
      coupons.some((c) => c.code.toUpperCase() === form.code.toUpperCase())
    )
      e.code = "Code already exists";
    if (!form.label.trim()) e.label = "Description is required";
    const val = parseFloat(form.value);
    if (!form.value || isNaN(val) || val <= 0) e.value = "Must be > 0";
    if (form.type === "percent" && val > 100) e.value = "Max 100%";
    if (form.usageLimit === "limited") {
      const n = parseInt(form.maxUses);
      if (!form.maxUses || isNaN(n) || n < 1) e.maxUses = "Must be at least 1";
    }
    if (form.hasExpiry && !form.expiresAt) e.expiresAt = "Select a date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Save ───
  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      code: form.code.toUpperCase(),
      label: form.label,
      type: form.type,
      value: parseFloat(form.value),
      usageLimit: form.usageLimit,
      maxUses:
        form.usageLimit === "once"
          ? 1
          : form.usageLimit === "limited"
          ? parseInt(form.maxUses)
          : null,
      expiresAt: form.hasExpiry && form.expiresAt
        ? new Date(form.expiresAt + "T23:59:59").toISOString()
        : null,
      minOrderAmount: form.hasMinOrder && form.minOrderAmount
        ? parseFloat(form.minOrderAmount)
        : null,
      isActive: form.isActive,
    };
    if (modal.editId) {
      updateCoupon(modal.editId, payload);
    } else {
      addCoupon(payload);
    }
    setModal({ open: false, editId: null });
  };

  // ─── Copy code ───
  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ─── Quick toggle active ───
  const toggleActive = (c: Coupon) => {
    updateCoupon(c.id, { isActive: !c.isActive });
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-stone-900 tracking-wide">Coupons</h1>
          <p className="text-xs text-stone-400 mt-1">{coupons.length} promo codes</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-stone-900 text-white text-xs tracking-widests uppercase px-5 py-3 hover:bg-stone-700 transition-colors"
        >
          <Plus size={14} />
          New Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search coupons..."
          className="w-full pl-9 pr-3 py-2.5 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
        />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {[
          {
            label: "Total",
            value: coupons.length,
            color: "text-stone-900",
          },
          {
            label: "Active",
            value: coupons.filter(
              (c) =>
                c.isActive &&
                (!c.expiresAt || new Date(c.expiresAt) >= new Date()) &&
                !(c.usageLimit !== "unlimited" && c.maxUses !== null && c.usedCount >= c.maxUses)
            ).length,
            color: "text-emerald-600",
          },
          {
            label: "Expired / Exhausted",
            value: coupons.filter(
              (c) =>
                (c.expiresAt && new Date(c.expiresAt) < new Date()) ||
                (c.usageLimit !== "unlimited" && c.maxUses !== null && c.usedCount >= c.maxUses)
            ).length,
            color: "text-red-500",
          },
          {
            label: "Total Uses",
            value: coupons.reduce((sum, c) => sum + c.usedCount, 0),
            color: "text-stone-900",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="border border-stone-100 p-4">
            <p className="text-[10px] tracking-widests uppercase text-stone-400 mb-1">{label}</p>
            <p className={cn("text-2xl font-light", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-stone-200">
          <Tag size={24} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm text-stone-400">No coupons found</p>
        </div>
      ) : (
        <div className="border border-stone-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {["Code", "Description", "Discount", "Usage", "Expires", "Status", ""].map((h) => (
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
              {filtered.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-stone-50/50 transition-colors group">
                  {/* Code */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium tracking-widest text-stone-900 bg-stone-100 px-2 py-0.5">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopy(coupon.id, coupon.code)}
                        className="text-stone-300 hover:text-stone-600 transition-colors"
                        title="Copy code"
                      >
                        {copiedId === coupon.id ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-4 py-3.5">
                    <p className="text-xs text-stone-700">{coupon.label}</p>
                    {coupon.minOrderAmount !== null && (
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Min. order ${coupon.minOrderAmount}
                      </p>
                    )}
                  </td>

                  {/* Discount */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-sm font-medium text-stone-900">
                      {coupon.type === "percent" ? `${coupon.value}%` : `$${coupon.value}`}
                    </span>
                    <span className="text-[11px] text-stone-400 ml-1">
                      {coupon.type === "percent" ? "off" : "flat"}
                    </span>
                  </td>

                  {/* Usage */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-xs text-stone-600">{usageLine(coupon)}</p>
                    {coupon.usageLimit !== "unlimited" && coupon.maxUses !== null && (
                      <div className="mt-1 w-20 h-1 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-stone-400 rounded-full"
                          style={{
                            width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </td>

                  {/* Expires */}
                  <td className="px-4 py-3.5 text-xs text-stone-500 whitespace-nowrap">
                    {formatDate(coupon.expiresAt)}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">{statusBadge(coupon)}</td>

                  {/* Actions */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleActive(coupon)}
                        title={coupon.isActive ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      >
                        {coupon.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button
                        onClick={() => openEdit(coupon)}
                        className="p-1.5 rounded text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(coupon.id)}
                        className="p-1.5 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Coupon modal */}
      {modal.open && (
        <CouponModal
          form={form}
          onChange={setForm}
          onSave={handleSave}
          onClose={() => setModal({ open: false, editId: null })}
          errors={errors}
          isEdit={!!modal.editId}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-medium mb-2">Delete coupon?</h3>
            <p className="text-xs text-stone-500 mb-5">
              This will permanently remove the coupon code{" "}
              <span className="font-mono font-medium text-stone-900">
                {coupons.find((c) => c.id === deleteConfirm)?.code}
              </span>
              . This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-stone-200 text-xs tracking-widests uppercase text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteCoupon(deleteConfirm); setDeleteConfirm(null); }}
                className="px-4 py-2 bg-red-600 text-white text-xs tracking-widests uppercase hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
