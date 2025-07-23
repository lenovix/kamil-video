import fs from "fs";
import path from "path";
import { GetStaticProps } from "next";
import Header from "@/components/Header";

interface Chapter {
  chapterId: number;
  title: string;
  filename: string;
  uploadedAt: string;
}

interface Series {
  id: number;
  seriesTitle: string;
  chapters: Chapter[];
}

interface HomeProps {
  seriesList: Series[];
}

export default function Home({ seriesList }: HomeProps) {
  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">🎞️ Daftar Series & Chapter</h1>
        {seriesList.length === 0 && <p>Belum ada video diupload.</p>}
        {seriesList.map((series) => (
          <div
            key={series.id}
            className="mb-8 border border-gray-300 rounded p-4 shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{series.seriesTitle}</h2>
            <ul className="space-y-2">
              {series.chapters.map((chapter) => (
                <li
                  key={chapter.chapterId}
                  className="bg-gray-100 rounded px-3 py-2"
                >
                  <div className="font-medium">{chapter.title}</div>
                  <video
                    src={`/${chapter.filename}`}
                    controls
                    className="mt-2 w-full max-w-xl rounded"
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
  let seriesList: Series[] = [];

  if (fs.existsSync(metadataPath)) {
    try {
      const raw = fs.readFileSync(metadataPath, "utf8");
      seriesList = raw.trim() ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to parse metadata:", err);
    }
  }

  return {
    props: {
      seriesList,
    },
    revalidate: 10, // re-generate setiap 10 detik (jika pakai ISR)
  };
};
