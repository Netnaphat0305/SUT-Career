export type UserRole = "student" | "employer";

export interface ChatRoom {
  id: number;
  student_id?: number;
  employer_id?: number;
  last_message_at?: number;
  last_message?: string;
  Status_Room: string;
  WhoBlock?: string;

  // 👇 เพิ่มเข้ามา
  Student?: {
    id: number;
    User?: {
      Firstname: string;
      Lastname: string;
    };
  };

  Employer?: {
    id: number;
    User?: {
      Firstname: string;
      Lastname: string;
    };
  };
}

export interface ChatHistory {
  id: number;
  chat_room_id: number;
  SenderRole: UserRole;
  Message: string;
  ImageURL: string;
  TimeStampSend: number;
}
