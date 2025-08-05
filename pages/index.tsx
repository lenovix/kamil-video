import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import Header from "@/components/Header";
import Link from "next/link";

interface VideoMetadata {
  id: string;
  title: string;
  series: string;
  codeId?: string;
  releaseDate?: string;
  director?: string;
  maker?: string;
  label?: string;
  genre?: string;
  cast?: string;
  cover?: string;
  screenshots?: string[];
  video: string;
  uploadedAt: string;
}

interface HomeProps {
  videos: VideoMetadata[];
}

export default function Home({ videos }: HomeProps) {
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">🎥 Koleksi Video</h1>

        {videos.length === 0 && <p>Tidak ada video yang tersedia.</p>}

        <div className="grid md:grid-cols-2 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="border rounded shadow p-4">
              <h2 className="text-xl font-semibold mb-2">
                <Link
                  href={`/video/${video.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {video.title}
                </Link>
              </h2>
              <p className="text-sm text-gray-600 mb-1">
                Series: {video.series}
              </p>
              <p className="text-sm text-gray-600 mb-1">Genre: {video.genre}</p>
              <p className="text-sm text-gray-600 mb-1">
                Tanggal Rilis: {video.releaseDate}
              </p>
              {video.cover && (
                <img
                  src={`/${video.cover}`}
                  alt="Cover"
                  className="w-full h-auto rounded mt-2 mb-3"
                />
              )}
              <video
                src={`/${video.video}`}
                controls
                className="w-full max-h-[300px] rounded"
              />
              {video.screenshots?.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {video.screenshots.map((s, i) => (
                    <img
                      key={i}
                      src={`/${s}`}
                      alt={`Screenshot ${i + 1}`}
                      className="rounded"
                    />
                  ))}
                </div>
              )}
              <div className="mt-3 text-xs text-gray-500">
                Diunggah: {new Date(video.uploadedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
  let videos: VideoMetadata[] = [];

  if (fs.existsSync(metadataPath)) {
    try {
      const raw = fs.readFileSync(metadataPath, "utf8");
      videos = raw.trim() ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to parse metadata:", err);
    }
  }

  return {
    props: {
      videos,
    },
    revalidate: 10,
  };
};
