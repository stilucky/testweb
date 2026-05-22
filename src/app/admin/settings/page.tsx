"use client";

import { useState } from "react";
import { Save, Eye, EyeOff, CheckCircle2, Store, Mail, Palette, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "store" | "email" | "appearance" | "security";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "store", label: "Store Info", icon: Store },
  { id: "email", label: "Email / SMTP", icon: Mail },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("store");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [store, setStore] = useState({
    name: "TeBoutique",
    tagline: "Premium Fashion · Vancouver",
    email: "hello@teboutique.com",
    phone: "+1 604 555 0100",
    address: "789 Robson Street, Vancouver, BC V6Z 1C3",
    currency: "CAD",
    timezone: "America/Vancouver",
  });

  const [smtp, setSmtp] = useState({
    host: "smtp.gmail.com",
    port: "587",
    user: "",
    pass: "",
    fromName: "TeBoutique",
  });

  const [appearance, setAppearance] = useState({
    primaryColor: "#1c1917",
    accentColor: "#a8a29e",
    logoText: "TeBoutique",
    bannerText: "Free shipping on orders over $200",
    showBanner: true,
    maintenanceMode: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-1">Configuration</p>
          <h1
            className="text-4xl text-stone-900"
            style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
          >
            Settings
          </h1>
          <p className="text-stone-400 text-sm mt-1">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase transition-all",
            saved
              ? "bg-emerald-600 text-white border border-emerald-600"
              : "bg-stone-900 text-white hover:bg-stone-700 border border-stone-900"
          )}
        >
          {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-xs tracking-widest uppercase transition-colors text-left rounded-sm",
                  activeTab === id
                    ? "bg-stone-900 text-white"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                )}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-stone-100">
          {/* Store Info */}
          {activeTab === "store" && (
            <div className="p-8 space-y-6">
              <h2 className="text-xs tracking-widest uppercase font-medium border-b border-stone-100 pb-4">
                Store Information
              </h2>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: "Store Name", key: "name" as const },
                  { label: "Tagline", key: "tagline" as const },
                  { label: "Contact Email", key: "email" as const },
                  { label: "Phone", key: "phone" as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">{label}</label>
                    <input
                      type="text"
                      value={store[key]}
                      onChange={(e) => setStore((s) => ({ ...s, [key]: e.target.value }))}
                      className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">Address</label>
                  <input
                    type="text"
                    value={store.address}
                    onChange={(e) => setStore((s) => ({ ...s, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">Currency</label>
                  <select
                    value={store.currency}
                    onChange={(e) => setStore((s) => ({ ...s, currency: e.target.value }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-white"
                  >
                    <option value="CAD">CAD — Canadian Dollar</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="VND">VND — Vietnamese Dong</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">Timezone</label>
                  <select
                    value={store.timezone}
                    onChange={(e) => setStore((s) => ({ ...s, timezone: e.target.value }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors bg-white"
                  >
                    <option value="America/Vancouver">America/Vancouver</option>
                    <option value="America/Toronto">America/Toronto</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Email / SMTP */}
          {activeTab === "email" && (
            <div className="p-8 space-y-6">
              <h2 className="text-xs tracking-widest uppercase font-medium border-b border-stone-100 pb-4">
                Email Configuration (SMTP)
              </h2>
              <div className="p-4 bg-amber-50 border border-amber-200 text-xs text-amber-700 leading-relaxed">
                These values should be set in your <span className="font-mono">.env.local</span> file for security.
                Values shown here are for reference only and won't override environment variables.
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={smtp.host}
                    onChange={(e) => setSmtp((s) => ({ ...s, host: e.target.value }))}
                    placeholder="smtp.gmail.com"
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">SMTP Port</label>
                  <input
                    type="text"
                    value={smtp.port}
                    onChange={(e) => setSmtp((s) => ({ ...s, port: e.target.value }))}
                    placeholder="587"
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">Username / Email</label>
                  <input
                    type="email"
                    value={smtp.user}
                    onChange={(e) => setSmtp((s) => ({ ...s, user: e.target.value }))}
                    placeholder="your@gmail.com"
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">App Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={smtp.pass}
                      onChange={(e) => setSmtp((s) => ({ ...s, pass: e.target.value }))}
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="w-full px-4 py-3 pr-11 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">From Name</label>
                  <input
                    type="text"
                    value={smtp.fromName}
                    onChange={(e) => setSmtp((s) => ({ ...s, fromName: e.target.value }))}
                    placeholder="TeBoutique"
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                  />
                </div>
              </div>
              <div className="p-4 bg-stone-50 border border-stone-100 text-xs text-stone-500 space-y-1">
                <p className="font-medium text-stone-700 mb-2">Gmail setup guide:</p>
                <p>1. Enable 2-Step Verification on your Google Account</p>
                <p>2. Go to Security → App Passwords</p>
                <p>3. Generate a new App Password (select "Mail")</p>
                <p>4. Add to <span className="font-mono">.env.local</span>: SMTP_USER and SMTP_PASS</p>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <div className="p-8 space-y-6">
              <h2 className="text-xs tracking-widest uppercase font-medium border-b border-stone-100 pb-4">
                Appearance & Branding
              </h2>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">Logo Text</label>
                  <input
                    type="text"
                    value={appearance.logoText}
                    onChange={(e) => setAppearance((a) => ({ ...a, logoText: e.target.value }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={appearance.primaryColor}
                      onChange={(e) => setAppearance((a) => ({ ...a, primaryColor: e.target.value }))}
                      className="w-12 h-11 border border-stone-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={appearance.primaryColor}
                      onChange={(e) => setAppearance((a) => ({ ...a, primaryColor: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-stone-200 text-sm font-mono focus:outline-none focus:border-stone-800 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={appearance.accentColor}
                      onChange={(e) => setAppearance((a) => ({ ...a, accentColor: e.target.value }))}
                      className="w-12 h-11 border border-stone-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={appearance.accentColor}
                      onChange={(e) => setAppearance((a) => ({ ...a, accentColor: e.target.value }))}
                      className="flex-1 px-4 py-3 border border-stone-200 text-sm font-mono focus:outline-none focus:border-stone-800 transition-colors"
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">Announcement Banner Text</label>
                  <input
                    type="text"
                    value={appearance.bannerText}
                    onChange={(e) => setAppearance((a) => ({ ...a, bannerText: e.target.value }))}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-stone-100 pt-5">
                {[
                  { key: "showBanner" as const, label: "Show Announcement Banner", desc: "Display the top banner on all store pages" },
                  { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Temporarily close the store to customers" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-stone-50">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setAppearance((a) => ({ ...a, [key]: !a[key] }))}
                      className={cn(
                        "w-11 h-6 rounded-full transition-colors relative shrink-0",
                        appearance[key] ? "bg-stone-900" : "bg-stone-200"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                          appearance[key] ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <div className="p-8 space-y-6">
              <h2 className="text-xs tracking-widest uppercase font-medium border-b border-stone-100 pb-4">
                Security Settings
              </h2>
              <div className="space-y-4">
                <h3 className="text-xs tracking-widest uppercase text-stone-500">Change Admin Password</h3>
                {[
                  { label: "Current Password", key: "currentPassword" as const },
                  { label: "New Password", key: "newPassword" as const },
                  { label: "Confirm New Password", key: "confirmPassword" as const },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-[10px] tracking-widest uppercase text-stone-400 mb-2">{label}</label>
                    <input
                      type="password"
                      value={security[key]}
                      onChange={(e) => setSecurity((s) => ({ ...s, [key]: e.target.value }))}
                      className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-800 transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                ))}
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors"
                >
                  Update Password
                </button>
              </div>

              <div className="border-t border-stone-100 pt-6 space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-stone-50">
                  <div>
                    <p className="text-sm font-medium">Two-Factor Authentication</p>
                    <p className="text-xs text-stone-400 mt-0.5">Add an extra layer of security to your admin account</p>
                  </div>
                  <button
                    onClick={() => setSecurity((s) => ({ ...s, twoFactor: !s.twoFactor }))}
                    className={cn(
                      "w-11 h-6 rounded-full transition-colors relative shrink-0",
                      security.twoFactor ? "bg-stone-900" : "bg-stone-200"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                        security.twoFactor ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-stone-50 border border-stone-100">
                <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-3">Active Session</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Current device</p>
                    <p className="text-xs text-stone-400 mt-0.5">Vancouver, BC · Chrome on Windows</p>
                  </div>
                  <span className="text-[11px] px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full">Active now</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
