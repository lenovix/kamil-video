import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="bg-black text-white shadow-md">
      <div className="max-w-6xl mx-auto py-4 px-6 flex flex-col gap-3">
        {/* Top Row: Logo + Nav */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-wide">🎥 Kamil Video</h1>
          </Link>
          <nav className="space-x-4">
            <Link href="/" className="hover:underline text-sm">
              Home
            </Link>
            <Link href="/upload" className="hover:underline text-sm">
              Upload
            </Link>
            <Link href="/settings" className="hover:underline text-sm">
              Settings
            </Link>
          </nav>
        </div>

        {/* Middle Row: Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or code ID..."
            className="flex-1 px-3 py-2 rounded bg-white text-black text-sm"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
          >
            Search
          </button>
        </form>

        {/* Bottom Row: Quick Links */}
        <div className="flex flex-wrap gap-3 text-sm mt-1">
          <Link href="/list/director" className="hover:underline">
            Director
          </Link>
          <Link href="/list/maker" className="hover:underline">
            Maker
          </Link>
          <Link href="/list/label" className="hover:underline">
            Label
          </Link>
          <Link href="/list/genre" className="hover:underline">
            Genre
          </Link>
          <Link href="/list/cast" className="hover:underline">
            Cast
          </Link>
          <Link href="/list/series" className="hover:underline">
            Series
          </Link>
        </div>
      </div>
    </header>
  );
}
