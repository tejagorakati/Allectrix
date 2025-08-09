"use client";
import { useState } from "react";

export default function EmergencyPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  async function onSubmit(formData: FormData) {
    setStatus("Checking...");
    const payload: any = {};
    const cardId = formData.get("cardId");
    const biometricToken = formData.get("biometricToken");
    if (cardId) payload.cardId = cardId;
    if (biometricToken) payload.biometricToken = biometricToken;

    const res = await fetch("http://localhost:4000/api/emergency/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) return setStatus(json.error || "Access denied");
    setData(json);
    setStatus(null);
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Emergency Access</h1>
      <form action={onSubmit} className="space-y-3">
        <input name="cardId" placeholder="Health Card ID (optional)" className="border p-2 w-full" />
        <input name="biometricToken" placeholder="Biometric Token (optional)" className="border p-2 w-full" />
        <button className="bg-red-600 text-white px-4 py-2 rounded">Access</button>
      </form>
      {data && <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>}
      {status && <p className="text-sm">{status}</p>}
    </main>
  );
}