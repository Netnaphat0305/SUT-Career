// User ของ Student
export interface User {
  ID: number;
  username: string;
}

// ข้อมูลธนาคาร
export interface Bank {
  bank_name: string;
}

// ข้อมูลบริษัท
export interface Employer {
  company_name: string;
  logo?: string; // optional, ถ้ามีโลโก้
}

// ข้อมูลประกาศงาน
export interface JobPost {
  ID: number;
  title: string;
  Employer: Employer;
  image_url?: string;
}

//  เพิ่ม interface InterviewScheduling
export interface InterviewScheduling {
  ID: number;
  DateAndTime: string;  // backend ส่ง ISO string เช่น "2025-09-08T10:00:00Z"
  Status: string;
  Description?: string;
}

export type ApplicationStatus =
  | "Pending"
  | "InterviewPending"
  | "InterviewScheduled"
  | "Interviewed"
  | "Accepted"
  | "Rejected"
  | "Cancelled";

//  ใช้ Student ตัวจริงจาก interfaces/student.ts
import type { Student } from "./student";

// ข้อมูลการสมัครงาน
export interface JobApplication {
  ID: number;
  application_status: ApplicationStatus;   
  application_reason: string;
  CreatedAt: string;
  JobPost: JobPost;
  Student: Student;   // ตอนนี้ Student มี profile_image_url แน่นอน 
  resume_file?: string; //  เพิ่มฟิลด์นี้
  InterviewScheduling?: InterviewScheduling | null;
}
