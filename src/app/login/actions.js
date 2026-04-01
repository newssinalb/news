"use server";

import { cookies } from 'next/headers';

export async function loginAdmin(password) {
  // Şifre sabit olarak 123456 yapıldı
  const correctPassword = '123456';

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
