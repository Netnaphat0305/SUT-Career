import type { User } from './user';

// ===== New Interface for FAQ Comments =====
export interface FAQComment {
  ID: number;
  CreatedAt: string;
  content: string;
  author: User;
  faq_id: number;
}


// ===== Q&A System (ระบบถาม-ตอบ และส่งคำร้อง) =====
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
  image_url?: string;
  comments_enabled: boolean;
  comments?: FAQComment[];
  comment_count: number;
}

export interface TicketReply {
    ID: number;
    CreatedAt: string;
    message: string;
    is_staff_reply: boolean;
    author: User;
    attachments?: TicketAttachment[];
}

export interface RequestTicket {
    ID: number;
    CreatedAt: string;
    subject: string;
    initial_message: string;
    status: 'Open' | 'In Progress' | 'Awaiting Confirmation' | 'Resolved';
    user: User;
    replies: TicketReply[];
    attachments?: TicketAttachment[];
}
