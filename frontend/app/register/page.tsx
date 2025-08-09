"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setStatus("Submitting...");
    try {
      const res = await fetch("http://localhost:4000/api/patients/register", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus(`Registered. Card ID: ${data.cardId}`);
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Patient Registration</h1>
      <form
        action={onSubmit}
        className="space-y-3"
        encType="multipart/form-data"
      >
        <input name="fullName" placeholder="Full name" className="border p-2 w-full" required />
        <input name="email" placeholder="Email" className="border p-2 w-full" />
        <input name="phone" placeholder="Phone" className="border p-2 w-full" />
        <input name="dateOfBirth" placeholder="DOB YYYY-MM-DD" className="border p-2 w-full" required />
        <input name="password" placeholder="Password (optional)" type="password" className="border p-2 w-full" />
        <input name="bloodGroup" placeholder="Blood Group" className="border p-2 w-full" />
        <input name="allergies" placeholder='Allergies JSON e.g. ["penicillin"]' className="border p-2 w-full" />
        <input name="chronicDiseases" placeholder='Chronic diseases JSON e.g. ["asthma"]' className="border p-2 w-full" />
        <input name="files" type="file" multiple className="border p-2 w-full" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Register</button>
      </form>
      {status && <p className="mt-4 text-sm">{status}</p>}
    </main>
  );
}