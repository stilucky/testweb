import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Lunelle Story's website and services.",
};

const LAST_UPDATED = "June 1, 2026";
const CONTACT_EMAIL = "hello@lunellestory.ca";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 md:py-24">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[10px] tracking-[0.25em] uppercase text-stone-400 mb-3">Legal</p>
        <h1
          className="text-4xl md:text-5xl font-light mb-4"
          style={{ fontFamily: "var(--font-cormorant), serif" }}
        >
          Terms of Service
        </h1>
        <p className="text-sm text-stone-400">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-10 text-sm leading-relaxed text-stone-700">

        <section>
          <p>
            Welcome to Lunelle Story. By accessing or using our website at{" "}
            <Link href="/" className="underline hover:text-stone-900">lunellestory.ca</Link>{" "}
            and purchasing our products, you agree to be bound by these Terms of Service.
            Please read them carefully before using our services.
          </p>
        </section>

        <Section title="1. Acceptance of Terms">
          <p>
            By creating an account, placing an order, or browsing our website, you confirm that you are at least
            16 years of age and agree to these Terms of Service and our{" "}
            <Link href="/privacy" className="underline hover:text-stone-900">Privacy Policy</Link>.
            If you do not agree, please do not use our services.
          </p>
        </Section>

        <Section title="2. Accounts">
          <ul className="list-disc pl-5 space-y-1">
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree to provide accurate, current, and complete information when registering.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
            <li>Notify us immediately of any unauthorized use of your account at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-stone-900">{CONTACT_EMAIL}</a>.
            </li>
            <li>We reserve the right to terminate accounts that violate these terms.</li>
          </ul>
        </Section>

        <Section title="3. Products and Pricing">
          <ul className="list-disc pl-5 space-y-1">
            <li>All prices are displayed in Canadian Dollars (CAD) or US Dollars (USD) as indicated.</li>
            <li>Prices are subject to change without notice, but changes will not affect confirmed orders.</li>
            <li>We reserve the right to limit quantities, refuse orders, or cancel orders at our discretion.</li>
            <li>Product images are for illustrative purposes; colours may vary slightly due to screen calibration.</li>
            <li>Sale prices apply only during the specified promotion period.</li>
          </ul>
        </Section>

        <Section title="4. Tailored & Made-to-Order Services">
          <p>
            Lunelle offers two types of tailored services — <strong>Made to Order</strong> (standard sizing, custom made)
            and <strong>Customized Fit</strong> (bespoke sizing based on your measurements). The following terms apply:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1">
            <li>Tailored orders are <strong>non-refundable</strong> once production has begun.</li>
            <li>You are responsible for providing accurate measurements. Lunelle is not liable for fit issues resulting from incorrect measurements.</li>
            <li>Production timelines are estimates; we will notify you of significant delays.</li>
            <li>Design selections (colour, fabric) made at the time of order are final.</li>
            <li>A deposit may be required before production begins.</li>
          </ul>
        </Section>

        <Section title="5. Orders & Payment">
          <ul className="list-disc pl-5 space-y-1">
            <li>Orders are confirmed upon successful payment processing.</li>
            <li>We accept payment via credit card (Stripe), PayPal, and Shopify Payments.</li>
            <li>Payment is processed securely; we do not store your full card details.</li>
            <li>For Shopify-redirected checkouts, payment terms are governed by Shopify&apos;s checkout policy.</li>
            <li>If a payment fails, your order will not be processed.</li>
          </ul>
        </Section>

        <Section title="6. Shipping & Delivery">
          <ul className="list-disc pl-5 space-y-1">
            <li>We ship to Canada, the United States, and select international destinations.</li>
            <li>Free standard shipping on orders over $200 CAD (domestic).</li>
            <li>Delivery times are estimates and may vary due to carrier delays or customs processing.</li>
            <li>Risk of loss passes to you upon delivery to the carrier.</li>
            <li>We are not responsible for delays caused by events beyond our control.</li>
          </ul>
        </Section>

        <Section title="7. Returns & Exchanges">
          <ul className="list-disc pl-5 space-y-1">
            <li>Ready-to-wear items may be returned within 14 days of delivery in original, unworn condition with tags attached.</li>
            <li>Sale items are final sale and not eligible for return or exchange.</li>
            <li>Tailored and made-to-order items are <strong>non-returnable</strong>.</li>
            <li>To initiate a return, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-stone-900">{CONTACT_EMAIL}</a>{" "}
              with your order number.
            </li>
            <li>Shipping costs for returns are the responsibility of the customer unless the item is defective.</li>
          </ul>
        </Section>

        <Section title="8. Discount Codes & Promotions">
          <ul className="list-disc pl-5 space-y-1">
            <li>Discount codes are single-use unless otherwise specified.</li>
            <li>Codes cannot be combined with other promotions.</li>
            <li>Welcome discount codes (10% off) are issued one per account and expire upon use.</li>
            <li>We reserve the right to cancel or modify promotions at any time.</li>
          </ul>
        </Section>

        <Section title="9. Intellectual Property">
          <p>
            All content on this website — including images, text, designs, logos, and code — is owned by or
            licensed to Lunelle Story and is protected by copyright and trademark laws. You may not reproduce,
            distribute, or create derivative works without our express written permission.
          </p>
        </Section>

        <Section title="10. Members-Only Content">
          <p>
            Certain collections and content are exclusive to registered members. By creating an account, you agree
            not to share access to members-only content with non-members. We reserve the right to revoke membership
            access for misuse.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Lunelle Story shall not be liable for any indirect, incidental,
            special, or consequential damages arising from your use of our services, including but not limited to
            loss of profits, data, or business opportunities. Our total liability shall not exceed the amount you
            paid for the specific order giving rise to the claim.
          </p>
        </Section>

        <Section title="12. Governing Law">
          <p>
            These Terms of Service are governed by the laws of the Province of Ontario and the federal laws of
            Canada applicable therein, without regard to conflict of law principles. Any disputes shall be resolved
            exclusively in the courts of Ontario, Canada.
          </p>
        </Section>

        <Section title="13. Changes to Terms">
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately
            upon posting. Your continued use of our services after changes constitutes your acceptance of the new terms.
            We will notify registered users of material changes via email.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>For questions about these Terms of Service, please contact us:</p>
          <div className="mt-3 space-y-1">
            <p><strong>Lunelle Story</strong></p>
            <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-stone-900">{CONTACT_EMAIL}</a></p>
            <p>Website: <Link href="/" className="underline hover:text-stone-900">lunellestory.ca</Link></p>
          </div>
        </Section>
      </div>

      {/* Back + Privacy link */}
      <div className="mt-16 pt-8 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
        <Link href="/" className="hover:text-stone-700 transition-colors underline underline-offset-2">
          ← Back to Home
        </Link>
        <Link href="/privacy" className="hover:text-stone-700 transition-colors underline underline-offset-2">
          Privacy Policy →
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
