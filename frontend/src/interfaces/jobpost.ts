import type { Billableitem } from "./billableitem";
import type { Employer } from "./employer";
import type { Student } from "./student";
import type { JobCategory } from "./job_category";
import type { EmploymentType } from "./employment_type";
import type { SalaryType } from "./salary_type";
import type { Status } from "./payment_status";

export interface Jobpost {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt?: string | null;

  title: string;
  description: string;
  deadline: string | Date;         
  status: string;
  image_url?: string | null;       
  portfolio_required?: string | null;
  salary: number;
  locationjob: string;

  employer_id: number;
  Employer?: Employer | { company_name: string };

  job_category_id: number;
  JobCategory?: JobCategory;

  employment_type_id: number;
  EmploymentType?: EmploymentType;

  salary_type_id: number;
  SalaryType?: SalaryType;

  student_id: number;
  Student?: Student;

  billableitem_id?: number;
  BillableItem?: Billableitem;

  payment_status_name?: Status["status_name"];
  ready_to_pay?: boolean;
}

// src/interfaces/jobpost.ts

export interface CreateJobpost {
  title: string;
  description: string;
  salary: number;
  locationjob: string;
  deadline: string;
  status: string;
  portfolio_required: string;
  job_category_id: number;
  employment_type_id: number;
  salary_type_id: number;
  employer_id: number;
  image_url?: string | null;
}
