import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Lunelle collects, uses, and protects your personal information.",
};

const LAST_UPDATED = "June 1, 2026";
const CONTACT_EMAIL = "privacy@lunellestory.ca";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-3">Legal</p>
        <h1
          className="text-4xl md:text-5xl font-light mb-4"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-stone-400">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-stone max-w-none space-y-10 text-sm leading-relaxed text-stone-700">

        <section>
          <p>
            Lunelle Story (&quot;Lunelle&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you visit our website and make purchases from us. Please read this policy carefully.
          </p>
        </section>

        <Section title="1. Information We Collect">
          <Subsection title="Information You Provide">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account information:</strong> name, email address, password when you register.</li>
              <li><strong>Order information:</strong> billing address, shipping address, phone number, payment details (processed by Stripe/PayPal — we never store full card numbers).</li>
              <li><strong>Profile information:</strong> preferences, sizes, saved addresses, wishlist items.</li>
              <li><strong>Tailored order details:</strong> body measurements you voluntarily submit for customized-fit orders.</li>
              <li><strong>Communications:</strong> messages you send us via contact forms or email.</li>
            </ul>
          </Subsection>
          <Subsection title="Information Collected Automatically">
            <ul className="list-disc pl-5 space-y-1">
              <li>Device and browser information (browser type, operating system, IP address).</li>
              <li>Usage data (pages visited, time spent, referring URLs).</li>
              <li>Cookies and similar tracking technologies (see Section 5).</li>
            </ul>
          </Subsection>
          <Subsection title="Information from Third Parties">
            <ul className="list-disc pl-5 space-y-1">
              <li>If you sign in with Google, we receive your name, email address, and profile photo from Google.</li>
              <li>Payment processors (Stripe, PayPal) share transaction confirmation data with us.</li>
            </ul>
          </Subsection>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and fulfill your orders, including sending order confirmations and shipping updates.</li>
            <li>Manage your account and provide customer support.</li>
            <li>Personalize your shopping experience and remember your preferences.</li>
            <li>Send transactional emails (order receipts, shipping notifications, OTP verification codes).</li>
            <li>Send promotional emails about new collections, exclusive offers, and member benefits — only with your consent, which you may withdraw at any time.</li>
            <li>Prevent fraud and ensure the security of our platform.</li>
            <li>Comply with legal obligations.</li>
            <li>Improve our website, products, and services through aggregated analytics.</li>
          </ul>
        </Section>

        <Section title="3. Sharing Your Information">
          <p>We do not sell your personal information. We share it only in these limited circumstances:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li><strong>Service providers:</strong> Shopify (e-commerce platform), Stripe &amp; PayPal (payments), shipping carriers, email providers — all under confidentiality agreements.</li>
            <li><strong>Legal compliance:</strong> when required by law, court order, or to protect our rights.</li>
            <li><strong>Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, with prior notice to you.</li>
          </ul>
        </Section>

        <Section title="4. Data Retention">
          <p>
            We retain your personal information for as long as your account is active or as needed to provide services,
            comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion of your
            account and associated data at any time by contacting us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-stone-900">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Keep you signed in and remember your cart and preferences.</li>
            <li>Understand how visitors interact with our site (analytics).</li>
            <li>Enable Google OAuth authentication.</li>
          </ul>
          <p className="mt-3">
            You can control cookies through your browser settings. Disabling certain cookies may affect website functionality.
          </p>
        </Section>

        <Section title="6. Data Security">
          <p>
            We implement industry-standard security measures including HTTPS encryption, secure payment processing,
            and access controls. However, no method of transmission over the internet is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li><strong>Access</strong> the personal information we hold about you.</li>
            <li><strong>Correct</strong> inaccurate or incomplete information.</li>
            <li><strong>Delete</strong> your personal information (subject to certain exceptions).</li>
            <li><strong>Withdraw consent</strong> for marketing communications at any time.</li>
            <li><strong>Data portability:</strong> receive a copy of your data in a structured, machine-readable format.</li>
          </ul>
          <p className="mt-3">
            To exercise these rights, please contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-stone-900">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            Our services are not directed to children under 16. We do not knowingly collect personal information
            from children under 16. If you believe we have inadvertently collected such information, please contact us
            and we will delete it promptly.
          </p>
        </Section>

        <Section title="9. Third-Party Links">
          <p>
            Our website may contain links to third-party websites. We are not responsible for the privacy practices
            of those sites. We encourage you to review the privacy policies of any third-party sites you visit.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting
            the new policy on this page with an updated &quot;Last updated&quot; date. Your continued use of our services
            after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>If you have questions or concerns about this Privacy Policy or our data practices, please contact us:</p>
          <div className="mt-3 space-y-1">
            <p><strong>Lunelle Story</strong></p>
            <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-stone-900">{CONTACT_EMAIL}</a></p>
            <p>Website: <Link href="/" className="underline hover:text-stone-900">lunellestory.ca</Link></p>
          </div>
        </Section>
      </div>

      {/* Back + Terms link */}
      <div className="mt-16 pt-8 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
        <Link href="/" className="hover:text-stone-700 transition-colors underline underline-offset-2">
          ← Back to Home
        </Link>
        <Link href="/terms" className="hover:text-stone-700 transition-colors underline underline-offset-2">
          Terms of Service →
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2
        className="text-lg font-light text-stone-900"
        style={{ fontFamily: "var(--font-cormorant), serif" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-xs tracking-widest uppercase text-stone-500 font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
