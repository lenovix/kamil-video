import fs from "fs/promises";
import path from "path";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Header from "@/components/Header";

type VideoMetadata = {
  id: string;
  title: string;
  codeId?: string;
  cover: string;
};

type Props = {
  query: string;
  results: VideoMetadata[];
};

export default function SearchPage({ query, results }: Props) {
  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">
          Hasil Pencarian: <span className="text-blue-600">{query}</span>
        </h1>

        {results.length === 0 ? (
          <p className="text-gray-500">Tidak ada hasil ditemukan.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((video) => (
              <li
                key={video.id}
                className="border rounded overflow-hidden shadow"
              >
                <Link href={`/video/${video.id}`}>
                  <img
                    src={`/${video.cover}`}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-2">
                    <h2 className="font-semibold text-sm truncate">
                      {video.title}
                    </h2>
                    {video.codeId && (
                      <p className="text-xs text-gray-500 truncate">
                        {video.codeId}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = ((context.query.q as string) || "").trim().toLowerCase();

  const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
  const raw = await fs.readFile(metadataPath, "utf-8");
  const metadata: VideoMetadata[] = JSON.parse(raw);

  const results = metadata.filter((entry) => {
    const title = entry.title?.toLowerCase() || "";
    const code = entry.codeId?.toLowerCase() || "";
    return title.includes(query) || code.includes(query);
  });

  return {
    props: {
      query: context.query.q || "",
      results,
    },
  };
};
