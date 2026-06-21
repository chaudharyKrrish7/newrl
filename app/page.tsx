"use client";

import { useState } from "react";
import { Camera, Send } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getCountFromServer } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function InquiryForm() {
  const [courses, setCourses] = useState<string[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    studentName: "",
    fathersName: "",
    mobileNo: "",
    address: "",
    schoolCollege: "",
    feesDetail: "",
    batchTimings: "",
    startDate: "",
    otherInfo: "",
    referenceBy: ""
  });

  const courseOptions = [
    "RS-CIT", "RS-CFA", "TALLY", "TYPING", "DTP", 
    "BASIC", "TCC", "ADCA", "ADV.EXCEL", "OTHER"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCourseChange = (course: string) => {
    setCourses((prev) => 
      prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = "";

      // 1. Upload photo to Firebase Storage if one was captured
      if (photo) {
        const photoRef = ref(storage, `inquiry_photos/${Date.now()}_${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoUrl = await getDownloadURL(photoRef);
      }

     // 2. Generate Sequential ID (SC001, SC002, etc.)
      const inquiryRef = collection(db, "inquiries");
      const snapshot = await getCountFromServer(inquiryRef);
      const totalCount = snapshot.data().count;
      
      // Adds 1 to the total count, and pads it with leading zeros (e.g., 1 becomes 001)
      const inquiryId = `SC${String(totalCount + 1).padStart(3, '0')}`;
      // 3. Save entry to Firestore
      await addDoc(collection(db, "inquiries"), {
        inquiryId,
        ...formData,
        courses,
        photoUrl,
        status: "OPEN",
        createdAt: serverTimestamp()
      });

      alert("Inquiry submitted successfully!");
      
      // Reset Form after successful submission
      setFormData({ 
        studentName: "", fathersName: "", mobileNo: "", address: "", 
        schoolCollege: "", feesDetail: "", batchTimings: "", startDate: "", 
        otherInfo: "", referenceBy: "" 
      });
      setCourses([]);
      setPhoto(null);

    } catch (error) {
      console.error("Error submitting inquiry: ", error);
      alert("Failed to submit inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

 return (
    // Increased top padding (py-20) so the big logo doesn't hit the top of the browser window
    <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 text-gray-900">
      
      {/* Removed overflow-hidden so the logo can float outside the box */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 relative">
        
        {/* Floating Logo Box - Made much bigger (w-40 h-40) and shifted completely above the text */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-16 sm:-top-20 z-10">
          <div className="bg-white p-2.5 rounded-3xl shadow-xl border border-gray-200 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="SITE Logo" 
              className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-2xl" 
            />
          </div>
        </div>
        <br /><br /><br /><br /><br /><br />
        {/* Header Section - Added heavy top padding (pt-28) to push the text safely below the large logo */}
        <div className="bg-blue-800 pt-24 sm:pt-28 pb-8 px-6 text-center text-white rounded-t-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-wide">SITE COMPUTER</h1>
          <p className="text-sm sm:text-base text-blue-200 font-medium">Sharma Institute of Technological Education</p>
        </div>
        

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ... (Keep the rest of your form exactly as it is) ... */}
          <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-6 text-center">
            Inquiry Form
          </h2>

          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name *</label>
              <input required type="text" name="studentName" value={formData.studentName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Father's Name</label>
              <input type="text" name="fathersName" value={formData.fathersName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile No *</label>
              <input required type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">School / College Name</label>
              <input type="text" name="schoolCollege" value={formData.schoolCollege} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea rows={2} name="address" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"></textarea>
          </div>

          {/* Photo Capture */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <label className="block text-sm font-medium text-blue-900 mb-2">Student Photo (Optional)</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer flex items-center gap-2 bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-50 transition">
                <Camera size={20} />
                <span>Click / Upload Photo</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
              </label>
              {photo && <span className="text-sm text-green-600 font-medium">Photo attached: {photo.name}</span>}
            </div>
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Course for Registration *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {courseOptions.map((course) => (
                <label key={course} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={courses.includes(course)} onChange={() => handleCourseChange(course)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4" />
                  <span className="text-sm text-gray-700">{course}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fees Detail</label>
              <input type="text" name="feesDetail" value={formData.feesDetail} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Timings</label>
              <input type="text" name="batchTimings" value={formData.batchTimings} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 border p-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Information</label>
              <textarea rows={2} name="otherInfo" value={formData.otherInfo} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 border p-2"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference By</label>
              <input type="text" name="referenceBy" value={formData.referenceBy} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 border p-2" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-blue-700 text-white p-3 rounded-lg font-semibold hover:bg-blue-800 transition shadow-md disabled:bg-blue-400">
              <Send size={20} /> {loading ? "Submitting..." : "Submit Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}