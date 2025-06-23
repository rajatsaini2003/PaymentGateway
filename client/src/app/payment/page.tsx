// app/payment/page.tsx
"use client";

import { useState } from "react";

export default function PaymentPage() {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handlePayment = async () => {
    try {
      setLoading(true);
      setMessage("");

      // Send payment request to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_JWT_HERE`, // Replace with actual auth
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.msg || "Payment initiation failed");

      setMessage("🟢 Order created. Proceeding to payment...");
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Make a Payment</h2>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring focus:ring-blue-300"
        />

        <button
          disabled={loading}
          onClick={handlePayment}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Pay Now"}
        </button>

        {message && <p className="mt-4 text-sm text-center">{message}</p>}
      </div>
    </div>
  );
}
