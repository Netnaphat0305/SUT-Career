//หน้าที่: บอก React/TypeScript ว่า object ของโพสต์ มีโครงสร้างยังไง
import type { Billableitem } from "./billableitem";
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

  // FK อยู่ฝั่ง billable_items.jobpost_id → ส่วนนี้เป็น backref เฉย ๆ  
  employer_id: number;
  Employer?: Employer;             

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
