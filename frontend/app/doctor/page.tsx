"use client";
import { useState } from "react";

export default function DoctorPage() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [patient, setPatient] = useState<any>(null);

  async function onLogin(formData: FormData) {
    setStatus("Logging in...");
    const res = await fetch("http://localhost:4000/api/doctors/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Login failed");
    setToken(data.token);
    setStatus("Logged in");
  }

  async function onLookup(formData: FormData) {
    setStatus("Looking up...");
    const res = await fetch("http://localhost:4000/api/doctors/patient/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
      body: JSON.stringify({ cardId: formData.get("cardId") }),
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || "Not found");
    setPatient(data.user);
    setStatus(null);
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Doctor Portal</h1>

      {!token && (
        <form action={onLogin} className="space-y-3">
          <input name="email" placeholder="Email" className="border p-2 w-full" required />
          <input name="password" placeholder="Password" type="password" className="border p-2 w-full" required />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
        </form>
      )}

      {token && (
        <form action={onLookup} className="space-y-3">
          <input name="cardId" placeholder="Health Card ID" className="border p-2 w-full" required />
          <button className="bg-green-600 text-white px-4 py-2 rounded">Lookup</button>
        </form>
      )}

      {patient && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Patient</h2>
          <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(patient, null, 2)}</pre>
        </div>
      )}

      {status && <p className="text-sm">{status}</p>}
    </main>
  );
}