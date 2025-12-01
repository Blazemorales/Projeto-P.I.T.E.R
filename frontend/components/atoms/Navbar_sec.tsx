"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChartNoAxesCombined,  Award } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}

const navItems: NavItem[] = [
  { label: "Pesquisa", href: "/", icon: Search },
  { label: "Comparação", href: "/compare", icon: ChartNoAxesCombined },
  { label: "Ranking", href: "/ranking", icon: Award },
];

const Navbar_sec = () => {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <main className="w-full mt-50 z-50 bg-transparent backdrop-blur-xl mb-5">
      <div className="container mx-auto flex align-center justify-center py-3 px-6">
        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-2">
            {navItems.map(({ label, href, icon: Icon, external }) => {
              const active = isActive(href);
              const baseStyle =
                "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium";
              const activeStyle = active
                ? "bg-[#022C3C]/70 text-[#E1E5F2] shadow"
                : "text-gray-800 hover:bg-[#022C3C]/80 hover:text-[#E1E5F2]";
              const linkClass = `${baseStyle} ${activeStyle}`;

              return (
                <li key={label}>
                  {external ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      <Icon size={18} />
                      <span className="hidden sm:inline">{label}</span>
                    </a>
                  ) : (
                    <Link href={href} className={linkClass}>
                      <Icon size={18} />
                      <span className="hidden sm:inline">{label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </main>
  );
};

export default Navbar_sec;
