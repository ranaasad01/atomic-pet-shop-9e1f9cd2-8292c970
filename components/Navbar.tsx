"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { navLinks } from "@/lib/data";
import { BRAND } from "@/lib/data";

export default function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const navT = t.raw("nav") as Record<string, string>;

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (pathname === "/") {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
      style={{
        background: "var(--card)",
        borderBottom: "2px solid var(--border)",
        boxShadow: "var(--shadow-brand)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.span
            className="text-3xl"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
            transition={{ duration: 0.4 }}
          >
            🐾
          </motion.span>
          <span
            className="font-fredoka text-2xl font-bold"
            style={{ color: "var(--primary)" }}
          >
            {BRAND.name}
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {navLinks.map((link) => {
            const isAnchor = link.href.startsWith("#");
            const resolvedHref = isAnchor
              ? pathname === "/"
                ? link.href
                : "/" + link.href
              : link.href;

            return (
              <motion.div
                key={link.key}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={resolvedHref}
                  onClick={
                    isAnchor
                      ? (e) => handleAnchorClick(e, link.href)
                      : undefined
                  }
                  className="px-4 py-2 rounded-full font-nunito font-600 text-base transition-all duration-200"
                  style={{
                    color: "var(--foreground)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "var(--background)";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      "var(--foreground)";
                  }}
                >
                  {navT[link.key] ?? link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
}