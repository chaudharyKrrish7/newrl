"use client";

import { useState, useEffect } from "react";
import { Phone, MessageCircle, LogIn, User, Plus } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, arrayUnion } from "firebase/firestore";

interface Followup {
  text: string;
  timestamp: string;
}

interface Inquiry {
  id: string;
  inquiryId: string;
  studentName: string;
  fathersName: string;
  mobileNo: string;
  address: string;
  schoolCollege: string;
  feesDetail: string;
  batchTimings: string;
  startDate: string;
  otherInfo: string;
  referenceBy: string;
  courses: string[];
  status: string;
  photoUrl?: string;
  followups?: Followup[];
  createdAt: any;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [followupInput, setFollowupInput] = useState<{ [key: string]: string }>({});
  const [expandedCard, setExpandedCard] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!isAuthenticated) return;
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Inquiry[];
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
    await updateDoc(doc(db, "inquiries", docId), { status: newStatus });
  };

  // Format Firebase timestamp to Date String
  const formatDateTime = (firebaseTimestamp: any) => {
    if (!firebaseTimestamp) return "N/A";
    const dateObj = firebaseTimestamp.toDate ? firebaseTimestamp.toDate() : new Date();
    return dateObj.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
  };

  // Add Follow Up to Database
  const addFollowup = async (inqId: string) => {
    const text = followupInput[inqId];
    if (!text || text.trim() === "") return;
    
    const newFollowup = {
      text: text.toUpperCase(),
      timestamp: new Date().toLocaleString('en-IN', { 
        day: '2-digit', month: 'short', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', hour12: true 
      })
    };

    await updateDoc(doc(db, "inquiries", inqId), {
      followups: arrayUnion(newFollowup)
    });

    setFollowupInput({ ...followupInput, [inqId]: "" }); // Clear input
  };

  // Generate WhatsApp Template
  const sendWelcomeTemplate = (inq: Inquiry) => {
    const courseStr = inq.courses?.join(", ") || "Unknown";
    const dateStr = formatDateTime(inq.createdAt);
    
    const msg = `Hi ${inq.studentName.toUpperCase()},\n🌟 टोंक जिले के सबसे उत्कृष्ट एवं आधुनिक सुविधाओं से युक्त कंप्यूटर संस्थान SITE Computer में आपका स्वागत है।आपकी Inquiry सफलतापूर्वक दर्ज कर ली गई है।\n📝 (${courseStr}) Course के लिए आपका Inquiry No.: ${inq.inquiryId}\nहमारे काउंसलर शीघ्र ही आपसे संपर्क करेंगे और आपको कोर्स की अवधि, फीस, बैच टाइमिंग, सर्टिफिकेट एवं करियर अवसरों की पूरी जानकारी प्रदान करेंगे।\n📞 हेल्पलाइन: 9214996730, 9610736368\n🏢 पता: अम्बिका होटल के सामने, टोंक रोड, निवाई\n👤 हमारी प्रोफाइल देखें:\nhttps://visitmyprofile.in/Site-Computer\nधन्यवाद।\nTeam SITE Computer\n"आपकी सफलता ही हमारा लक्ष्य है।"\n________________________________\n*Enquiry date/time  :  \n${dateStr}*`;
    
    window.open(`https://wa.me/91${inq.mobileNo}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredInquiries = filter === "ALL" ? inquiries : inquiries.filter(i => i.status === filter);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center border">
          <LogIn className="mx-auto text-blue-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
          <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded mb-4 focus:ring-2 focus:ring-blue-500 text-black" />
          <button type="submit" className="w-full bg-blue-700 text-white p-3 rounded font-bold hover:bg-blue-800 transition">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 uppercase">
      
      <div className="bg-teal-700 text-white p-4 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">Inquiries ({inquiries.length})</h1>
      </div>

      <div className="flex gap-2 p-4 overflow-x-auto bg-white border-b hide-scrollbar">
        {["ALL", "OPEN", "IN-PROGRESS", "HOLD", "CLOSE"].map((status) => (
          <button key={status} onClick={() => setFilter(status)} className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${filter === status ? "bg-orange-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {status}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {filteredInquiries.map((inq) => (
          <div key={inq.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 transition hover:shadow-md">
            
            {/* Card Header & Photo */}
            <div className="flex flex-col sm:flex-row gap-5 mb-4">
              <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {inq.photoUrl ? <img src={inq.photoUrl} alt="Student" className="w-full h-full object-cover" /> : <User className="text-gray-300" size={36} />}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl">{inq.inquiryId}</h3>
                    <p className="text-xs text-gray-400 normal-case italic font-medium">{formatDateTime(inq.createdAt)}</p>
                  </div>
                  <select value={inq.status} onChange={(e) => updateStatus(inq.id, e.target.value)} className={`text-xs font-bold p-1.5 rounded border outline-none cursor-pointer ${inq.status === 'CLOSE' ? 'bg-red-50 text-red-700' : inq.status === 'IN-PROGRESS' ? 'bg-orange-50 text-orange-700' : inq.status === 'HOLD' ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-700'}`}>
                    <option value="OPEN">OPEN</option>
                    <option value="IN-PROGRESS">IN-PROGRESS</option>
                    <option value="HOLD">HOLD</option>
                    <option value="CLOSE">CLOSE</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 mt-3 font-semibold">
                  <p><span className="text-gray-400">NAME:</span> {inq.studentName}</p>
                  <p><span className="text-gray-400">MOBILE:</span> {inq.mobileNo}</p>
                  <p><span className="text-gray-400">FATHER:</span> {inq.fathersName || "-"}</p>
                  <p><span className="text-gray-400">COURSES:</span> <span className="text-blue-600">{inq.courses?.join(", ") || "-"}</span></p>
                </div>
              </div>
            </div>

            {/* EXPANDABLE FULL DETAILS */}
            <div className="bg-gray-50 p-3 rounded-lg border text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 font-medium">
              <p><span className="text-gray-400">ADDRESS:</span> {inq.address || "-"}</p>
              <p><span className="text-gray-400">SCHOOL/COLLEGE:</span> {inq.schoolCollege || "-"}</p>
              <p><span className="text-gray-400">FEES DETAIL:</span> {inq.feesDetail || "-"}</p>
              <p><span className="text-gray-400">BATCH TIMINGS:</span> {inq.batchTimings || "-"}</p>
              <p><span className="text-gray-400">START DATE:</span> {inq.startDate || "-"}</p>
              <p><span className="text-gray-400">REFERENCE:</span> {inq.referenceBy || "-"}</p>
              <p className="sm:col-span-2"><span className="text-gray-400">OTHER INFO:</span> {inq.otherInfo || "-"}</p>
            </div>

            {/* FOLLOW UP SECTION */}
            <div className="mb-4">
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <h4 className="font-bold text-gray-700 text-sm">FOLLOW-UPS ({inq.followups?.length || 0})</h4>
                <button onClick={() => setExpandedCard({...expandedCard, [inq.id]: !expandedCard[inq.id]})} className="bg-orange-100 text-orange-700 p-1 rounded hover:bg-orange-200 flex items-center gap-1 text-xs font-bold">
                  <Plus size={14} /> ADD
                </button>
              </div>
              
              {/* Followup Input Box (Toggled) */}
              {expandedCard[inq.id] && (
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="Type follow up details..." value={followupInput[inq.id] || ""} onChange={(e) => setFollowupInput({...followupInput, [inq.id]: e.target.value})} className="flex-1 border p-2 rounded text-sm bg-white" />
                  <button onClick={() => addFollowup(inq.id)} className="bg-orange-600 text-white px-4 rounded text-sm font-bold hover:bg-orange-700">SAVE</button>
                </div>
              )}

              {/* List of Followups */}
              <div className="space-y-2 max-h-32 overflow-y-auto hide-scrollbar">
                {inq.followups?.map((f, idx) => (
                  <div key={idx} className="bg-orange-50 border border-orange-100 p-2 rounded text-xs flex justify-between">
                    <span className="font-semibold text-gray-800">{f.text}</span>
                    <span className="text-orange-600 normal-case ml-4 flex-shrink-0">{f.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons (WhatsApp Automation + Call) */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <button onClick={() => sendWelcomeTemplate(inq)} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-100 transition">
                <MessageCircle size={16} /> SEND WELCOME MSG
              </button>
              
              <a href={`tel:+91${inq.mobileNo}`} className="bg-blue-500 p-2.5 rounded-full text-white shadow-sm hover:bg-blue-600 transition" title="Call Directly">
                <Phone size={18} />
              </a>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}