"use client";

import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { FirebaseError } from "firebase/app";

const generateReferralCode = (): string => {
  const digits = Math.floor(100 + Math.random() * 900);
  const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  const tail = Math.floor(10 + Math.random() * 90);
  return `DAI${digits}${letter}${tail}`;
};

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const credential = await signInWithPopup(auth, provider);
      const user = credential.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // Only generate referral code once
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          referralCode: generateReferralCode(),
          createdAt: serverTimestamp(),
        });
      }

      router.push("/");
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/popup-closed-by-user") {
          console.log("User cancelled the login popup.");
        } else {
          console.error("Firebase auth error:", error.message);
        }
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[rgba(22,27,34,0.9)] text-white px-6">
      <div className="w-full max-w-md bg-[#161b22] p-8 rounded-md shadow-xl border border-[#23272f]">
        <h1 className="text-3xl font-bold text-center mb-6">
          Welcome to <span className="text-indigo-400">Desyn</span>
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Sign in securely using our preferred provider
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-60"
        >
          <FcGoogle className="text-2xl" />
          {loading ? "Signing in..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
