"use client"

import BorderLayout from "@/components/layout/borderLayout"
import CrossSVG from "@/components/svg/CrossSVG"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { ArrowLeft, Plus, Pencil, Trash2, Building2, ArrowUpDown, ChevronDown } from "lucide-react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useICPActor } from '@/hooks/useICPActor'
import type { Company, Employee } from '@/types/backend'

// ========== Local storage utils ==========
const STORAGE_KEY = "companies";
const genId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

// ========== Back button (router back or fallback) ==========
function useSmartBack() {
    const router = useRouter();
    return () => {
        try {
            const prev = document.referrer || "";
            const sameOrigin = prev.startsWith(window.location.origin);
            if (sameOrigin && window.history.length > 1) router.back();
            else router.push("/company-management");
        } catch {
            router.push("/company-management");
        }
    };
}

// ========== Employees DataTable (Search, Filter, Pagination, Row Selection) ==========
function EmployeesTable({
    data,
    onEdit,
    onDelete,
    onBulkDelete,
}: {
    data: Employee[]
    onEdit: (emp: Employee) => void
    onDelete: (id: string) => void
    onBulkDelete: (ids: string[]) => void
}) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState("") // single search for name OR position
    const [positionFilter, setPositionFilter] = useState<string>("") // dropdown filter

    // Unique positions for filter dropdown
    const positions = useMemo(() => {
        const set = new Set<string>()
        data.forEach((d) => d.position && set.add(d.position))
        return Array.from(set).sort((a, b) => a.localeCompare(b))
    }, [data])

    // Custom global filter: matches name OR position
    const globalFilterFn: FilterFn<Employee> = (row, _columnId, filterValue) => {
        const q = String(filterValue || "").toLowerCase().trim()
        if (!q) return true
        const { name, position } = row.original
        return (
            name.toLowerCase().includes(q) ||
            position.toLowerCase().includes(q)
        )
    }

    // Columns
    const columns = useMemo<ColumnDef<Employee>[]>(() => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
            size: 10,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-0"
                >
                    Name
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "position",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-0"
                >
                    Position
                    <ArrowUpDown className="ml-2 size-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("position")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const emp = row.original
                return (
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => onEdit(emp)}>
                            <Pencil className="size-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" className="gap-1" onClick={() => onDelete(emp.id)}>
                            <Trash2 className="size-4" /> Delete
                        </Button>
                    </div>
                )
            },
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [onEdit, onDelete])

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    // Hook position filter into columnFilters
    useEffect(() => {
        const col = table.getColumn("position")
        if (!col) return
        if (!positionFilter) {
            col.setFilterValue(undefined)
        } else {
            col.setFilterValue(positionFilter) // default includesString
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [positionFilter])

    const selectedCount = table.getFilteredSelectedRowModel().rows.length
    const totalFiltered = table.getFilteredRowModel().rows.length

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 py-4">
                <Input
                    placeholder="Search name or position..."
                    value={globalFilter ?? ""}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="max-w-xs bg-white"
                />

                {/* Position filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            {positionFilter ? `Position: ${positionFilter}` : "Filter by Position"}
                            <ChevronDown className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuCheckboxItem
                            checked={!positionFilter}
                            onCheckedChange={() => setPositionFilter("")}
                        >
                            All positions
                        </DropdownMenuCheckboxItem>
                        {positions.map((pos) => (
                            <DropdownMenuCheckboxItem
                                key={pos}
                                checked={positionFilter === pos}
                                onCheckedChange={() => setPositionFilter(pos)}
                                className="capitalize"
                            >
                                {pos}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Columns visibility */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto gap-2">
                            Columns <ChevronDown className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllLeafColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="overflow-hidden bg-white border border-gray rounded-md">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id} className="whitespace-nowrap">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="align-middle">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer: selection + pagination + bulk delete */}
            <div className="flex flex-wrap items-center gap-2 justify-between py-4">
                <div className="text-muted-foreground text-sm">
                    {selectedCount} of {totalFiltered} row(s) selected
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={selectedCount === 0}
                        onClick={() => {
                            const ids = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id)
                            if (ids.length && confirm(`Delete ${ids.length} selected row(s)?`)) {
                                onBulkDelete(ids)
                                table.resetRowSelection()
                            }
                        }}
                    >
                        Delete selected
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ========== Page Component ==========
function CompanyPageContent() {
    const searchParams = useSearchParams();
    const handleBack = useSmartBack();
    const companyUsername = searchParams.get('username') || '';

    // Mounted gate
    const [mounted, setMounted] = useState(false);
    
    // Initialize ICP Actor using custom hook
    const { actor, loading: connecting, error: connectionError } = useICPActor();

    const [company, setCompany] = useState<Company | null>(null);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load company and employees from backend
    useEffect(() => {
        if (!mounted || !actor || !companyUsername) return;
        
        const loadCompanyData = async () => {
            setLoadingEmployees(true);
            try {
                // Get employees from backend
                const employeesData = await actor.list_company_employess(companyUsername);
                
                // Convert to Employee objects
                const employees: Employee[] = employeesData.map((emp: any) => ({
                    id: emp.employee_id,
                    name: emp.employee_id,  // Using principal ID as name
                    position: emp.position
                }));
                
                // Create company object
                const companyData: Company = {
                    id: 1,
                    username: companyUsername,
                    name: companyUsername,  // Using username as name
                    image: "",
                    employees: employees
                };
                
                setCompany(companyData);
            } catch (error) {
                
                // Fallback to localStorage
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    if (raw) {
                        const list = JSON.parse(raw) as Company[];
                        const found = list.find((c) => c.username === companyUsername) || null;
                        if (found) {
                            setCompany(found);
                        } else {
                            // Create empty company
                            setCompany({
                                id: 1,
                                username: companyUsername,
                                name: companyUsername,
                                employees: []
                            });
                        }
                    } else {
                        // Create empty company
                        setCompany({
                            id: 1,
                            username: companyUsername,
                            name: companyUsername,
                            employees: []
                        });
                    }
                } catch { }
            } finally {
                setLoadingEmployees(false);
            }
        };
        
        loadCompanyData();
    }, [mounted, actor, companyUsername]);

    const saveCompany = (next: Company) => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const list = raw ? (JSON.parse(raw) as Company[]) : [];
            const updated = list.map((c) => (c.id === next.id ? next : c));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setCompany(next);
        } catch { }
    };

    // Employee dialog state
    const [openEmp, setOpenEmp] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
    const [empForm, setEmpForm] = useState({ principalId: "", position: "" });
    const [saving, setSaving] = useState(false);

    const openAddEmp = () => {
        setIsEditing(false);
        setEditingEmpId(null);
        setEmpForm({ principalId: "", position: "" });
        setOpenEmp(true);
    };

    const openEditEmp = (emp: Employee) => {
        setIsEditing(true);
        setEditingEmpId(emp.id);
        setEmpForm({ principalId: emp.name, position: emp.position });
        setOpenEmp(true);
    };

    const handleSaveEmp = async () => {
        if (!company) return;
        if (!empForm.principalId.trim()) {
            alert("Please enter employee Principal ID");
            return;
        }
        if (!empForm.position.trim()) {
            alert("Please enter employee Position");
            return;
        }

        if (isEditing && editingEmpId) {
            // TODO: Edit functionality (not implemented in backend yet)
            const next: Company = {
                ...company,
                employees: company.employees.map((e) =>
                    e.id === editingEmpId ? { ...e, name: empForm.principalId.trim(), position: empForm.position.trim() } : e
                ),
            };
            saveCompany(next);
        } else {
            // Add employee via backend
            if (!actor) {
                alert("Not connected to backend");
                return;
            }

            setSaving(true);
            try {
                const result = await actor.add_employee(companyUsername, empForm.principalId.trim(), empForm.position.trim());
                
                if (result === true) {
                    alert("Employee added successfully!");
                    
                    // Reload employees from backend
                    const employeesData = await actor.list_company_employess(companyUsername);
                    const employees: Employee[] = employeesData.map((emp: any) => ({
                        id: emp.employee_id,
                        name: emp.employee_id,
                        position: emp.position
                    }));
                    
                    const updatedCompany: Company = {
                        ...company,
                        employees: employees
                    };
                    setCompany(updatedCompany);
                    saveCompany(updatedCompany);
                } else {
                    alert("Failed to add employee");
                }
            } catch (error) {
                alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
            } finally {
                setSaving(false);
            }
        }

        setOpenEmp(false);
        setIsEditing(false);
        setEditingEmpId(null);
        setEmpForm({ principalId: "", position: "" });
    };

    const handleDeleteEmp = async (id: string) => {
        if (!company) return;
        if (!confirm("Are you sure you want to delete this employee?")) return;
        
        if (!actor) {
            alert("Not connected to backend");
            return;
        }

        try {
            const result = await actor.remove_employee(companyUsername, id);
            
            if (result === true) {
                // Reload employees from backend
                const employeesData = await actor.list_company_employess(companyUsername);
                const employees: Employee[] = employeesData.map((emp: any) => ({
                    id: emp.employee_id,
                    name: emp.employee_id,
                    position: emp.position
                }));
                
                const updatedCompany: Company = {
                    ...company,
                    employees: employees
                };
                setCompany(updatedCompany);
                saveCompany(updatedCompany);
            } else {
                alert("Failed to delete employee");
            }
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };

    const handleBulkDelete = async (ids: string[]) => {
        if (!company) return;
        if (!confirm(`Are you sure you want to delete ${ids.length} employee(s)?`)) return;
        
        if (!actor) {
            alert("Not connected to backend");
            return;
        }

        try {
            // Delete each employee
            let successCount = 0;
            for (const id of ids) {
                try {
                    const result = await actor.remove_employee(companyUsername, id);
                    if (result === true) {
                        successCount++;
                    }
                } catch (error) {
                    // Silently continue with next employee
                }
            }
            
            if (successCount > 0) {
                // Reload employees from backend
                const employeesData = await actor.list_company_employess(companyUsername);
                const employees: Employee[] = employeesData.map((emp: any) => ({
                    id: emp.employee_id,
                    name: emp.employee_id,
                    position: emp.position
                }));
                
                const updatedCompany: Company = {
                    ...company,
                    employees: employees
                };
                setCompany(updatedCompany);
                saveCompany(updatedCompany);
                
                alert(`Successfully deleted ${successCount} employee(s)`);
            } else {
                alert("Failed to delete employees");
            }
        } catch (error) {
            alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    };

    // Skeleton during mount
    if (!mounted) {
        return (
            <BorderLayout id="company-page" className="mt-3 border-t">
                <CrossSVG className="absolute -left-3 -top-3 " />
                <CrossSVG className="absolute -right-3 -top-3" />
                <div className="seciton-py">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
                        <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
                        <div className="h-5 w-48 bg-gray-100 rounded" />
                    </div>
                </div>
            </BorderLayout>
        );
    }

    if (!company) {
        return (
            <BorderLayout id="company-page" className="mt-3 border-t">
                <CrossSVG className="absolute -left-3 -top-3 " />
                <CrossSVG className="absolute -right-3 -top-3" />
                <div className="seciton-py">
                    <div className="max-w-3xl mx-auto px-4">
                        <Button variant="ghost" className="mb-4 gap-2" onClick={handleBack}>
                            <ArrowLeft className="size-4" /> Back
                        </Button>
                        <div className="text-lg">Company not found.</div>
                    </div>
                </div>
            </BorderLayout>
        );
    }

    return (
        <BorderLayout id="company-page" className="mt-3 border-t">
            <CrossSVG className="absolute -left-3 -top-3 " />
            <CrossSVG className="absolute -right-3 -top-3" />

            <div className="seciton-py">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            {company.image ? (
                                <img src={company.image} alt={company.name} className="size-10 rounded object-cover" />
                            ) : (
                                <div className="inline-flex items-center justify-center size-10 rounded bg-[#e5e7eb]">
                                    <Building2 className="text-gray-600" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-semibold">{company.name}</h1>
                                <p className="text-sm text-gray-500">{company.employees.length} Employees</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="gap-2" onClick={handleBack}>
                                <ArrowLeft className="size-4" /> Back
                            </Button>
                            <Button className="gap-2" onClick={openAddEmp}>
                                <Plus className="size-4" /> Add Employee
                            </Button>
                        </div>
                    </div>

                    {/* Employees DataTable */}
                    <div className="">
                        {loadingEmployees ? (
                            <div className="text-center py-8">
                                <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
                                <p className="text-gray-600">Loading employees...</p>
                            </div>
                        ) : (
                            <EmployeesTable
                                data={company.employees}
                                onEdit={openEditEmp}
                                onDelete={handleDeleteEmp}
                                onBulkDelete={handleBulkDelete}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Employee Dialog */}
            <Dialog open={openEmp} onOpenChange={setOpenEmp}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Employee" : "Add Employee"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input
                            placeholder="Employee Principal ID *"
                            value={empForm.principalId}
                            onChange={(e) => setEmpForm((s) => ({ ...s, principalId: e.target.value }))}
                            required
                        />
                        <Input
                            placeholder="Position *"
                            value={empForm.position}
                            onChange={(e) => setEmpForm((s) => ({ ...s, position: e.target.value }))}
                            required
                        />
                        <Button 
                            className="w-full" 
                            onClick={handleSaveEmp}
                            disabled={saving}
                        >
                            {saving ? "Adding..." : (isEditing ? "Save Changes" : "Add Employee")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </BorderLayout>
    );
}

export default function Page() {
    return (
        <Suspense fallback={
            <BorderLayout id="company-page" className="mt-3 border-t">
                <CrossSVG className="absolute -left-3 -top-3 " />
                <CrossSVG className="absolute -right-3 -top-3" />
                <div className="seciton-py">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
                        <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
                        <div className="h-5 w-48 bg-gray-100 rounded" />
                    </div>
                </div>
            </BorderLayout>
        }>
            <CompanyPageContent />
        </Suspense>
    );
}

