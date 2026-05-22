"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function PayPalCheckout({
  amount,
  onSuccess,
  onBack,
}: {
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [error, setError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  if (!clientId) {
    return (
      <div className="space-y-4">
        <div className="border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-sm text-amber-700 font-medium mb-1">PayPal not configured</p>
          <p className="text-xs text-amber-600">
            Add <span className="font-mono">NEXT_PUBLIC_PAYPAL_CLIENT_ID</span> to{" "}
            <span className="font-mono">.env.local</span> to enable PayPal payments.
          </p>
        </div>
        <button
          onClick={onBack}
          className="w-full py-4 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="space-y-4">
        <div className="border border-stone-200 p-6">
          <div className="text-center mb-5">
            <div className="text-2xl font-bold mb-1" style={{ color: "#003087" }}>
              Pay<span style={{ color: "#009cde" }}>Pal</span>
            </div>
            <p className="text-xs text-stone-400 tracking-wide">
              Complete your purchase securely · {formatPrice(amount)}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <PayPalButtons
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "paypal",
              height: 48,
            }}
            createOrder={(_data, actions) => {
              return actions.order!.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: "USD",
                      value: amount.toFixed(2),
                    },
                    description: "TeBoutique Order",
                  },
                ],
              });
            }}
            onApprove={async (_data, actions) => {
              if (actions.order) {
                await actions.order.capture();
                onSuccess();
              }
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              setError("PayPal payment failed. Please try again or choose another method.");
            }}
            onCancel={() => {
              setError("Payment was cancelled.");
            }}
          />
        </div>

        <button
          onClick={onBack}
          className="w-full py-4 border border-stone-200 text-xs tracking-widest uppercase hover:bg-stone-50 transition-colors"
        >
          Back
        </button>
      </div>
    </PayPalScriptProvider>
  );
}
