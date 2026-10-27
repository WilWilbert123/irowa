// src/components/layout/navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Bell, Menu, X, PlusCircle } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { useVisitor } from "@/contexts/visitor-context";
import { useNotifications } from "@/contexts/notification-context";

interface NavbarProps {
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

export function Navbar({ onSearchChange, searchValue = "", showSearch = true }: NavbarProps) {
  const router = useRouter();
  const { visitor } = useVisitor();
  const { unreadCount } = useNotifications();
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(localSearch);
    } else {
      router.push(`/water?q=${encodeURIComponent(localSearch)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shrink-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-3">
        {/* Brand */}
        <Link href="/home" className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Image
              src="/images/irowa-logo.svg"
              alt="IroWa Logo"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            Iro<span className="text-blue-600 dark:text-blue-400">Wa</span>
          </span>
        </Link>

        {/* Search Bar - Mockup 1 & 5 */}
        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                placeholder="Search water resources, locations..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
              />
            </div>
          </form>
        )}

        {/* Actions Right */}
        <div className="flex items-center gap-3">
          {/* Submit Water Source Button */}
          <Link
            href="/submit-water"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Submit Water Point</span>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications Link */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          {showSearch && (
            <form onSubmit={handleSearchSubmit} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    if (onSearchChange) onSearchChange(e.target.value);
                  }}
                  placeholder="Search water resources..."
                  className="w-full h-9 pl-9 pr-3 rounded-full bg-slate-100 dark:bg-slate-800 text-sm"
                />
              </div>
            </form>
          )}
          <Link
            href="/submit-water"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <PlusCircle className="h-4 w-4 text-blue-500" />
            <span>Submit a Water Source</span>
          </Link>
          <Link
            href="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Saved Locations</span>
          </Link>
          <Link
            href="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Profile & Preferences</span>
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>About IroWa</span>
          </Link>
        </div>
      )}
    </header>
  );
}
