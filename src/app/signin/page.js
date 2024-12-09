"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import from 'next/navigation' for the app directory
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signin",
        { email, password }
      );

      // Save the token in localStorage
      const { token, user } = response.data;
      localStorage.setItem("token", token);

      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/admin");
        toast.success("Welcome Admin");
      } else {
        router.push("/user");
        toast.success("Welcome User");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <ToastContainer />
      <div className="w-full max-w-md bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
        {isLoading ? <ClipLoader color="blue" /> : (
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSignIn}
        >
          Sign In
        </button>
        )}
      </div>
    </div>
  );
}
