export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, name.length - visible.length))}@${domain}`;
}

export function maskPhone(phone?: string) {
  if (!phone || phone === "—") return phone ?? "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "••••";
  return `••• ••• ${digits.slice(-4)}`;
}

export function maskAddress(address: string) {
  if (!address.trim()) return address;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) return "Address hidden";
  return `Address hidden, ${parts.slice(-2).join(", ")}`;
}
