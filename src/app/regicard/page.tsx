"use client";

import React, { useState } from "react";

interface FormState {
  regNo: string;
  session: string;
  validSession: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  collegeCode: string;
  collegeName: string;
  subjectName: string;
  subjectCode: string;
  status: string;
  email: string;
  slNo: string;
  generatedOn: string;
  regTimestamp: string;
  photoUrl: string;
  principalSig: string;
  registrarSig: string;
}

interface CardData extends FormState {
  regDigits: string[];
  validSessionBn: string;
  qrUrl: string;
}

const INITIAL_FORM: FormState = {
  regNo: "21223052045",
  session: "2021-2022",
  validSession: "2027-2028",
  studentName: "MD. HASAN MAHMUD",
  fatherName: "MD. NURNOBI",
  motherName: "RUNU BEGUM",
  collegeCode: "1101",
  collegeName: "GOVERNMENT BROJOMOHUN COLLEGE, BARISHAL",
  subjectName: "MARKETING",
  subjectCode: "23",
  status: "Regular",
  email: "21223052045@nu.ac.bd",
  slNo: "3121379",
  generatedOn: "Saturday 6th of March 2023",
  regTimestamp: "03.07.2022 13:10",
  photoUrl:
    "https://proxy.duckduckgo.com/iu/?u=http://103.113.202.33/photos/hons/2021-2022/3121379.jpg",
  principalSig: "https://i.ibb.co.com/Gv03Zfyr/20250209-091057.png",
  registrarSig: "https://i.ibb.co.com/vDfmJ7B/nu-sign.png",
};

