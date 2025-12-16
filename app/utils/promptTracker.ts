import { doc, updateDoc, increment, getFirestore } from "firebase/firestore";
import { auth, app } from "@/firebase";

function getTodayDayName(): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
}

export async function incrementTodayPrompts(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    console.warn("No authenticated user for prompt tracking");
    return;
  }

  const db = getFirestore(app);
  const statsRef = doc(db, "users", user.uid, "stats", "weeklyPrompts");
  const todayDay = getTodayDayName();

  try {
    await updateDoc(statsRef, {
      [todayDay]: increment(1),
    });
  } catch (error) {
    console.error("Error incrementing today's prompts:", error);
  }
}
