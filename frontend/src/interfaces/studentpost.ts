// src/interfaces/studentpost.ts

import type { Student } from "./student";
import type { JobCategory } from "./job_category";

// Interface สำหรับไฟล์แนบ (ใช้แทน Attachment เดิม)
export interface StudentPostAttachment {
  ID?: number; // Optional ID
  url: string;
  name: string;
  type: string;
  student_post_id?: number; // Optional
}

// Interface สำหรับ Props ของ Modal โดยเฉพาะ
export interface CreateStudentPostModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}


// Interface หลักสำหรับโพสต์ของนักศึกษา (คงเดิม)
export interface StudentPost {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  
  // --- ข้อมูลหลักของโพสต์ ---
  title: string;
  job_type: string;
  availability: string;
  preferred_location: string;
  expected_compensation?: string;
  introduction?: string;
  portfolio_url?: string;
  status: string;
  skills: any;

  // --- ข้อมูลความสัมพันธ์ (Relations) ---
  student_id?: number;
  student?: Student;

  job_category_id?: number;
  job_category?: JobCategory; 

  attachments?: StudentPostAttachment[];
}
export interface EditStudentPostModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    post: StudentPost | null; // รับ post ที่จะแก้ไข
  }