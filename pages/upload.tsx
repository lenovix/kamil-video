import { useState } from "react";
import Header from "@/components/Header";

export default function Upload() {
  const [formData, setFormData] = useState({
    title: "",
    codeId: "",
    releaseDate: "",
    director: "",
    maker: "",
    label: "",
    genre: "",
    cast: "",
    series: "",
  });

  const [cover, setCover] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!video || !cover || !formData.title || !formData.series) {
      return alert("Lengkapi semua data penting.");
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });

    data.append("cover", cover);
    if (screenshots) {
      Array.from(screenshots).forEach((s, i) => data.append("screenshots", s));
    }
    data.append("video", video);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();
    alert(result.message || "Gagal upload");
  };

  return (
    <>
      <Header />
      <div className="max-w-xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            "title",
            "codeId",
            "releaseDate",
            "director",
            "maker",
            "label",
            "genre",
            "cast",
            "series",
          ].map((field) => (
            <input
              key={field}
              name={field}
              type="text"
              placeholder={field}
              value={(formData as any)[field]}
              onChange={handleChange}
              className="w-full border px-3 py-2"
            />
          ))}

          <label>Cover:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCover(e.target.files?.[0] || null)}
          />

          <label>Screenshots:</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setScreenshots(e.target.files)}
          />

          <label>Video File:</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
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
