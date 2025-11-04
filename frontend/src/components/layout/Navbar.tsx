"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Building2, FileCheck, ShieldCheck, User, Home, Menu, X, CopyIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useICPActor } from "@/hooks/useICPActor";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/verify", label: "Verify", icon: ShieldCheck },
    { href: "/company-management", label: "Companies", icon: Building2 },
    { href: "/generate-proof", label: "Generate", icon: FileCheck },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [accountName, setAccountName] = useState<string>("Account");
    const [principal, setPrincipal] = useState<string>("");
    const [copied, setCopied] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const { actor, loading: connecting } = useICPActor();

    // Fetch account name from backend using actor
    useEffect(() => {
        const fetchAccountName = async () => {
            if (!actor || connecting) {
                return;
            }

            try {
                // Fetch account name
                const result = await actor.get_my_name();
                console.log("Result:", result);
                if (result && typeof result === 'object' && 'Ok' in result) {
                    setAccountName(result.Ok as string);
                    console.log("Account name:", result.Ok);
                } else if (result && typeof result === 'object' && 'Err' in result) {
                    console.log("Account name error:", result.Err);
                    // If name not set or error, keep "Account" as fallback
                    setAccountName("Account");
                }
            } catch (error) {
                console.error("Failed to fetch account name:", error);
                setAccountName("Account");
            }
        };

        fetchAccountName();
    }, [actor, connecting]);

    // Fetch principal when popover opens
    useEffect(() => {
        const fetchPrincipal = async () => {
            if (!actor || connecting || !isPopoverOpen) {
                return;
            }

            try {
                const principalResult = await actor.get_principal();
                setPrincipal(principalResult || "");
            } catch (error) {
                console.error("Failed to fetch principal:", error);
                setPrincipal("");
            }
        };

        fetchPrincipal();
    }, [actor, connecting, isPopoverOpen]);

    // Handle copy principal
    const handleCopyPrincipal = async () => {
        if (!principal) return;
        
        try {
            await navigator.clipboard.writeText(principal);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy principal:", error);
        }
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

                    {/* Right side - Profile */}
                    <div className="flex items-center gap-3">
                        {/* Profile Button with Popover - Hidden on mobile */}
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverTrigger asChild>
                                <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="hidden lg:block font-matter text-sm text-gray-700 font-medium">{accountName}</span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" align="end">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-1">Principal ID</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-xs font-mono bg-gray-50 px-2 py-1.5 rounded border break-all">
                                                {principal || "Loading..."}
                                            </code>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCopyPrincipal}
                                                className="shrink-0"
                                                disabled={!principal || copied}
                                            >
                                                {copied ? (
                                                    <CheckIcon className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <CopyIcon className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        
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
                            
                            {/* Mobile Profile */}
                            <div className="flex flex-col gap-2 mt-2 pt-4 border-t">
                                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-600">
                                            <User className="w-5 h-5" />
                                            <span className="font-matter text-sm">{accountName}</span>
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[calc(100vw-3rem)] p-4" align="start">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 mb-1">Principal ID</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 text-xs font-mono bg-gray-50 px-2 py-1.5 rounded border break-all">
                                                        {principal || "Loading..."}
                                                    </code>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={handleCopyPrincipal}
                                                        className="shrink-0"
                                                        disabled={!principal || copied}
                                                    >
                                                        {copied ? (
                                                            <CheckIcon className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <CopyIcon className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
