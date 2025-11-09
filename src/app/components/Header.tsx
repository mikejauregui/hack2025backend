import { Link } from "wouter";

export default function Header() {
  return (
    <header>
      <nav className="flex items-center p-4 bg-gray-800 text-white gap-4">
        <Link href="/">Home</Link>
      </nav>
    </header>
  );
}
