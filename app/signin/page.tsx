"use client";

import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase"; // adjust path if needed
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      // User signed in successfully
      // console.log("Signed in:", result.user);
      router.push("/"); // redirect after login
    } catch (error: any) {
      if (error.code === "auth/user-cancelled") {
        console.log("User cancelled the login popup.");
      } else {
        console.error("Firebase auth error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[rgba(22,27,34,0.9)] text-white px-6">
      <div className="w-full max-w-md bg-[#161b22] backdrop-blur-md p-8 rounded-md shadow-xl border border-[#23272f]">
        <h1 className="text-3xl font-bold text-center mb-6">
          Welcome to <span className="text-indigo-400">Desyn</span>
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Sign in securely using our preferred provider
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-60"
          >
            <FcGoogle className="text-2xl" />
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
        </div>

        <p className="text-sm text-center text-[#b0b7c3] mt-6">
          By signing in, you agree to our{" "}
          <a href="" className="text-[#e6edf3] hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="" className="text-[#e6edf3] hover:underline">
            Privacy Policy
          </a>.
        </p>
      </div>
    </div>
  );
}
