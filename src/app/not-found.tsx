import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-xs tracking-[0.3em] uppercase text-stone-300 mb-4">404</p>
      <h1
        className="text-5xl md:text-7xl text-stone-200 mb-6"
        style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 300 }}
      >
        Page Not Found
      </h1>
      <p className="text-stone-400 mb-10 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-block bg-stone-900 text-white text-xs tracking-widest uppercase px-10 py-4 hover:bg-stone-700 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