export default function RegiCardPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ইউজার ছবি বা অধ্যক্ষের সিল আপলোড (Base64 কনভার্শন)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "photoUrl" | "principalSig"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, [field]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/regicard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", ...form }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "কার্ড তৈরি করা সম্ভব হয়নি।");
      } else {
        setCard(json.card);
      }
    } catch {
      setError("সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Tiro+Bangla:wght@400;700&display=swap");

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        body {
          margin: 0;
          background: #e5e7eb;
          font-family: "Roboto", Arial, Helvetica, sans-serif;
          color: #000;
        }

        /* A4 Print Configuration */
        @page {
          size: A4 portrait;
          margin: 8mm;
        }

        @media print {
          html,
          body {
            width: 210mm;
            height: 297mm;
            background: #fff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .a4-sheet {
            width: 100% !important;
            min-height: auto !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {!card ? (
        /* ================= পেজ ১: ইনপুট ফর্ম ================= */
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-[#0f294a] text-white px-7 py-5 flex items-center gap-4">
              <img
                src="https://i.ibb.co.com/h2FGprb/Nu-logo.png"
                alt="NU Logo"
                className="w-14 h-14 bg-white rounded-full p-1"
              />
              <div>
                <h1 className="text-xl font-bold m-0">
                  NU Registration Card Generator (2021-2022 Session)
                </h1>
                <p className="text-xs text-slate-200 mt-1">
                  শিক্ষার্থীর তথ্য, ইমেইল এবং ছবি আপলোড করে A4 সাইজের রেজিস্ট্রেশন কার্ড তৈরি করুন
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* ১. রেজিস্ট্রেশন ও সেশন */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f294a] border-b-2 border-slate-200 pb-1.5 mb-4">
                  1. Registration &amp; Session Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Registration No (11 Digits)
                    </label>
                    <input
                      type="text"
                      name="regNo"
                      maxLength={11}
                      value={form.regNo}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Academic Session
                    </label>
                    <input
                      type="text"
                      name="session"
                      value={form.session}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Valid Up To Session
                    </label>
                    <input
                      type="text"
                      name="validSession"
                      value={form.validSession}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ২. শিক্ষার্থীর ব্যক্তিগত তথ্য */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f294a] border-b-2 border-slate-200 pb-1.5 mb-4">
                  2. Student Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Student&apos;s Name
                    </label>
                    <input
                      type="text"
                      name="studentName"
                      value={form.studentName}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Father&apos;s Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={form.fatherName}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Mother&apos;s Name
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={form.motherName}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address (21-22 Session Field)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Irregular">Irregular</option>
                      <option value="Improvement">Improvement</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ৩. কলেজ ও বিষয়ের তথ্য */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f294a] border-b-2 border-slate-200 pb-1.5 mb-4">
                  3. College &amp; Subject Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      College Code
                    </label>
                    <input
                      type="text"
                      name="collegeCode"
                      value={form.collegeCode}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      name="subjectName"
                      value={form.subjectName}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Subject Code
                    </label>
                    <input
                      type="text"
                      name="subjectCode"
                      value={form.subjectCode}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    College Name
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={form.collegeName}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              {/* ৪. ছবি ও অধ্যক্ষের স্বাক্ষর আপলোড */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f294a] border-b-2 border-slate-200 pb-1.5 mb-4">
                  4. Student Photo &amp; Principal Seal Upload
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-slate-300 bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                    <img
                      src={form.photoUrl}
                      alt="Student Preview"
                      className="w-16 h-20 object-cover border border-slate-300 rounded bg-white shrink-0"
                    />
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      <label className="block text-xs font-semibold text-slate-700">
                        Upload Student Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "photoUrl")}
                        className="text-xs w-full"
                      />
                      <input
                        type="text"
                        name="photoUrl"
                        value={form.photoUrl}
                        onChange={handleChange}
                        placeholder="Or paste photo URL"
                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                    <img
                      src={form.principalSig}
                      alt="Principal Seal Preview"
                      className="w-16 h-20 object-contain border border-slate-300 rounded bg-white shrink-0"
                    />
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      <label className="block text-xs font-semibold text-slate-700">
                        Upload Principal Seal &amp; Sign
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "principalSig")}
                        className="text-xs w-full"
                      />
                      <input
                        type="text"
                        name="principalSig"
                        value={form.principalSig}
                        onChange={handleChange}
                        placeholder="Or paste signature URL"
                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ৫. সিরিয়াল ও ভেরিফিকেশন */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0f294a] border-b-2 border-slate-200 pb-1.5 mb-4">
                  5. Serial &amp; Verification Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Sl No
                    </label>
                    <input
                      type="text"
                      name="slNo"
                      value={form.slNo}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Registrar Timestamp
                    </label>
                    <input
                      type="text"
                      name="regTimestamp"
                      value={form.regTimestamp}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Generated On Date
                    </label>
                    <input
                      type="text"
                      name="generatedOn"
                      value={form.generatedOn}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setForm(INITIAL_FORM)}
                  className="px-5 py-2.5 rounded-md bg-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-300"
                >
                  Reset Demo
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-md bg-[#0f294a] text-white text-sm font-medium hover:bg-[#1e3a8a] disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate Registration Card →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* ================= পেজ ২: A4 রেজিস্ট্রেশন কার্ড ================= */
        <div className="py-5 px-2">
          {/* টপ অ্যাকশন বার (প্রিন্টে লুকানো থাকবে) */}
          <div className="no-print w-[210mm] mx-auto mb-3.5 flex justify-between items-center bg-[#0f294a] text-white px-5 py-2.5 rounded-lg">
            <span className="text-sm">
              <strong>A4 Print Ready</strong> (Session {card.session})
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setCard(null)}
                className="bg-white text-[#0f294a] px-3.5 py-1.5 rounded font-bold text-xs hover:bg-slate-200"
              >
                ← Edit Information
              </button>
              <button
                onClick={() => window.print()}
                className="bg-white text-[#0f294a] px-3.5 py-1.5 rounded font-bold text-xs hover:bg-slate-200"
              >
                Print A4 / Save PDF
              </button>
            </div>
          </div>

          {/* A4 পেজ শিট */}
          <div className="a4-sheet w-[210mm] min-h-[297mm] mx-auto bg-white p-[10mm_12mm] shadow-md">
            <div
              className="w-full border-[3px] border-double border-black rounded-[14px] px-5 pt-4 pb-5 relative bg-white overflow-hidden"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              {/* ব্যাকগ্রাউন্ড ওয়াটারমার্ক (সঠিক পজিশনে) */}
              <img
                src="https://i.ibb.co.com/cCHGG9k/nu-logo-hasan.png"
                alt="NU Watermark"
                className="absolute top-[215px] left-1/2 -translate-x-1/2 w-[340px] opacity-[0.13] z-[1] pointer-events-none"
              />

              {/* হেডার: QR কোড, লোগো ও শিক্ষার্থীর ছবি */}
              <div className="flex justify-between items-start relative z-[2]">
                <div className="w-[142px] h-[142px] pt-0.5">
                  <img
                    src={card.qrUrl}
                    alt="QR Code"
                    className="w-[140px] h-[140px] block"
                  />
                </div>

                <div className="text-center flex-1 px-2.5">
                  <img
                    src="https://i.ibb.co.com/h2FGprb/Nu-logo.png"
                    alt="NU Logo"
                    className="w-[70px] h-auto mx-auto mb-1"
                  />
                  <h1 className="text-[20px] font-bold my-0.5 tracking-[0.3px] text-black">
                    NATIONAL UNIVERSITY
                  </h1>
                  <div className="text-[14.5px] font-medium my-0.5">
                    Gazipur 1704, Bangladesh
                  </div>
                  <div className="text-[14px] font-semibold mt-0.5 mb-1.5">
                    BACHELOR OF HONOURS DEGREE
                  </div>
                  <div className="inline-block border-[1.5px] border-black rounded-[20px] px-[18px] py-[3px] text-[14.5px] font-bold">
                    Registration Card
                  </div>
                </div>

                <div className="w-[128px] h-[152px] border border-[#444] p-0.5 bg-white">
                  <img
                    src={card.photoUrl}
                    alt="Student Photo"
                    className="w-full h-full object-cover block"
                  />
                </div>
              </div>

              {/* রেজিস্ট্রেশন নম্বর ও সেশন */}
              <div className="flex justify-between items-center mt-3.5 mb-3 relative z-[2]">
                <div className="flex items-center">
                  <strong className="text-[13.5px] mr-1.5">
                    Registration No:
                  </strong>
                  <div className="inline-flex border-[1.5px] border-black bg-white">
                    {card.regDigits.map((digit, idx) => (
                      <span
                        key={idx}
                        className="w-[23px] h-[24px] leading-[22px] text-center font-bold text-[13.5px] border-r border-black last:border-r-0"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <strong className="text-[13.5px] mr-2">
                    Academic Session:
                  </strong>
                  <div className="border-[1.5px] border-black px-3.5 py-[3px] font-bold text-[13.5px] bg-white">
                    {card.session}
                  </div>
                </div>
              </div>

              {/* তথ্য টেবিল */}
              <table className="w-full border-collapse border-2 border-double border-black relative z-[2] bg-transparent text-[13.5px]">
                <tbody>
                  <tr>
                    <th className="w-[22%] border border-black px-2 py-[4.5px] text-left font-normal">
                      Student&apos;s Name
                    </th>
                    <td className="w-[78%] border border-black px-2 py-[4.5px] text-left">
                      {card.studentName}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-black px-2 py-[4.5px] text-left font-normal">
                      Father&apos;s Name
                    </th>
                    <td className="border border-black px-2 py-[4.5px] text-left">
                      {card.fatherName}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-black px-2 py-[4.5px] text-left font-normal">
                      Mother&apos;s Name
                    </th>
                    <td className="border border-black px-2 py-[4.5px] text-left">
                      {card.motherName}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-black px-2 py-[4.5px] text-left font-normal">
                      College Code
                    </th>
                    <td className="border border-black px-2 py-[4.5px] text-left">
                      {card.collegeCode}
                    </td>
                  </tr>
                  <tr>
                    <th className="h-[42px] border border-black px-2 py-[4.5px] text-left align-top font-normal">
                      College Name
                    </th>
                    <td className="h-[42px] border border-black px-2 py-[4.5px] text-left align-top">
                      {card.collegeName}
                    </td>
                  </tr>
                  <tr>
                    <th className="h-[34px] border border-black px-2 py-[4.5px] text-left align-top font-normal">
                      Subject Name &amp;
                      <br />
                      Code
                    </th>
                    <td className="h-[34px] border border-black px-2 py-[4.5px] text-left align-top">
                      {card.subjectName} - {card.subjectCode}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-black px-2 py-[4.5px] text-left font-normal">
                      Status
                    </th>
                    <td className="border border-black px-2 py-[4.5px] text-left">
                      {card.status}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-black px-2 py-[4.5px] text-left font-normal">
                      Email Address
                    </th>
                    <td className="border border-black px-2 py-[4.5px] text-left">
                      {card.email}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* স্বাক্ষর অংশ */}
              <table className="w-full border-collapse border-2 border-double border-black mt-2.5 relative z-[2] bg-transparent">
                <tbody>
                  <tr>
                    <td className="w-1/3 h-[78px] border-x border-black text-center align-middle p-1" />
                    <td className="w-1/3 h-[78px] border-x border-black text-center align-middle p-1">
                      {card.principalSig && (
                        <img
                          src={card.principalSig}
                          alt="Principal Seal"
                          className="max-w-[180px] max-h-[68px] object-contain mx-auto"
                        />
                      )}
                    </td>
                    <td className="w-1/3 h-[78px] border-x border-black text-center align-middle p-1">
                      {card.registrarSig && (
                        <img
                          src={card.registrarSig}
                          alt="Registrar Sign"
                          className="max-w-[180px] max-h-[68px] object-contain mx-auto"
                        />
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-1/3 border border-black text-center text-[12.5px] font-bold py-1">
                      Student&apos;s Full Signature
                    </td>
                    <td className="w-1/3 border border-black text-center text-[12.5px] font-bold py-1">
                      Seal and Signature of Principal
                    </td>
                    <td className="w-1/3 border border-black text-center text-[12.5px] font-bold py-1">
                      Signature of Registrar
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* বাংলা ও ইংরেজি নির্দেশাবলি */}
              <div className="mt-3 relative z-[2]">
                <div
                  className="text-[14px] font-bold mb-0.5"
                  style={{ fontFamily: "'Tiro Bangla', serif" }}
                >
                  বিঃদ্রঃ
                </div>
                <ol
                  className="pl-5 m-0 mb-1.5 text-[13px] leading-[1.4] list-none"
                  style={{ fontFamily: "'Tiro Bangla', serif" }}
                >
                  <li>১ । ছাত্র/ছাত্রী পূর্ণ স্বাক্ষর করবে।</li>
                  <li>
                    ২ । রেজিষ্ট্রেশন কার্ডে শিক্ষার্থীর ছবির উপর সংশ্লিষ্ট কলেজের অধ্যক্ষ
                    সত্যায়িত করবেন।
                  </li>
                  <li>
                    ৩ । এই রেজিষ্ট্রেশনে প্রদত্ত তথ্যে কোন ভুলত্রুটি পরিলক্ষিত হলে তা
                    সংশোধন কিংবা বাতিলের ক্ষমতা বিশ্ববিদ্যালয় কর্তৃপক্ষ সংরক্ষণ করে।
                  </li>
                  <li>
                    ৪ । রেজিষ্ট্রেশন কার্ডের মেয়াদ উত্তীর্ণের সেশন{" "}
                    {card.validSessionBn}।
                  </li>
                </ol>

                <div className="text-[13px] font-bold mt-1 mb-0.5">NB:</div>
                <ol
                  className="pl-8 m-0 mb-2.5 text-[13.5px] leading-[1.3] list-decimal"
                  style={{ fontFamily: "'Times New Roman', Times, serif" }}
                >
                  <li>A Student shall sign his/her full name.</li>
                  <li>
                    The Principal will attest the photograph in the Registration
                    card.
                  </li>
                  <li>
                    The National University authority reserves the right to
                    correct/cancel the card if any error is found after the
                    registration.
                  </li>
                  <li>
                    This Registration card is valid up to session{" "}
                    {card.validSession}.
                  </li>
                </ol>
              </div>

              {/* নিচের সিরিয়াল ও ভেরিফিকেশন */}
              <div
                className="flex justify-between items-end mt-2.5 relative z-[2] text-[13px] leading-[1.35]"
                style={{ fontFamily: "'Times New Roman', Times, serif" }}
              >
                <div>
                  <p className="m-0">Sl No: {card.slNo}</p>
                  <p className="m-0">
                    Note:This document contains digital signature of Registrar,
                    National University.
                  </p>
                  <p className="m-0">
                    For verification: http://www.nu.edu.bd/admissions/regicard
                  </p>
                </div>
                <div className="text-center pr-3 text-[12px] leading-[1.9]">
                  REGISTRAR
                  <br />
                  {card.regTimestamp}
                </div>
              </div>
            </div>

            {/* বর্ডারের বাইরে নিচের Generated তারিখ */}
            <div className="mt-1.5 pl-1 text-[12px] text-[#111]">
              Generated on: {card.generatedOn}
            </div>
          </div>
        </div>
      )}
    </>
  );
}