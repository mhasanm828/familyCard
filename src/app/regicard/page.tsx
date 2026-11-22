'use client';

import React, { useState } from 'react';

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  role: string;
}

export default function RegistrationCardPage() {
  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    role: 'Attendee',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      organization: '',
      role: 'Attendee',
    });
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          width: '100%',
          maxWidth: '440px',
          padding: '2rem',
        }}
      >
        {!submitted ? (
          <>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: '#111827' }}>
              Event Registration
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              Fill in your details below to generate your registration card.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+880 1XXX-XXXXXX"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Organization / Institution
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="Company or University"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  Pass Type
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.95rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="Attendee">Attendee</option>
                  <option value="Speaker">Speaker</option>
                  <option value="VIP">VIP</option>
                  <option value="Student">Student</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Generate Registration Card
              </button>
            </form>
          </>
        ) : (
          <div>
            <div
              style={{
                border: '2px solid #2563eb',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>REGISTRATION CARD</span>
                <span
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#2563eb',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                  }}
                >
                  {formData.role.toUpperCase()}
                </span>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc' }}>
                <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.5rem 0', color: '#0f172a' }}>
                  {formData.fullName}
                </h2>
                {formData.organization && (
                  <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#475569' }}>
                    {formData.organization}
                  </p>
                )}
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.75rem', fontSize: '0.85rem', color: '#334155' }}>
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  {formData.phone && (
                    <p style={{ margin: '0.25rem 0' }}>
                      <strong>Phone:</strong> {formData.phone}
                    </p>
                  )}
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>ID:</strong> #REG-{Math.floor(100000 + Math.random() * 900000)}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '0.65rem',
                backgroundColor: '#e5e7eb',
                color: '#1f2937',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create Another Card
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
