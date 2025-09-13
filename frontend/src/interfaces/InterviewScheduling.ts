// frontend/src/interfaces/InterviewScheduling.ts
export interface InterviewScheduling {
  ID: number;
  DateAndTimeStart: string;   // <-- ใช้ชื่อเดียวกับ backend (เป็น ISO string)
  DateAndTimeEnd: string;
  Status: string;
  Detail: string;
  EmployerID: number;
  Employer: {
    ID: number;
  }
}
