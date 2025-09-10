import path from "path";
import fs from "fs/promises";
import { mkdirSync, existsSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: false },
};

const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
const dataDir = path.join(process.cwd(), "public/data");

// Daftar field yang harus diproses sebagai array (dipisah koma)
const arrayFields = ["director", "maker", "label", "genre", "cast"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const formidable = (await import("formidable")).default;
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    maxFileSize: Infinity,
    maxTotalFileSize: Infinity,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      // Baca metadata lama untuk menentukan ID baru
      let metadata: any[] = [];
      if (existsSync(metadataPath)) {
        const raw = await fs.readFile(metadataPath, "utf-8");
        metadata = raw.trim() ? JSON.parse(raw) : [];
      }

      const id = (metadata.length + 1).toString();
      const basePath = path.join(dataDir, id);
      mkdirSync(basePath, { recursive: true });
      mkdirSync(path.join(basePath, "cover"), { recursive: true });
      mkdirSync(path.join(basePath, "screenshot"), { recursive: true });
      mkdirSync(path.join(basePath, "video"), { recursive: true });

      // Save cover
      const cover = Array.isArray(files.cover) ? files.cover[0] : files.cover;
      let coverName = "cover.jpg";
      if (cover) {
        coverName = cover.originalFilename || coverName;
        await fs.rename(
          cover.filepath,
          path.join(basePath, "cover", coverName)
        );
      }

      // Save screenshots
      const screenshots = Array.isArray(files.screenshots)
        ? files.screenshots
        : files.screenshots
        ? [files.screenshots]
        : [];
      const screenshotPaths: string[] = [];
      for (const shot of screenshots) {
        if (!shot) continue;
        const name = shot.originalFilename || "screenshot.jpg";
        const dest = path.join(basePath, "screenshot", name);
        await fs.rename(shot.filepath, dest);
        screenshotPaths.push(`data/${id}/screenshot/${name}`);
      }

      // Normalisasi fields
      const normalizedFields: Record<string, string | string[]> = {};
      for (const [key, value] of Object.entries(fields)) {
        const val = Array.isArray(value) ? value[0] : value;
        if (arrayFields.includes(key)) {
          normalizedFields[key] = val
            ? val
                .toString()
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
        } else {
          normalizedFields[key] = val ? val.toString() : "";
        }
      }

      // Save video (optional)
      let videoName: string | null = null;
      const video = Array.isArray(files.video) ? files.video[0] : files.video;

      if (video) {
        // Ambil "codeId" dari normalizedFields
        const rawCode = normalizedFields.codeId;
        const safeCode =
          typeof rawCode === "string" && rawCode.trim()
            ? rawCode.trim().replace(/[^a-zA-Z0-9_-]/g, "_")
            : "video";

        const ext = path.extname(video.originalFilename || "") || ".mp4";
        videoName = `${safeCode}${ext}`;

        await fs.rename(
          video.filepath,
          path.join(basePath, "video", videoName)
        );
      }

      // Setelah kamu dapat metadata video, misalnya ada field "director"
      const directors = Array.isArray(normalizedFields.director)
        ? normalizedFields.director
        : normalizedFields.director
        ? [normalizedFields.director]
        : [];

      if (directors.length > 0) {
        try {
          const directorsFile = path.join(
            process.cwd(),
            "data",
            "directors.json"
          );

          // Baca data lama
          let existing: any[] = [];
          if (existsSync(directorsFile)) {
            const raw = await fs.readFile(directorsFile, "utf-8");
            existing = raw.trim() ? JSON.parse(raw) : [];
          }

          // Cari ID terakhir
          let lastId =
            existing.length > 0 ? Math.max(...existing.map((d) => d.id)) : 0;

          for (const dir of directors) {
            const alreadyExists = existing.some(
              (d) => d.name.toLowerCase() === dir.toLowerCase()
            );

            if (!alreadyExists) {
              lastId++;
              existing.push({
                id: lastId,
                name: dir,
                photo: "",
                bio: "",
                birthYear: 0,
                gallery: [],
              });
              console.log(`Director baru ditambahkan: ${dir}`);
            }
          }

          await fs.writeFile(
            directorsFile,
            JSON.stringify(existing, null, 2),
            "utf-8"
          );
        } catch (err) {
          console.error("Gagal membuat data directors:", err);
        }
      }

      const entry = {
        id,
        ...normalizedFields,
        cover: `data/${id}/cover/${coverName}`,
        screenshots: screenshotPaths,
        video: videoName ? `data/${id}/video/${videoName}` : null,
        uploadedAt: new Date().toISOString(),
      };

      metadata.push(entry);
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      res.status(200).json({ message: "Upload berhasil", id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
