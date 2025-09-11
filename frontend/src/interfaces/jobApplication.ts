// User ของ Student
export interface User {
  ID: number;
  username: string;
}

// ข้อมูลธนาคาร
export interface Bank {
  bank_name: string;
}

// ข้อมูลนักศึกษา
export interface Student {
  ID: number;
  first_name: string;
  last_name: string;
  phone: string;
  user: User;
  bank: Bank;
  faculty?: string; 
  email?: string;
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
// ข้อมูลการสมัครงาน
export interface JobApplication {
  ID: number;
  application_status: ApplicationStatus;   
  application_reason: string;
  CreatedAt: string;
  JobPost: JobPost;
  Student: Student;

  //  แก้ให้ใช้ interface ที่เราสร้างด้านบน
  InterviewScheduling?: InterviewScheduling | null;
}

