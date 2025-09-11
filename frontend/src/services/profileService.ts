// import type{ Student } from '../types'; // สมมติว่ามี type Student ใน types.ts

// const API_BASE_URL = 'http://localhost:8080/api';

// export const getMyProfile = async (): Promise<Student> => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         throw new Error('No authentication token found');
//     }

//     const response = await fetch(`${API_BASE_URL}/profile`, {
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     });

//     if (!response.ok) {
//         if (response.status === 401) {
//             window.location.href = '/login'; // ถ้า Token ไม่ถูกต้อง ให้กลับไปหน้า login
//         }
//         throw new Error('Failed to fetch profile data');
//     }
//     return response.json();
// };