// // src/services/qnaService.ts
// import type{ FAQ, RequestTicket } from '../types';

// const API_BASE_URL = 'http://localhost:8080/api';

// /**
//  * ดึงข้อมูลคำถามที่พบบ่อย (FAQ) ทั้งหมดจากเซิร์ฟเวอร์
//  */
// export const getFaqs = async (): Promise<FAQ[]> => {
//     const response = await fetch(`${API_BASE_URL}/faqs`);
//     if (!response.ok) {
//         throw new Error('ไม่สามารถดึงข้อมูล FAQ ได้');
//     }
//     return response.json();
// };

// /**
//  * สร้างคำร้อง (Ticket) ใหม่
//  * @param data - ข้อมูลคำร้องที่ประกอบด้วย subject และ initial_message
//  */
// export const createTicket = async (data: { subject: string; initial_message: string }): Promise<RequestTicket> => {
//     // 1. ローカルストレージからトークンを取得する
//     const token = localStorage.getItem('token');
    
//     // 2. ヘッダーオブジェクトを作成する
//     const headers: HeadersInit = {
//         'Content-Type': 'application/json',
//     };

//     // 3. トークンが存在する場合は、Authorization ヘッダーを追加する
//     if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//     }

//     const response = await fetch(`${API_BASE_URL}/tickets`, {
//         method: 'POST',
//         headers: headers, // 4. 作成したヘッダーを使用する
//         body: JSON.stringify(data),
//     });
//     if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'การส่งคำร้องล้มเหลว');
//     }
//     return response.json();
// };

// /**
//  * ดึงข้อมูลคำร้องทั้งหมด (สำหรับ Admin)
//  */
// export const getAllTickets = async (): Promise<RequestTicket[]> => {
//     const response = await fetch(`${API_BASE_URL}/tickets`);
//     if (!response.ok) {
//         throw new Error('ไม่สามารถดึงข้อมูลคำร้องได้');
//     }
//     return response.json();
// };

// /**
//  * ดึงข้อมูลคำร้องตาม ID
//  * @param ticketId - ไอดีของคำร้องที่ต้องการ
//  */
// export const getTicketById = async (ticketId: string): Promise<RequestTicket> => {
//     const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
//     if (!response.ok) {
//         throw new Error('ไม่พบข้อมูลคำร้อง');
//     }
//     return response.json();
// };