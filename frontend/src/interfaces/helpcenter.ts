import type { User } from './user';

// ===== Q&A System (ระบบถาม-ตอบ และส่งคำร้อง) =====

// ✨ 1. เพิ่ม Interface สำหรับไฟล์แนบ
export interface TicketAttachment {
  ID: number;
  url: string;
  name: string;
  type: string;
}

export interface FAQ {
  ID: number;
  CreatedAt: string;
  UpdatedAt?: string;
  title: string;
  content: string;
  image_url?: string; // เพิ่ม field นี้
}

export interface TicketReply {
    ID: number;
    CreatedAt: string;
    message: string;
    is_staff_reply: boolean;
    author: User;
    attachments?: TicketAttachment[]; // ✨ 2. เพิ่มไฟล์แนบใน Reply
}

export interface RequestTicket {
    ID: number;
    CreatedAt: string;
    subject: string;
    initial_message: string;
    status: 'Open' | 'In Progress' | 'Awaiting Confirmation' | 'Resolved';
    user: User;
    replies: TicketReply[];
    attachments?: TicketAttachment[]; // ✨ 3. เพิ่มไฟล์แนบใน Ticket หลัก
}

