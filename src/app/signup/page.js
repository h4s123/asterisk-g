"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      // const ip_address = await (
      //   await axios.get("https://api.ipify.org?format=json")
      // ).data.ip;
      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password,
        key,
        // ip_address,
      });
      router.push("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <input
          type="text"
          placeholder="Key (for admin role)"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />
        <button
          className="w-full px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleSignUp}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
