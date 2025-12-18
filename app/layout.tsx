import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 기술 인터뷰 | AI Interview",
  description: "AI 기반 기술 면접 시뮬레이션 프로그램",
  keywords: ["AI", "기술 면접", "인터뷰", "개발자 면접"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 min-h-screen`}
      >
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
