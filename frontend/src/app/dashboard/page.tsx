"use client"
import { motion } from "motion/react";
import Link from "next/link";
import BorderLayout from "../../components/layout/borderLayout";
import { Button } from "../../components/ui/button";
import { LoadingSwap } from "../../components/ui/loading-swap";
import CrossSVG from "../../components/svg/CrossSVG";
import { FileCheck, Building2, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
    return (
        <BorderLayout id="dashboard" className="mt-3 border-t">
            <CrossSVG className="absolute -left-3 -top-3" />
            <CrossSVG className="absolute -right-3 -top-3" />
            
            <div className="seciton-py">
                {/* Navbar */}
                <nav className="border-b bg-white px-6 py-4 -mx-6 -mt-6 mb-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <Image 
                                src="/svg/logoipsum.svg" 
                                alt="VerifyChain Logo" 
                                width={48} 
                                height={48}
                                className="w-12 h-12"
                            />
                        </Link>

                        {/* Right side - Profile & Logout */}
                        <div className="flex items-center gap-4">
                            <button className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <span className="text-gray-600 font-medium">U</span>
                            </button>
                            <Button variant="outline" size="sm">
                                Logout
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: "30px" }}
                        animate={{ opacity: 1, y: "0px" }}
                        transition={{ ease: "easeInOut" }}
                        className="flex flex-col gap-6 items-center text-center"
                    >
                        <span className="rounded-full bg-[#f5f5f5] border font-matter text-[12px] py-1 px-[14px] w-fit text-secondary-black">
                            Your dashboard overview
                        </span>
                        
                        <h1 className="text-[40px] md:text-[55px] xl:text-[70px] font-cal text-primary-black leading-none">
                            Welcome Back
                        </h1>
                        
                        <p className="text-gray-700 text-[16px] lg:text-[18px] max-w-2xl">
                            Choose an action to manage your employment verification system
                        </p>

                        {/* Action Cards */}
                        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl mt-8">
                            {/* Verify Proof */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="group"
                            >
                                <Link href="/verify">
                                    <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col items-center gap-4 min-h-[320px]">
                                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <ShieldCheck className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <h3 className="font-cal text-2xl text-primary-black">
                                            Verify Proof
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Validate employment proof codes instantly
                                        </p>
                                        <Button className="mt-auto w-full" asChild>
                                            <LoadingSwap isLoading={false}>
                                                <span>Verify Now</span>
                                            </LoadingSwap>
                                        </Button>
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Company Management */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="group"
                            >
                                <Link href="/company-management">
                                    <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col items-center gap-4 min-h-[320px]">
                                        <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                            <Building2 className="w-8 h-8 text-purple-500" />
                                        </div>
                                        <h3 className="font-cal text-2xl text-primary-black">
                                            Company<br />Management
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Manage company settings and employees
                                        </p>
                                        <Button className="mt-auto w-full" asChild>
                                            <LoadingSwap isLoading={false}>
                                                <span>Manage</span>
                                            </LoadingSwap>
                                        </Button>
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Generate Proof */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="group"
                            >
                                <Link href="/generate-proof">
                                    <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-blue-500 hover:shadow-lg transition-all duration-300 bg-white h-full flex flex-col items-center gap-4 min-h-[320px]">
                                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                            <FileCheck className="w-8 h-8 text-green-500" />
                                        </div>
                                        <h3 className="font-cal text-2xl text-primary-black">
                                            Generate Proof
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            Create new employment verification codes
                                        </p>
                                        <Button className="mt-auto w-full" asChild>
                                            <LoadingSwap isLoading={false}>
                                                <span>Generate</span>
                                            </LoadingSwap>
                                        </Button>
                                    </div>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </BorderLayout>
    );
}