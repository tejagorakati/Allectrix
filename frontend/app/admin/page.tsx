"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  async function fetchCards() {
    const res = await fetch("http://localhost:4000/api/admin/cards");
    const data = await res.json();
    setCards(data);
  }

  useEffect(() => {
    fetchCards();
  }, []);

  async function change(cardId: string, path: "block" | "unblock") {
    setStatus(`${path}...`);
    const res = await fetch(`http://localhost:4000/api/admin/cards/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId }),
    });
    await res.json();
    await fetchCards();
    setStatus(null);
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      {status && <p className="text-sm mb-2">{status}</p>}
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-50">
            <th className="p-2 text-left">Card ID</th>
            <th className="p-2 text-left">User</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => (
            <tr key={c.cardId} className="border-t">
              <td className="p-2 font-mono">{c.cardId}</td>
              <td className="p-2">{c.user?.fullName}</td>
              <td className="p-2">{c.status}</td>
              <td className="p-2 text-right">
                {c.status === "ACTIVE" ? (
                  <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => change(c.cardId, "block")}>Block</button>
                ) : (
                  <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => change(c.cardId, "unblock")}>Unblock</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}