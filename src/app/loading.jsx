import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <Loader2 className="h-16 w-16 animate-spin text-indigo-500" />
      
      <p className="mt-4 text-lg font-semibold text-gray-400 tracking-wider">
        Loading...
      </p>
    </div>
  );
}