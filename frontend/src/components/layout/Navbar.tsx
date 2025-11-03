"use client"
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Building2, FileCheck, ShieldCheck, LogOut, User, Home, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/icp/auth";
import { useRouter } from "next/navigation";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/verify", label: "Verify", icon: ShieldCheck },
    { href: "/company-management", label: "Companies", icon: Building2 },
    { href: "/generate-proof", label: "Generate", icon: FileCheck },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    return (
        <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image 
                            src="/svg/logoipsum.svg" 
                            alt="Proofly Logo" 
                            width={40} 
                            height={40}
                            className="w-10 h-10 transition-transform group-hover:scale-105"
                        />
                        <div className="flex flex-col">
                            <span className="font-cal text-xl text-gray-900 leading-none">Proofly</span>
                            <span className="font-matter text-xs text-gray-500 leading-none">Verification System</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg font-matter text-sm transition-all duration-200",
                                        isActive
                                            ? "bg-gray-900 text-white shadow-md"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side - Profile & Logout */}
                    <div className="flex items-center gap-3">
                        {/* Profile Button - Hidden on mobile */}
                        <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <span className="hidden lg:block font-matter text-sm text-gray-700 font-medium">Account</span>
                        </button>
                        
                        {/* Logout Button - Hidden on mobile */}
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="hidden sm:flex gap-2 font-matter !bg-white !text-gray-700 border-2 border-gray-300 hover:!bg-red-600 hover:!text-white hover:!border-red-600 transition-all duration-200 active:scale-95"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </Button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg font-matter text-sm transition-all duration-200",
                                            isActive
                                                ? "bg-gray-900 text-white shadow-md"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                            
                            {/* Mobile Profile & Logout */}
                            <div className="flex flex-col gap-2 mt-2 pt-4 border-t">
                                <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-600">
                                    <User className="w-5 h-5" />
                                    <span className="font-matter text-sm">Account</span>
                                </button>
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 text-red-600">
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-matter text-sm">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

