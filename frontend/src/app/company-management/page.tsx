"use client"

import BorderLayout from "@/components/layout/borderLayout"
import CrossSVG from "@/components/svg/CrossSVG"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Building2, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Employee {
    id: string
    name: string
    position: string
}

interface Company {
    id: number
    name: string
    image?: string
    employees: Employee[]
}

const STORAGE_KEY = "companies";

const DEFAULT_COMPANIES: Company[] = [
    { id: 1, name: "Artify Studio", employees: [] },
    { id: 2, name: "Vision Arts", employees: [], image: "https://placehold.co/600x400" },
];

export default function page() {
    // Mounted gate to prevent hydration mismatch
    const [mounted, setMounted] = useState(false);

    const [companies, setCompanies] = useState<Company[]>([]);

    // Load from localStorage after mount
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                setCompanies(JSON.parse(raw) as Company[]);
            } else {
                setCompanies(DEFAULT_COMPANIES);
            }
        } catch {
            setCompanies(DEFAULT_COMPANIES);
        } finally {
            setMounted(true);
        }
    }, []);

    // Persist to localStorage after mounted
    useEffect(() => {
        if (!mounted) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
        } catch { }
    }, [companies, mounted]);

    // Dialog state
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ name: "", image: "" });

    const openAddDialog = () => {
        setIsEditing(false);
        setEditingId(null);
        setForm({ name: "", image: "" });
        setOpen(true);
    };

    const openEditDialog = (c: Company) => {
        setIsEditing(true);
        setEditingId(c.id);
        setForm({ name: c.name, image: c.image ?? "" });
        setOpen(true);
    };

    const handleSaveCompany = () => {
        if (!form.name.trim()) return;

        if (isEditing && editingId !== null) {
            setCompanies((prev) =>
                prev.map((c) =>
                    c.id === editingId ? { ...c, name: form.name.trim(), image: form.image || undefined } : c
                )
            );
        } else {
            const newId = (companies.reduce((max, c) => Math.max(max, c.id), 0) || 0) + 1;
            const newCompany: Company = {
                id: newId,
                name: form.name.trim(),
                image: form.image || undefined,
                employees: [],
            };
            setCompanies((prev) => [...prev, newCompany]);
        }

        // close dialog
        setOpen(false);
        setForm({ name: "", image: "" });
        setIsEditing(false);
        setEditingId(null);
    };

    const handleDeleteCompany = (id: number) => {
        if (!confirm("Are you sure you want to delete this company?")) return;
        setCompanies((prev) => prev.filter((c) => c.id !== id));
    };

    // Skeleton while mounting to avoid hydration mismatch
    if (!mounted) {
        return (
            <BorderLayout id="verify-page" className="mt-3 border-t">
                <CrossSVG className="absolute -left-3 -top-3 " />
                <CrossSVG className="absolute -right-3 -top-3" />
                <div className="seciton-py">
                    <div className="text-center">
                        <div className="font-matter space-y-4 pb-8 flex flex-col items-center justify-center text-center">
                            {/* Label */}
                            <div className="text-xs text-secondary-black flex gap-1.5 px-3.5 py-1 bg-white items-center shadow border border-gray rounded-full w-fit [&>svg]:size-4">
                                Your companies in one place
                            </div>

                            {/* Title */}
                            <div className="text-[32px] lg:text-[48px] text-[#141414] font-cal capitalize text-balance leading-tight">
                                <h1>Company Management</h1>
                            </div>

                            {/* Description */}
                            <div className="text-base lg:text-lg text-gray-700 max-w-2xl">
                                <h2>
                                    Manage your companies with ease — add new companies, edit or remove employees,
                                    and maintain full control as the company owner.
                                </h2>
                            </div>
                        </div>



                        {/* Company Cards */}
                        <div className="flex justify-center items-center">
                            <Spinner />
                        </div>
                    </div>
                </div>
            </BorderLayout>
        );
    }

    return (
        <BorderLayout id="verify-page" className="mt-3 border-t">
            <CrossSVG className="absolute -left-3 -top-3 " />
            <CrossSVG className="absolute -right-3 -top-3" />

            <div className="seciton-py">
                <div className="text-center">
                    <div className="font-matter space-y-4 pb-8 flex flex-col items-center justify-center text-center">
                        {/* Label */}
                        <div className="text-xs text-secondary-black flex gap-1.5 px-3.5 py-1 bg-white items-center shadow border border-gray rounded-full w-fit [&>svg]:size-4">
                            Your companies in one place
                        </div>

                        {/* Title */}
                        <div className="text-[32px] lg:text-[48px] text-[#141414] font-cal capitalize text-balance leading-tight">
                            <h1>Company Management</h1>
                        </div>

                        {/* Description */}
                        <div className="text-base lg:text-lg text-gray-700 max-w-2xl">
                            <h2>
                                Manage your companies with ease — add new companies, edit or remove employees,
                                and maintain full control as the company owner.
                            </h2>
                        </div>
                    </div>

                    {/* Add Company Button */}
                    <div className="flex justify-center mb-8">
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="size-4" /> Add Company
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[400px]">
                                <DialogHeader>
                                    {/* <DialogTitle>Add New Company</DialogTitle> */}
                                    <DialogTitle>{isEditing ? "Edit Company" : "Add New Company"}</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-3">
                                    {/* <Input
                                        placeholder="Company Name"
                                        value={newCompany.name}
                                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Company Image URL (optional)"
                                        value={newCompany.image}
                                        onChange={(e) => setNewCompany({ ...newCompany, image: e.target.value })}
                                    />
                                    <Button onClick={handleAddCompany} className="w-full">
                                        Add Company
                                    </Button> */}
                                    <Input
                                        placeholder="Company Name"
                                        value={form.name}
                                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                    />
                                    <Input
                                        placeholder="Company Image URL (optional)"
                                        value={form.image}
                                        onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
                                    />
                                    <Button type="submit" onClick={handleSaveCompany} className="w-full">
                                        {isEditing ? "Save Changes" : "Add Company"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Company Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative">
                        {companies.map((item, i) => (
                            <div
                                key={item.id}
                                className="font-matter overflow-hidden bg-white border border-gray rounded-2xl relative"
                            >
                                {/* border dots */}
                                <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full left-3.5 top-3.5" />
                                <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full right-3.5 top-3.5" />
                                <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full left-3.5 bottom-3.5" />
                                <span className="absolute size-1.5 bg-[#C8D4DD] rounded-full right-3.5 bottom-3.5" />

                                <div className="p-10  flex flex-col items-center text-center">
                                    {/* ✅ Image or Default Icon */}
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="size-12 object-cover rounded-md mb-3"
                                        />
                                    ) : (
                                        <div className="inline-block p-2 font-mono text-[#6b7280] mb-3 text-sm rounded-md bg-[#e5e7eb] font-bold">
                                            <Building2 className="text-gray-500 size-8" />
                                        </div>
                                    )}
                                    <div className="mb-[6px] text-[18px] text-[#141414] font-semibold">
                                        {item.name}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-3">{item.employees.length} Employees</p>

                                    {/* Actions */}
                                    <div className="flex gap-2 justify-center flex-wrap">
                                        <Button variant="secondary" className="gap-1" onClick={() => openEditDialog(item)}>
                                            <Pencil className="size-4" /> Edit
                                        </Button>
                                        <Link href={`/companies/${item.id}`}>
                                            <Button variant="default" className="gap-1">
                                                <Eye className="size-4" /> View
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            className="gap-1"
                                            onClick={() => handleDeleteCompany(item.id)}
                                        >
                                            <Trash2 className="size-4" /> Delete
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </BorderLayout>
    )

}
