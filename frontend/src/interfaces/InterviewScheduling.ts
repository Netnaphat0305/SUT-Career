export interface InterviewScheduling {
  ID: number;
  DateAndTime: string; // ใช้ string เพราะ backend ส่งเป็น ISO เช่น "2025-09-08T10:00:00Z"
  Status: string;
  Description?: string;
}
