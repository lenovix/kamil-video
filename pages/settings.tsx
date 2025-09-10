import { useState } from "react";
import Header from "@/components/Header";
import Notification from "@/components/Notification";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);

  const handleClearMetadata = async () => {
    setLoading(true);
    await fetch("/api/clear-metadata", { method: "POST" });
    setNotification({ message: "Metadata berhasil dihapus", type: "success" });
    setLoading(false);
  };

  const handleClearVideos = async () => {
    setLoading(true);
    await fetch("/api/clear-videos", { method: "POST" });
    setNotification({
      message: "Semua video berhasil dihapus",
      type: "success",
    });
    setLoading(false);
  };

  const handleClearDirectors = async () => {
    setLoading(true);
    await fetch("/api/clear-directors", { method: "POST" });
    setNotification({
      message: "Semua Directors berhasil dihapus",
      type: "success",
    });
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto py-10 px-4 space-y-4">
        <h1 className="text-2xl font-bold mb-4">⚙️ Settings</h1>
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
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
        <button
          onClick={handleClearDirectors}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Hapus Data Directors
        </button>
      </div>
    </>
  );
}
