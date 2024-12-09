"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path); // Navigate to the specified path
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6 text-blue-600">
          Welcome to Our Application
        </h1>
        <div className="space-x-4">
          {/* <Link href="/signin">
            <button className="px-6 py-3 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600">
              Sign In
            </button>
          </Link> */}
          <button
            onClick={() => handleNavigation("/signin")}
            className="px-6 py-3 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
          >
            Sign In
          </button>
          {/* <Link href="/signup">
            <button className="px-6 py-3 bg-green-500 text-white rounded-md shadow hover:bg-green-600">
              Sign Up
            </button>
          </Link> */}
          <button
            onClick={() => handleNavigation("/signup")}
            className="px-6 py-3 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
