import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Arogya Card</h1>
      <p className="text-gray-600 mb-8">Secure health card platform</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a className="border rounded p-6 hover:bg-gray-50" href="/register">Patient Registration</a>
        <a className="border rounded p-6 hover:bg-gray-50" href="/doctor">Doctor Portal</a>
        <a className="border rounded p-6 hover:bg-gray-50" href="/emergency">Emergency Access</a>
        <a className="border rounded p-6 hover:bg-gray-50" href="/admin">Admin Dashboard</a>
      </div>
    </main>
  );
}
