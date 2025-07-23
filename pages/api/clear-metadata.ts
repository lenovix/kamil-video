import fs from "fs/promises";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const metadataPath = path.join(process.cwd(), "data/video-metadata.json");
  try {
    await fs.writeFile(metadataPath, "[]");
    res.status(200).json({ message: "Metadata cleared." });
  } catch (err) {
    console.error("Failed to clear metadata:", err);
    res.status(500).json({ error: "Gagal menghapus metadata." });
  }
}
