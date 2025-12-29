import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-center text-white p-6">
      
      <h1 className="text-8xl md:text-9xl font-extrabold text-indigo-500 tracking-tighter">
        404
      </h1>

      <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-200">
        Oops! Page Not Found
      </h2>

      <p className="mt-4 max-w-md text-lg text-gray-400">
        Looks like you took a wrong turn 🚧. Don&apos;t worry, even the best
        navigators get lost sometimes.
      </p>

      <Link href="/" className="mt-8 px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
        Back to Home
      </Link>
    </div>
  );
}