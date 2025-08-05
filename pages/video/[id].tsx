import fs from "fs";
import path from "path";
import { GetStaticPaths, GetStaticProps } from "next";
import Header from "@/components/Header";

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
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-2">{video.title}</h1>
        <p className="text-sm text-gray-500 mb-4">Series: {video.series}</p>

        {video.cover && (
          <img
            src={`/${video.cover}`}
            alt="Cover"
            className="mb-4 rounded w-full"
          />
        )}

        <video
          src={`/${video.video}`}
          controls
          className="w-full max-h-[400px] mb-4 rounded"
        />

        <p>
          <strong>Genre:</strong> {video.genre}
        </p>
        <p>
          <strong>Cast:</strong> {video.cast}
        </p>
        <p>
          <strong>Release Date:</strong> {video.releaseDate}
        </p>
        <p>
          <strong>Director:</strong> {video.director}
        </p>
        <p>
          <strong>Maker:</strong> {video.maker}
        </p>
        <p>
          <strong>Label:</strong> {video.label}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Uploaded: {new Date(video.uploadedAt).toLocaleString()}
        </p>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Screenshots</h2>
          <div className="grid grid-cols-3 gap-3">
            {video.screenshots?.map((s, i) => (
              <img
                key={i}
                src={`/${s}`}
                alt={`Screenshot ${i + 1}`}
                className="rounded"
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Komentar</h2>
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada komentar.</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c, i) => (
                <li key={i} className="bg-gray-100 p-2 rounded">
                  <div className="font-medium">{c.user}</div>
                  <div>{c.text}</div>
                  <div className="text-xs text-gray-500">
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
