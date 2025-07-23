import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-black text-white py-4 px-6 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
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
    </header>
  );
}
