/**
 * TypeScript types matching the backend Candid interface
 */

export interface Proof {
    code: string;
    company_id: string;
    employee_id: string;
    created_at: bigint;
    expires_at: bigint;
    is_used: boolean;
}

export interface Company {
    id: number;
    username: string;
    name: string;
    image?: string;
    employees: Employee[];
}

export interface Employee {
    id: string;
    name: string;
    position: string;
}

export interface CompanyEmployee {
    employee_id: string;
    position: string;
}

export interface CompanyEmployeeList {
    employees: CompanyEmployee[];
}

export interface ProofResult {
    company_id: string;
    company_name: string;
    employee_id: string;
    employee_name: string;
    position: string;
    created_at: bigint;
}

export type Result<T> = { Ok: T } | { Err: string };

