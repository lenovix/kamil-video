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
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🎥 Koleksi Video
        </h1>

        {videos.length === 0 ? (
          <p className="text-center text-gray-500">
            Tidak ada video yang tersedia.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link href={`/video/${video.id}`} key={video.id}>
                <div className="border rounded-lg shadow hover:shadow-lg transition-all cursor-pointer bg-white overflow-hidden">
                  <div className="text-sm text-black font-semibold uppercase tracking-wide">
                    {video.codeId}
                  </div>
                  {video.cover ? (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={`/${video.cover}`}
                        alt="Cover"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      Tidak ada cover
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <h2 className="text-lg text-black font-bold line-clamp-2">
                      {video.title}
                    </h2>

                    <p className="text-xs text-gray-400">
                      Diunggah: {new Date(video.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
