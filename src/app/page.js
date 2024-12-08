import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Welcome</h1>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
        onClick={() => router.push('/signin')}
      >
        Sign In
      </button>
      <button
        className="px-4 py-2 bg-green-500 text-white rounded"
        onClick={() => router.push('/signup')}
      >
        Sign Up
      </button>
    </div>
  );
}
