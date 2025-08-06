import { useState } from "react";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Notification from "@/components/Notification";

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
  const [uploadProgress, setUploadProgress] = useState(0); // 0 - 100
  const [notification, setNotification] = useState<{
    message: string;
    type?: "success" | "error";
  } | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !cover || !formData.title || !formData.series) {
      return setNotification({
        message: "Lengkapi semua data penting.",
        type: "error",
      });
    }

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      data.append(key, val);
    });
    data.append("cover", cover);
    if (screenshots) {
      Array.from(screenshots).forEach((s) => data.append("screenshots", s));
    }
    data.append("video", video);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        setNotification({ message: "Upload berhasil!", type: "success" });
        setUploadProgress(0); // reset
        router.push(`/`); 
      } else {
        setNotification({ message: "Upload gagal.", type: "error" });
      }
    };

    xhr.onerror = () => {
      setNotification({
        message: "Terjadi kesalahan saat upload.",
        type: "error",
      });
    };

    xhr.open("POST", "/api/upload");
    xhr.send(data);
  };


  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto py-10 px-4">

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-2 gap-6 shadow rounded p-6"
        >
          {/* Metadata Field */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">📝 Informasi Video</h2>
            {[
              { name: "title", label: "Judul Video" },
              { name: "codeId", label: "Kode ID" },
              { name: "releaseDate", label: "Tanggal Rilis" },
              { name: "director", label: "Sutradara" },
              { name: "maker", label: "Pembuat / Studio" },
              { name: "label", label: "Label" },
              { name: "genre", label: "Genre" },
              { name: "cast", label: "Pemeran" },
              { name: "series", label: "Nama Series" },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  placeholder={field.label}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                />
              </div>
            ))}
          </div>

          {/* Upload File Field */}
          <div className="space-y-5">
            <h2 className="text-xl font-semibold mb-2">📁 Upload File</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Cover</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCover(e.target.files?.[0] || null)}
                className="w-full"
              />
              {cover && (
                <img
                  src={URL.createObjectURL(cover)}
                  alt="Preview Cover"
                  className="mt-2 max-h-40 rounded"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Screenshots
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setScreenshots(e.target.files)}
                className="w-full"
              />
              {screenshots && screenshots.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {Array.from(screenshots).map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt={`Screenshot ${idx + 1}`}
                      className="rounded max-h-24 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 ">Video</label>
              <input
                type="file"
                accept=".mp4,.mov,.avi,.mkv,.webm,.flv"
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
                className="w-full"
              />
              {video && (
                <>
                  {video.type.startsWith("video/") &&
                  video.type !== "video/x-matroska" ? (
                    <video
                      controls
                      src={URL.createObjectURL(video)}
                      className="mt-2 rounded w-full max-h-60"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-2">
                      Format video tidak dapat diputar di browser, tetapi tetap
                      bisa diupload.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Button */}
          <div className="col-span-2 text-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow"
            >
              🚀 Upload Sekarang
            </button>
          </div>
          {uploadProgress > 0 && (
            <div className="mt-4 w-full bg-gray-200 rounded h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </form>
      </div>
    </>
  );
}
