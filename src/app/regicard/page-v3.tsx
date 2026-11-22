'use client';

import React, { useState } from 'react';

interface NURegData {
  studentName: string;
  fatherName: string;
  motherName: string;
  registrationNo: string;
  rollNo: string;
  session: string;
  collegeCode: string;
  collegeName: string;
  degreeName: string;
  subjectName: string;
  photoUrl: string;
}

export default function NURegistrationCardPage() {
  const [formData, setFormData] = useState<NURegData>({
    studentName: '',
    fatherName: '',
    motherName: '',
    registrationNo: '',
    rollNo: '',
    session: '2024-2025',
    collegeCode: '',
    collegeName: '',
    degreeName: 'B.Sc. (Honours)',
    subjectName: '',
    photoUrl: '',
  });

  const [generated, setGenerated] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerated(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        padding: '2rem 1rem',
        fontFamily: "'Times New Roman', Georgia, serif",
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #nu-reg-card, #nu-reg-card * {
            visibility: visible;
          }
          #nu-reg-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {!generated ? (
        <div
          style={{
            maxWidth: '640px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            National University Registration Card Generator
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
            Fill in student details to generate the NU Registration Card.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Student&apos;s Name *
              </label>
              <input
                type="text"
                name="studentName"
                required
                value={formData.studentName}
                onChange={handleChange}
                placeholder="e.g. MD. HASAN MAHMUD"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Father&apos;s Name *
              </label>
              <input
                type="text"
                name="fatherName"
                required
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Father's Name"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Mother&apos;s Name *
              </label>
              <input
                type="text"
                name="motherName"
                required
                value={formData.motherName}
                onChange={handleChange}
                placeholder="Mother's Name"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Registration No. *
              </label>
              <input
                type="text"
                name="registrationNo"
                required
                value={formData.registrationNo}
                onChange={handleChange}
                placeholder="e.g. 24228012345"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Academic Session *
              </label>
              <input
                type="text"
                name="session"
                required
                value={formData.session}
                onChange={handleChange}
                placeholder="e.g. 2024-2025"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                College Code *
              </label>
              <input
                type="text"
                name="collegeCode"
                required
                value={formData.collegeCode}
                onChange={handleChange}
                placeholder="e.g. 1101"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Class Roll No.
              </label>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="e.g. 1025"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                College Name *
              </label>
              <input
                type="text"
                name="collegeName"
                required
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="e.g. GOVT. BROJOMOHUN COLLEGE, BARISHAL"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Degree / Program *
              </label>
              <select
                name="degreeName"
                value={formData.degreeName}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
              >
                <option value="B.A. (Honours)">B.A. (Honours)</option>
                <option value="B.S.S. (Honours)">B.S.S. (Honours)</option>
                <option value="B.B.A. (Honours)">B.B.A. (Honours)</option>
                <option value="B.Sc. (Honours)">B.Sc. (Honours)</option>
                <option value="Degree (Pass)">Degree (Pass)</option>
                <option value="Masters">Masters</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Subject / Department *
              </label>
              <input
                type="text"
                name="subjectName"
                required
                value={formData.subjectName}
                onChange={handleChange}
                placeholder="e.g. COMPUTER SCIENCE & ENGINEERING"
                style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                Student Photo (Passport Size)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="submit"
              style={{
                gridColumn: '1 / -1',
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#166534',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Generate NU Registration Card
            </button>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          {/* Printable NU Registration Card */}
          <div
            id="nu-reg-card"
            style={{
              backgroundColor: '#ffffff',
              border: '3px double #1e293b',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              color: '#000000',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 'bold', letterSpacing: '0.04em' }}>
                NATIONAL UNIVERSITY
              </h2>
              <p style={{ margin: '0.2rem 0', fontSize: '0.95rem', fontWeight: 'bold' }}>
                Gazipur-1704, Bangladesh
              </p>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.25rem 1.25rem',
                  border: '1.5px solid #000',
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  letterSpacing: '0.05em',
                }}
              >
                REGISTRATION CARD
              </div>
            </div>

            {/* Top Info + Photo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', lineHeight: 1.75 }}>
                <tbody>
                  <tr>
                    <td style={{ width: '190px', fontWeight: 'bold' }}>Registration No.</td>
                    <td style={{ width: '15px' }}>:</td>
                    <td style={{ fontWeight: 'bold', letterSpacing: '0.06em' }}>{formData.registrationNo}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Academic Session</td>
                    <td>:</td>
                    <td>{formData.session}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Student&apos;s Name</td>
                    <td>:</td>
                    <td style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{formData.studentName}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Father&apos;s Name</td>
                    <td>:</td>
                    <td style={{ textTransform: 'uppercase' }}>{formData.fatherName}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Mother&apos;s Name</td>
                    <td>:</td>
                    <td style={{ textTransform: 'uppercase' }}>{formData.motherName}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>College Code &amp; Name</td>
                    <td>:</td>
                    <td style={{ textTransform: 'uppercase' }}>
                      [{formData.collegeCode}] {formData.collegeName}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Degree / Program</td>
                    <td>:</td>
                    <td>{formData.degreeName}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 'bold' }}>Subject</td>
                    <td>:</td>
                    <td style={{ textTransform: 'uppercase' }}>{formData.subjectName}</td>
                  </tr>
                  {formData.rollNo && (
                    <tr>
                      <td style={{ fontWeight: 'bold' }}>Class Roll No.</td>
                      <td>:</td>
                      <td>{formData.rollNo}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Photo Box */}
              <div
                style={{
                  width: '130px',
                  height: '155px',
                  border: '1.5px solid #000',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: '#f8fafc',
                }}
              >
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Student"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '0.5rem' }}>
                    Affix Passport Size Photo
                  </span>
                )}
              </div>
            </div>

            {/* Signatures */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '3.5rem',
                paddingTop: '0.5rem',
                fontSize: '0.88rem',
                textAlign: 'center',
              }}
            >
              <div style={{ borderTop: '1px solid #000', width: '180px', paddingTop: '0.3rem' }}>
                Signature of Student
              </div>
              <div style={{ borderTop: '1px solid #000', width: '200px', paddingTop: '0.3rem' }}>
                Signature of Principal / Seal
              </div>
              <div style={{ borderTop: '1px solid #000', width: '190px', paddingTop: '0.3rem' }}>
                Controller of Examinations
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print" style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#166534',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={() => setGenerated(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: '#e2e8f0',
                color: '#0f172a',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              Edit Information
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
