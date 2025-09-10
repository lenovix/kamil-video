import { GetStaticPaths, GetStaticProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import path from "path";
import fs from "fs/promises";
import Header from "@/components/Header";

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
};

export default function EditDirectorPage({ director }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: director.name,
    photo: director.photo || "",
    bio: director.bio || "",
    birthYear: director.birthYear?.toString() || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<null | string>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("bio", form.bio);
      formData.append("birthYear", form.birthYear);
      if (file) {
        formData.append("photo", file);
      }

      const res = await fetch(`/api/director/edit?id=${director.id}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal update");

      setStatus("success");
      router.push(`/director/${director.id}`);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">✏️ Edit Director</h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded shadow"
          encType="multipart/form-data"
        >
          <div>
            <label className="block font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Photo</label>
            {director.photo && (
              <img
                src={director.photo}
                alt="Preview"
                className="w-32 h-32 object-cover mb-2 rounded"
              />
            )}
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleFileChange}
              className="border rounded w-full px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2 h-24"
            />
          </div>

          <div>
            <label className="block font-medium">Birth Year</label>
            <input
              type="number"
              name="birthYear"
              value={form.birthYear}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            {status === "loading" ? "Saving..." : "Save"}
          </button>

          {status === "success" && (
            <p className="text-green-600 mt-2">Berhasil disimpan!</p>
          )}
          {status === "error" && (
            <p className="text-red-600 mt-2">Gagal menyimpan.</p>
          )}
        </form>
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
  const directorPath = path.join(process.cwd(), "data/directors.json");
  let directors: DirectorDetail[] = [];

  try {
    const raw = await fs.readFile(directorPath, "utf-8");
    directors = JSON.parse(raw);
  } catch (e) {
    console.warn("Tidak ada data directors.json");
  }

  const id = parseInt(params?.id as string, 10);
  const director = directors.find((d) => d.id === id);

  if (!director) {
    return { notFound: true };
  }

  return { props: { director } };
};
