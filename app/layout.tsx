import type { Metadata } from "next";
import { Inter, Alice } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const alice = Alice({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alice",
});

export const metadata: Metadata = {
  title: "TubeVault — AI-Powered YouTube Search",
  description:
    "Search YouTube channels by meaning. Ask questions, get answers from creator videos with exact timestamps.",
  icons: {
    icon: "/TubeVault_Logo_round.png",
    apple: "/TubeVault_Logo_round.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${alice.variable} antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
