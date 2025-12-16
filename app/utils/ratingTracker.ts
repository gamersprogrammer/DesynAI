import { doc, setDoc, getDoc, getFirestore } from "firebase/firestore";
import { auth, app } from "@/firebase";

export async function submitRating(rating: number): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No authenticated user for rating");
    return;
  }

  if (rating < 1 || rating > 5) {
    console.error("Rating must be between 1 and 5");
    return;
  }

  const db = getFirestore(app);
  const statsRef = doc(db, "users", user.uid, "stats", "overview");

  try {
    await setDoc(
      statsRef,
      {
        rating,
        ratedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error submitting rating:", error);
    throw error;
  }
}

export async function fetchRating(): Promise<number | null> {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No authenticated user for fetching rating");
    return null;
  }

  const db = getFirestore(app);
  const statsRef = doc(db, "users", user.uid, "stats", "overview");

  try {
    const snap = await getDoc(statsRef);
    if (!snap.exists()) return null;
    return snap.data().rating || null;
  } catch (error) {
    console.error("Error fetching rating:", error);
    return null;
  }
}
