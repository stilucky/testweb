"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

function PaymentForm({
  amount,
  onSuccess,
  onBack,
}: {
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border border-stone-200 p-5">
        <p className="text-xs tracking-widest uppercase text-stone-400 mb-4">
          Card Details
        </p>
        <PaymentElement
          options={{
            layout: "tabs",
            fields: { billingDetails: { name: "auto" } },
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="flex-1 py-4 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || processing}
          className="flex-1 py-4 bg-stone-900 text-white text-xs tracking-widest uppercase hover:bg-stone-700 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Processing...
            </>
          ) : (
            `Pay · ${formatPrice(amount, "CAD")}`
          )}
        </button>
      </div>

      <p className="text-xs text-stone-400 text-center flex items-center justify-center gap-1.5">
        <Lock size={10} />
        Secured by Stripe · 256-bit SSL encryption
      </p>
    </form>
  );
}

export default function StripePaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onBack,
}: {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#1c1917",
            colorBackground: "#ffffff",
            colorText: "#1c1917",
            colorDanger: "#ef4444",
            fontFamily: '"Inter", system-ui, sans-serif',
            spacingUnit: "4px",
            borderRadius: "0px",
          },
          rules: {
            ".Input": {
              border: "1px solid #e7e5e4",
              boxShadow: "none",
              padding: "12px 16px",
              fontSize: "14px",
            },
            ".Input:focus": {
              border: "1px solid #1c1917",
              boxShadow: "none",
            },
            ".Label": {
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#a8a29e",
              fontWeight: "400",
            },
          },
        },
      }}
    >
      <PaymentForm amount={amount} onSuccess={onSuccess} onBack={onBack} />
    </Elements>
  );
}
