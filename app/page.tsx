"use client";

import { useState } from "react";
import { Camera, Send } from "lucide-react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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

      // 2. Generate custom ID format (e.g., SC + random 6 digits)
      const inquiryId = `SC${Math.floor(100000 + Math.random() * 900000)}`;

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header Section */}
        <div className="bg-blue-800 p-6 text-center text-white">
          <h1 className="text-3xl font-bold mb-2">SITE COMPUTER</h1>
          <p className="text-sm text-blue-200">Sharma Institute of Technological Education</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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