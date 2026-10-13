"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { navLinks, BRAND } from "@/lib/data";

export default function Footer() {
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
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="w-full mt-12 py-8 px-4"
      style={{
        background: "var(--card)",
        borderTop: "2px solid var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <span
            className="font-fredoka text-xl font-bold"
            style={{ color: "var(--primary)" }}
          >
            {BRAND.name}
          </span>
        </div>

        <nav className="flex flex-wrap justify-center gap-4">
          {navLinks.map((link) => {
            const isAnchor = link.href.startsWith("#");
            const resolvedHref = isAnchor
              ? pathname === "/"
                ? link.href
                : "/" + link.href
              : link.href;

            return (
              <Link
                key={link.key}
                href={resolvedHref}
                onClick={
                  isAnchor
                    ? (e) => handleAnchorClick(e, link.href)
                    : undefined
                }
                className="font-nunito text-sm transition-colors duration-200"
                style={{ color: "var(--muted-foreground)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--primary)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "var(--muted-foreground)";
                }}
              >
                {navT[link.key] ?? link.label}
              </Link>
            );
          })}
        </nav>

        <p
          className="font-nunito text-sm text-center"
          style={{ color: "var(--muted-foreground)" }}
        >
          Made with 💛 for little pet lovers everywhere!
        </p>
      </div>
    </motion.footer>
  );
}