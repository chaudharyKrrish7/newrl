"use client";

import { useState, useEffect } from "react";
import { Phone, MessageCircle, LogIn, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";

interface Inquiry {
  id: string;
  inquiryId: string;
  studentName: string;
  fathersName: string;
  mobileNo: string;
  courses: string[];
  status: string;
  photoUrl?: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState("ALL");

  // Fetch data in real-time from Firebase
  useEffect(() => {
    if (!isAuthenticated) return;

    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Inquiry[];
      setInquiries(data);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") setIsAuthenticated(true);
    else alert("Incorrect Password");
  };

  const updateStatus = async (docId: string, newStatus: string) => {
    try {
      const docRef = doc(db, "inquiries", docId);
      await updateDoc(docRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const filteredInquiries = filter === "ALL" ? inquiries : inquiries.filter(i => i.status === filter);

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-gray-200">
          <LogIn className="mx-auto text-blue-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded mb-4 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full bg-blue-700 text-white p-3 rounded font-bold hover:bg-blue-800 transition">
            Login
          </button>
        </form>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-slate-100 text-gray-900">
      
      {/* Header */}
      <div className="bg-teal-700 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Inquiry Management ({inquiries.length})</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b hide-scrollbar">
        {["ALL", "OPEN", "IN-PROGRESS", "HOLD", "CLOSE"].map((status) => (
          <button 
            key={status} 
            onClick={() => setFilter(status)} 
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === status ? "bg-orange-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Inquiry List */}
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        {filteredInquiries.length === 0 && (
          <div className="text-center text-gray-500 mt-10">No inquiries found in this category.</div>
        )}

        {filteredInquiries.map((inq) => (
          <div key={inq.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex flex-col sm:flex-row gap-5 transition hover:shadow-md">
            
            {/* Student Photo */}
            <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {inq.photoUrl ? (
                <img src={inq.photoUrl} alt="Student" className="w-full h-full object-cover" />
              ) : (
                <User className="text-gray-300" size={36} />
              )}
            </div>

            {/* Core Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{inq.inquiryId}</h3>
                </div>
                
                {/* Status Dropdown */}
                <select 
                  value={inq.status}
                  onChange={(e) => updateStatus(inq.id, e.target.value)}
                  className={`text-xs font-bold p-1.5 rounded border focus:outline-none cursor-pointer ${
                    inq.status === 'CLOSE' ? 'bg-red-50 text-red-700 border-red-200' : 
                    inq.status === 'IN-PROGRESS' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                    inq.status === 'HOLD' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                    'bg-green-50 text-green-700 border-green-200'
                  }`}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN-PROGRESS">IN-PROGRESS</option>
                  <option value="HOLD">HOLD</option>
                  <option value="CLOSE">CLOSE</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                <p><span className="font-medium text-gray-500">Name:</span> {inq.studentName}</p>
                <p><span className="font-medium text-gray-500">Father:</span> {inq.fathersName}</p>
                <p><span className="font-medium text-gray-500">Mobile:</span> {inq.mobileNo}</p>
                <p><span className="font-medium text-gray-500">Courses:</span> {inq.courses?.join(", ") || "None"}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <a 
                  href={`https://wa.me/91${inq.mobileNo}?text=Hello ${inq.studentName}, regarding your inquiry at SITE Computer...`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-green-500 p-2.5 rounded-full text-white shadow-sm hover:bg-green-600 transition"
                  title="WhatsApp Message"
                >
                  <MessageCircle size={18} />
                </a>
                <a 
                  href={`tel:+91${inq.mobileNo}`} 
                  className="bg-blue-500 p-2.5 rounded-full text-white shadow-sm hover:bg-blue-600 transition"
                  title="Call Directly"
                >
                  <Phone size={18} />
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}