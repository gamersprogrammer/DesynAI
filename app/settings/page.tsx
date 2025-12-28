"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  LogOut, 
  Camera, 
  Lock, 
  Bell, 
  ShieldCheck, 
  ChevronDown,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header";
import { auth, db } from "@/firebase";
import { useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Image from "next/image";

export default function SettingsPage() {
  // Navigation State
  const [activeTab, setActiveTab] = useState("profile");

  // User Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [gender, setGender] = useState("male");
  const [address, setAddress] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  
  const router = useRouter();

  // Load Google user info and profile from Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (auth.currentUser) {
        const displayName = auth.currentUser.displayName || "";
        const names = displayName.split(" ");
        setFirstName(names[0] || "");
        setLastName(names.slice(1).join(" ") || "");
        
        setEmail(auth.currentUser.email || "");
        setPhotoURL(auth.currentUser.photoURL || "");

        // Load additional profile data from Firestore
        try {
          const profileRef = doc(db, "users", auth.currentUser.uid, "profile", "info");
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setMobile(data.mobile || "");
            setGender(data.gender || "male");
            setAddress(data.address || "");
          }
        } catch (err) {
          console.error("Error loading profile:", err);
        }
      }
    };
    
    loadUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    if (!auth.currentUser) return;

    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const profileRef = doc(db, "users", auth.currentUser.uid, "profile", "info");
      
      await setDoc(profileRef, {
        firstName,
        lastName,
        mobile,
        gender,
        address,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setSaveStatus("success");
      setSaveMessage("Profile saved successfully!");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveStatus("error");
      setSaveMessage("Failed to save profile. Please try again.");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/signin");
    } catch (err) {
      console.error("Log out failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--panel)] flex overflow-hidden font-sans text-white">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-auto">
        {/* Header - kept consistent but styled light */}
        <div className="px-8 pt-8">
            <Header
            title="Account Settings"
            icon={<Settings className="text-indigo-600 w-6 h-6" />}
            onHistoryClick={() => {}}
            />
        </div>

        <div className="p-8 md:p-10 flex-1">
          <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
            
            {/* Inner Sidebar (Settings Menu) */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-black/50 rounded-lg shadow-sm p-2 border border-[#23272F]">
                <nav className="space-y-1">
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'profile' ? 'bg-indigo-600 text-white border-l-4 border-indigo-600' : 'text-[#b0b7c3] hover:bg-white/5'}`}
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => setActiveTab("password")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#b0b7c3] rounded-md hover:bg-white/5 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Password
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#b0b7c3] rounded-md hover:bg-white/5 transition-colors">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#b0b7c3] rounded-md hover:bg-white/5 transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                    Verification
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-black/50 rounded-lg shadow-sm p-8 border border-[#23272F]">
              
              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-10">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 ring-4 ring-black/50 shadow-md">
                    {photoURL ? (
                      <Image
                        src={photoURL}
                        alt="Profile"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 transition shadow-sm border-2 border-black/50">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition shadow-sm">
                    Upload New
                  </button>
                  <button className="px-4 py-2 bg-white/5 text-gray-300 text-sm font-medium rounded-md hover:bg-white/10 transition border border-[#23272F]">
                    Delete avatar
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* First Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-2.5 border border-[#23272F] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-4 py-2.5 border border-[#23272F] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Email</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2.5 border border-[#23272F] rounded-lg text-sm text-gray-400 bg-white/2.5 cursor-not-allowed"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 border-[#23272F] rounded-l-lg bg-white/5">
                        {/* Placeholder for Flag */}
                        <span className="w-5 h-4 bg-green-600 rounded-sm relative overflow-hidden">
                            <span className="absolute inset-x-0 top-1/3 bottom-1/3 bg-white"></span>
                        </span>
                        <ChevronDown className="w-3 h-3 ml-2 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="0806 123 7890"
                        className="flex-1 px-4 py-2.5 border border-[#23272F] rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Gender</label>
                  <div className="flex gap-6 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        checked={gender === 'male'} 
                        onChange={() => setGender('male')}
                        className="w-4 h-4 text-indigo-600 border-[#23272F] focus:ring-indigo-500" 
                      />
                      <span className="text-sm text-gray-300">Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gender" 
                        checked={gender === 'female'} 
                        onChange={() => setGender('female')}
                        className="w-4 h-4 text-indigo-600 border-[#23272F] focus:ring-indigo-500" 
                      />
                      <span className="text-sm text-gray-300">Female</span>
                    </label>
                  </div>
                </div>

                {/* ID */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">ID</label>
                  <input
                    type="text"
                    placeholder="1559 000 7788 8DER"
                    className="w-full px-4 py-2.5 border border-[#23272F] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/2.5 text-gray-400"
                  />
                </div>

                 {/* Tax ID */}
                 <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Tax Identification Number</label>
                  <input
                    type="text"
                    placeholder="examples@gmail.com"
                    className="w-full px-4 py-2.5 border border-[#23272F] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500"
                  />
                </div>

                {/* Tax Country */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white">Tax Identification Country</label>
                  <div className="flex items-center w-full px-4 py-2.5 border border-[#23272F] rounded-lg text-sm bg-white/5">
                     <span className="w-5 h-4 bg-green-600 rounded-sm relative overflow-hidden mr-3">
                        <span className="absolute inset-x-0 top-1/3 bottom-1/3 bg-white"></span>
                    </span>
                    <span className="text-gray-300">Nigeria</span>
                    <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
                  </div>
                </div>

                {/* Residential Address - Spans 2 columns */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-sm font-medium text-white">Residential Address</label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ib street orogun ibadan"
                    className="w-full px-4 py-2.5 border border-[#23272F] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/5 text-white placeholder-gray-500 resize-none"
                  />
                </div>

              </div>

              {/* Feedback Message */}
              {saveStatus !== "idle" && (
                <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${saveStatus === 'success' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  {saveStatus === 'success' ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={saveStatus === 'success' ? 'text-green-300' : 'text-red-300'}>
                    {saveMessage}
                  </span>
                </div>
              )}

              {/* Footer Actions */}
              <div className="mt-8 pt-6 border-t border-[#23272F] flex items-center justify-between">
                <button 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
                <button 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}