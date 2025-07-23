import { useState } from "react";
import Header from "@/components/Header";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleClearMetadata = async () => {
    setLoading(true);
    await fetch("/api/clear-metadata", { method: "POST" });
    alert("Metadata berhasil dihapus.");
    setLoading(false);
  };

  const handleClearVideos = async () => {
    setLoading(true);
    await fetch("/api/clear-videos", { method: "POST" });
    alert("Semua video berhasil dihapus.");
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto py-10 px-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>
        <button
          onClick={handleClearMetadata}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Hapus Semua Metadata
        </button>
        <button
          onClick={handleClearVideos}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Hapus Semua Video
        </button>
      </div>
    </>
  );
}
