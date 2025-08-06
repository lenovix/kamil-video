import fs from "fs";
import path from "path";
import { GetStaticPaths, GetStaticProps } from "next";
import Header from "@/components/Header";
import CustomVideoPlayer from "@/components/CustomVideoPlayer";

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

interface Comment {
  user: string;
  text: string;
  time: string;
}

interface VideoDetailProps {
  video: VideoMetadata;
  comments: Comment[];
}

export default function VideoDetail({ video, comments }: VideoDetailProps) {
  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
        {/* Judul dan Series */}
        <div>
          <h1 className="text-3xl font-bold">{video.title}</h1>
        </div>

        {/* Cover + Metadata */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Cover */}
          <div className="rounded overflow-hidden shadow">
            {video.cover ? (
              <img
                src={`/${video.cover}`}
                alt="Cover"
                className="object-cover h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                Tidak ada cover
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className=" rounded shadow p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-semibold">Code ID:</span>{" "}
              {video.codeId || "-"}
            </div>
            <div>
              <span className="font-semibold">Release Date:</span>{" "}
              {video.releaseDate || "-"}
            </div>
            <div>
              <span className="font-semibold">Genre:</span> {video.genre || "-"}
            </div>
            <div>
              <span className="font-semibold">Cast:</span> {video.cast || "-"}
            </div>
            <div>
              <span className="font-semibold">Director:</span>{" "}
              {video.director || "-"}
            </div>
            <div>
              <span className="font-semibold">Maker:</span> {video.maker || "-"}
            </div>
            <div>
              <span className="font-semibold">Label:</span> {video.label || "-"}
            </div>
            <div>
              <span className="font-semibold">Series:</span>{" "}
              {video.series || "-"}
            </div>
            <div className="col-span-2 text-gray-500 text-xs mt-2">
              Uploaded: {new Date(video.uploadedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Screenshot / Gallery */}
        {video.screenshots && video.screenshots.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">📸 Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {video.screenshots.map((s, i) => (
                <img
                  key={i}
                  src={`/${s}`}
                  alt={`Screenshot ${i + 1}`}
                  className="rounded shadow-sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* Video */}
        <div>
          <h2 className="text-xl font-semibold mb-3">🎬 Pemutar Video</h2>
          <CustomVideoPlayer
            src={`/${video.video}`}
            poster={`/${video.cover}`}
          />
        </div>

        {/* Komentar */}
        <div>
          <h2 className="text-xl font-semibold mb-3">💬 Komentar</h2>
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada komentar.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c, i) => (
                <li
                  key={i}
                  className="bg-white border rounded px-4 py-3 shadow-sm"
                >
                  <div className="font-semibold text-sm text-blue-700">
                    {c.user}
                  </div>
                  <div className="text-sm text-gray-800">{c.text}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(c.time).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );

}

export const getStaticPaths: GetStaticPaths = async () => {
  const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
  const paths: { params: { id: string } }[] = [];

  if (fs.existsSync(metadataPath)) {
    const raw = fs.readFileSync(metadataPath, "utf8");
    const videos: VideoMetadata[] = JSON.parse(raw);
    videos.forEach((v) => {
      paths.push({ params: { id: v.id } });
    });
  }

  return {
    paths,
    fallback: "blocking", // jika belum dibuild, generate saat request
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const id = params?.id as string;

  const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
  const commentsPath = path.join(process.cwd(), "data/comments", `${id}.json`);

  let video: VideoMetadata | null = null;
  let comments: Comment[] = [];

  if (fs.existsSync(metadataPath)) {
    const raw = fs.readFileSync(metadataPath, "utf8");
    const videos: VideoMetadata[] = JSON.parse(raw);
    video = videos.find((v) => v.id === id) || null;
  }

  if (!video) {
    return { notFound: true };
  }

  if (fs.existsSync(commentsPath)) {
    const raw = fs.readFileSync(commentsPath, "utf8");
    comments = raw.trim() ? JSON.parse(raw) : [];
  }

  return {
    props: { video, comments },
    revalidate: 30,
  };
};
