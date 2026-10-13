import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocaleProvider from "@/components/LocaleProvider";
import LanguageToggle from "@/components/LanguageToggle";

export const metadata: Metadata = {
  formatDetection: { telephone: false, date: false, email: false, address: false },
  title: "Pet Pals — Take Care of Your Furry Friends!",
  description:
    "A fun pet shop game for kids! Feed, play with, and cuddle your 4 adorable pets. Keep them happy and earn the Great Pet Keeper award!",
  openGraph: {
    title: "Pet Pals — Take Care of Your Furry Friends!",
    description:
      "A fun pet shop game for kids! Feed, play with, and cuddle your 4 adorable pets.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="#"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen" style={{ background: "var(--background)" }}>
        <LocaleProvider>
          <LanguageToggle />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}