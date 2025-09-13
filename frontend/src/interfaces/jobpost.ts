//หน้าที่: บอก React/TypeScript ว่า object ของโพสต์ มีโครงสร้างยังไง
import type { Employer } from "./employer";
import type { Student } from "./student";
import type { JobCategory } from "./job_category";
import type { EmploymentType } from "./employment_type";
import type { SalaryType } from "./salary_type";

export interface Jobpost {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;

  title: string;
  description: string;
  deadline: string;                
  status: string;
  image_url?: string | null;
  portfolio_required?: string | null;
  salary: number;
  locationjob: string;

  employer_id: number;
  Employer?: Employer;             

  job_category_id: number;
  JobCategory?: JobCategory;

  employment_type_id: number;
  EmploymentType?: EmploymentType;

  salary_type_id: number;
  SalaryType?: SalaryType;
}

// interfaces/jobpost.ts
export interface CreateJobpost {
  title: string;
  description: string;
  salary: number;
  locationjob: string;
  deadline: string;              
  status: string;                 
  portfolio_required?: string | null;     
  job_category_id: number;
  employment_type_id: number;
  salary_type_id: number;
  image_url?: string | null;
  employer_id: number;
}

// interface for myjob
export interface Jobpost {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt?: string | null;
    title: string;
    description: string;
    status: string;
    salary: number;
    employer_id: number;
    employer?: {
      company_name: string;
    };
    job_category_id: number;
    job_category?: JobCategory;
    locationjob: string;
    employment_type_id: number;
    employment_type?: EmploymentType;
    salary_type_id: number;
    salary_type?: SalaryType;
    student_id: number;
    student?: Student;
    payment_status_name?: string;
    ready_to_pay?: boolean;
}