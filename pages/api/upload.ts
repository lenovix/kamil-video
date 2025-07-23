import path from "path";
import fs from "fs/promises";
import { mkdirSync, existsSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

// Nonaktifkan body parser bawaan Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

const videosDir = path.join(process.cwd(), "public/videos");
const metadataPath = path.join(process.cwd(), "data/video-metadata.json");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  // Import formidable secara dinamis
  const formidable = (await import("formidable")).default;
  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw err;
      if (err) {
        console.error("Parse error:", err);
        return res.status(500).json({ error: err.message });
      }

      const series = Array.isArray(fields.series)
        ? fields.series[0]?.trim()
        : fields.series?.trim();
      const chapterTitle = Array.isArray(fields.chapterTitle)
        ? fields.chapterTitle[0]?.trim()
        : fields.chapterTitle?.trim();
      const file = Array.isArray(files.video) ? files.video[0] : files.video;

      if (!series || !chapterTitle || !file) {
        return res.status(400).json({ error: "Data tidak lengkap." });
      }

      const safeSeries = series.replace(/[^a-zA-Z0-9_-]/g, "_");
      const seriesFolder = path.join(videosDir, safeSeries);
      mkdirSync(seriesFolder, { recursive: true });

      const originalName = file.originalFilename || "video.mp4";
      const targetPath = path.join(seriesFolder, originalName);

      try {
        await fs.rename(file.filepath, targetPath);
      } catch (renameErr) {
        console.error("Rename error:", renameErr);
        return res.status(500).json({ error: "Gagal memindahkan file." });
      }

      // Load metadata
      let metadata: any[] = [];
      if (existsSync(metadataPath)) {
        try {
          const jsonData = await fs.readFile(metadataPath, "utf8");
          metadata = jsonData.trim() ? JSON.parse(jsonData) : [];
        } catch (err) {
          console.warn("Metadata corrupt, using empty array.");
          metadata = [];
        }
      }

      // Cari series
      let seriesData = metadata.find((s) => s.seriesTitle === series);
      if (!seriesData) {
        seriesData = {
          id: Date.now(),
          seriesTitle: series,
          chapters: [],
        };
        metadata.push(seriesData);
      }

      // Tambah chapter
      seriesData.chapters.push({
        chapterId: Date.now(),
        title: chapterTitle,
        filename: path.join("videos", safeSeries, originalName),
        uploadedAt: new Date().toISOString(),
      });

      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      res.status(200).json({ message: "Berhasil upload", metadata });
    } catch (error) {
      console.error("Upload Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });
}
