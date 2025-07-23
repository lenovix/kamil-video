import fs from "fs/promises";
import path from "path";
import { existsSync, readdirSync, rmSync, statSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";

const videosDir = path.join(process.cwd(), "public/videos");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    if (existsSync(videosDir)) {
      const items = readdirSync(videosDir);
      for (const item of items) {
        const fullPath = path.join(videosDir, item);
        const stat = statSync(fullPath);
        if (stat.isDirectory()) {
          rmSync(fullPath, { recursive: true, force: true });
        } else {
          await fs.unlink(fullPath);
        }
      }
    }

    res.status(200).json({ message: "Semua video dihapus." });
  } catch (err) {
    console.error("Gagal menghapus video:", err);
    res.status(500).json({ error: "Gagal menghapus video." });
  }
}
