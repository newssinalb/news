"use server";

import { cookies } from 'next/headers';

export async function loginAdmin(password) {
  // Password is stored securely in .env.local — never exposed to the browser
  const correctPassword = process.env.ADMIN_PASSWORD;
  if (!correctPassword) return false; // fail safely if env var is missing

  if (password === correctPassword) {
    // 1 günlük bir giriş çerezi (cookie) oluşturuyoruz
    (await cookies()).set('auth-token', 'admin-logged-in', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 gün (saniye cinsinden)
      path: '/'
    });
    return true;
  }
  
  return false;
}
