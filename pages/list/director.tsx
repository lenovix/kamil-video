import { GetStaticProps } from "next";
import Link from "next/link";
import path from "path";
import fs from "fs/promises";
import Header from "@/components/Header";

type Director = {
  id: string | number;
  name: string;
};

type Props = {
  directors: Director[];
};

export default function DirectorListPage({ directors }: Props) {
  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🎬 List of Directors</h1>
        {directors.length === 0 ? (
          <p className="text-gray-600">Belum ada director.</p>
        ) : (
          <ul className="space-y-2">
            {directors.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/director/${d.id}`}
                  className="block border rounded px-4 py-2 hover:bg-gray-100"
                >
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const directorPath = path.join(process.cwd(), "data/directors.json");

  let directors: Director[] = [];

  try {
    const raw = await fs.readFile(directorPath, "utf-8");
    directors = JSON.parse(raw);
  } catch (e) {
    console.error("Gagal baca directors.json:", e);
  }

  return {
    props: {
      directors: directors.sort((a, b) => a.name.localeCompare(b.name)),
    },
  };
};
