import { useState } from "react";
import Header from "@/components/Header";

export default function Upload() {
  const [series, setSeries] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !series || !chapterTitle) return alert("Lengkapi semua data.");

    const formData = new FormData();
    formData.append("series", series);
    formData.append("chapterTitle", chapterTitle);
    formData.append("video", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) alert("Upload berhasil!");
    else alert("Upload gagal!");
  };

  return (
    <>
      <Header />
      <div className="max-w-lg mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Upload Chapter</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Series Name (contoh: One Piece)"
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className="w-full border px-4 py-2"
          />
          <input
            type="text"
            placeholder="Chapter Title (contoh: Episode 1)"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            className="w-full border px-4 py-2"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Upload
          </button>
        </form>
      </div>
    </>
  );
}
