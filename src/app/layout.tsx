import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const ppNeueMontrealBold = localFont({
  src: "../../public/OTF/PPNeueMontreal-Bold.otf",
  variable: "--font-pp-neue-montreal-bold",
  display: "swap",
});

const ppNeueMontrealThin = localFont({
  src: "../../public/OTF/PPNeueMontreal-Thin.otf",
  variable: "--font-pp-neue-montreal-thin",
  display: "swap",
});


export const metadata: Metadata = {
  title: "ishaanawasthi! (.com)",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ppNeueMontrealBold.variable} ${ppNeueMontrealThin.variable}`}>
      <body>{children}</body>
    </html>
  );
}
