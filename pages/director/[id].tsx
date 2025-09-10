import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import Header from "@/components/Header";

type Video = {
  id: string;
  title: string;
  codeId?: string;
  cover?: string;
  director?: string[] | string;
};

type DirectorDetail = {
  id: number;
  name: string;
  photo?: string;
  bio?: string;
  birthYear?: number;
  gallery?: string[];
};

type Props = {
  director: DirectorDetail;
  videos: Video[];
};

export default function DirectorDetailPage({ director, videos }: Props) {
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* SECTION: Detail Director */}
        <div className="flex items-start gap-6 bg-white shadow rounded-lg p-6">
          {director.photo ? (
            <img
              src={`/${director.photo}`}
              alt={director.name}
              className="w-32 h-32 object-cover rounded-md shadow"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md">
              No Photo
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold mb-2">{director.name}</h1>
            {director.bio && (
              <p className="text-gray-700 mb-2">{director.bio}</p>
            )}
            {director.birthYear && (
              <p className="text-sm text-gray-500">
                Lahir: {director.birthYear}
              </p>
            )}
            <p className="text-sm text-gray-600 mt-2">
              🎥 Total Video: {videos.length}
            </p>
          </div>

          {/* Tombol Edit */}
          <div className="mt-4">
            <Link
              href={`/director/${director.id}/edit`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
            >
              ✏️ Edit Director
            </Link>
          </div>
        </div>

        {/* SECTION: Daftar Video */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Filmografi</h2>
          {videos.length === 0 ? (
            <p className="text-gray-600">Belum ada video dari director ini.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((v) => (
                <Link
                  key={v.id}
                  href={`/video/${v.id}`}
                  className="block border rounded shadow hover:shadow-lg transition p-2"
                >
                  {v.cover ? (
                    <img
                      src={`/${v.cover}`}
                      alt={v.title}
                      className="rounded mb-2 object-cover h-48 w-full"
                    />
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-500 text-sm border rounded mb-2">
                      No Cover
                    </div>
                  )}
                  <div className="text-sm font-semibold">{v.codeId || "-"}</div>
                  <div className="text-sm text-gray-700 truncate">
                    {v.title}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <Link href="/list/director" className="text-blue-600 hover:underline">
            ← Kembali ke daftar director
          </Link>
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const directorPath = path.join(process.cwd(), "data/directors.json");
  let directors: DirectorDetail[] = [];

  try {
    const raw = await fs.readFile(directorPath, "utf-8");
    directors = JSON.parse(raw);
  } catch (e) {
    console.error("Gagal baca directors.json:", e);
  }

  return {
    paths: directors.map((d) => ({ params: { id: d.id.toString() } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
  const directorPath = path.join(process.cwd(), "data/directors.json");

  let videos: Video[] = [];
  let directors: DirectorDetail[] = [];

  try {
    const raw = await fs.readFile(metadataPath, "utf-8");
    videos = JSON.parse(raw);
  } catch (e) {
    console.error("Gagal baca video-metadata.json:", e);
  }

  try {
    const raw = await fs.readFile(directorPath, "utf-8");
    directors = JSON.parse(raw);
  } catch (e) {
    console.warn("Tidak ada data directors.json, skip detail.");
  }

  const id = parseInt(params?.id as string, 10);
  const director = directors.find((d) => d.id === id);

  if (!director) {
    return { notFound: true };
  }

  // filter video yang punya director sesuai nama
  const filtered = videos.filter((v) =>
    Array.isArray(v.director)
      ? v.director.includes(director.name)
      : v.director === director.name
  );

  return {
    props: {
      director,
      videos: filtered,
    },
  };
};
