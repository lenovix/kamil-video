import fs from "fs/promises";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const directorsPath = path.join(process.cwd(), "data/directors.json");
  try {
    await fs.writeFile(directorsPath, "[]");
    res.status(200).json({ message: "Directors cleared." });
  } catch (err) {
    console.error("Failed to clear Directors:", err);
    res.status(500).json({ error: "Gagal menghapus Directors." });
  }
}
