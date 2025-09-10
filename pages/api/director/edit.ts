import path from "path";
import fs from "fs/promises";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // penting agar formidable bisa handle form-data
  },
};

const directorPath = path.join(process.cwd(), "data/directors.json");
const uploadDir = path.join(process.cwd(), "public/uploads/directors");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await fs.mkdir(uploadDir, { recursive: true });

    const form = formidable({
      multiples: false,
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error parsing form" });
      }

      const id = parseInt(req.query.id as string, 10);
      if (!id) return res.status(400).json({ error: "Missing id" });

      const raw = await fs.readFile(directorPath, "utf-8");
      let directors = JSON.parse(raw);

      const idx = directors.findIndex((d: any) => d.id === id);
      if (idx === -1)
        return res.status(404).json({ error: "Director not found" });

      let photoPath = directors[idx].photo;
      if (files.photo) {
        const file = files.photo as formidable.File;

        // kompatibilitas formidable v1 dan v2
        const filePath = (file as any).filepath || (file as any).path;
        if (filePath) {
          photoPath = "/uploads/directors/" + path.basename(filePath);
        }
      }

      directors[idx] = {
        ...directors[idx],
        name: fields.name || directors[idx].name,
        bio: fields.bio || directors[idx].bio,
        birthYear: fields.birthYear
          ? parseInt(fields.birthYear as string)
          : directors[idx].birthYear,
        photo: photoPath,
      };

      await fs.writeFile(
        directorPath,
        JSON.stringify(directors, null, 2),
        "utf-8"
      );

      return res
        .status(200)
        .json({ message: "Director updated", director: directors[idx] });
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
