import type { Billableitem } from "./billableitem";
import type { Employer } from "./employer";
import type { Student } from "./student";
import type { JobCategory } from "./job_category";
import type { EmploymentType } from "./employment_type";
import type { SalaryType } from "./salary_type";
import type { Status } from "./payment_status";

export interface Jobpost {
    ID: number;
    CreatedAt: string;  // เพิ่มตรงนี้
    UpdatedAt: string;  // เผื่อใช้
    DeletedAt?: string | null;
    title: string;
    description: string;
    deadline: Date;
    status: string;
    image_url: string;
    portfolio_required: string;
    salary: number;
    // FK อยู่ฝั่ง billable_items.jobpost_id → ส่วนนี้เป็น backref เฉย ๆ
    billableitem_id?: number;
    billableitem?: Billableitem;
    employer_id: number;
    employer?: Employer;
    job_category_id: number;
    job_category?: JobCategory;
    locationjob: string;
     Employer?: {
    company_name: string;
  };

    employment_type_id: number;
    employment_type?: EmploymentType;
    salary_type_id: number;
    salary_type?: SalaryType;
    student_id: number;
    student?: Student;
}

// interfaces/jobpost.ts

export interface CreateJobpost {
  title: string;
  description: string;
  salary: number;
  locationjob: string;
  deadline: string;               // ✅ ส่งเป็น string (ISO format)
  status: string;                 // ✅ ผู้ว่าจ้างเลือกเอง เช่น "Open"
  portfolio_required: string;     // ✅ ผู้ว่าจ้างเลือกเอง "true"/"false"
  job_category_id: number;
  employment_type_id: number;
  salary_type_id: number;
  image_url?: string | null;
  employer_id: number;
}

// interface for myjob
export interface Jobpost {
    ID: number;
    CreatedAt: string;  // เพิ่มตรงนี้
    UpdatedAt: string;  // เผื่อใช้
    DeletedAt?: string | null;
    title: string;
    description: string;
    deadline: Date;
    status: string;
    image_url: string;
    portfolio_required: string;
    salary: number;
    // FK อยู่ฝั่ง billable_items.jobpost_id → ส่วนนี้เป็น backref เฉย ๆ
    billableitem_id?: number;
    billableitem?: Billableitem;
    employer_id: number;
    employer?: Employer;
    job_category_id: number;
    job_category?: JobCategory;
    locationjob: string;
     Employer?: {
    company_name: string;
  };
    employment_type_id: number;
    employment_type?: EmploymentType;
    salary_type_id: number;
    salary_type?: SalaryType;
    student_id: number;
    student?: Student;
    payment_status_name?: Status['status_name'];
    ready_to_pay?: boolean;
}