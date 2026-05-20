import { NextResponse } from 'next/server';

export async function GET() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '';
  const key = process.env.GOOGLE_PRIVATE_KEY ?? '';

  return NextResponse.json({
    emailLen: email.length,
    emailFirstBytes: [...email.slice(0, 5)].map(c => c.charCodeAt(0)),
    emailValue: email.slice(0, 50),
    keyLen: key.length,
    keyFirstBytes: [...key.slice(0, 5)].map(c => c.charCodeAt(0)),
    keyFirst30: key.slice(0, 30),
  });
}
