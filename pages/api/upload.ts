import path from "path";
import fs from "fs/promises";
import { mkdirSync, existsSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: { bodyParser: false },
};

const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
const dataDir = path.join(process.cwd(), "public/data");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const formidable = (await import("formidable")).default;
  const form = formidable({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    try {
      const id = Date.now().toString();
      const basePath = path.join(dataDir, id);
      mkdirSync(basePath, { recursive: true });
      mkdirSync(path.join(basePath, "cover"), { recursive: true });
      mkdirSync(path.join(basePath, "screenshot"), { recursive: true });
      mkdirSync(path.join(basePath, "video"), { recursive: true });

      // Save cover
      const cover = Array.isArray(files.cover) ? files.cover[0] : files.cover;
      const coverName = cover.originalFilename || "cover.jpg";
      await fs.rename(cover.filepath, path.join(basePath, "cover", coverName));

      // Save screenshots
      const screenshots = Array.isArray(files.screenshots)
        ? files.screenshots
        : [files.screenshots];
      const screenshotPaths: string[] = [];
      for (const shot of screenshots) {
        if (!shot) continue;
        const name = shot.originalFilename || "screenshot.jpg";
        const dest = path.join(basePath, "screenshot", name);
        await fs.rename(shot.filepath, dest);
        screenshotPaths.push(`data/${id}/screenshot/${name}`);
      }

      // Save video
      const video = Array.isArray(files.video) ? files.video[0] : files.video;
      const videoName = video.originalFilename || "video.mp4";
      await fs.rename(video.filepath, path.join(basePath, "video", videoName));

      // Read & update metadata
      let metadata = [];
      if (existsSync(metadataPath)) {
        const raw = await fs.readFile(metadataPath, "utf-8");
        metadata = raw.trim() ? JSON.parse(raw) : [];
      }

      const entry = {
        id,
        ...fields,
        cover: `data/${id}/cover/${coverName}`,
        screenshots: screenshotPaths,
        video: `data/${id}/video/${videoName}`,
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
