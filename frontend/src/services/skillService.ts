import type{ Skill } from "../interfaces/skill"; // เราจะสร้าง interface นี้ในขั้นตอนถัดไป

const API_BASE_URL = 'http://localhost:8080/api';

// ฟังก์ชันสำหรับดึง Token จาก Local Storage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// ดึงข้อมูล Skill ทั้งหมด
export const getAllSkills = async (): Promise<Skill[]> => {
    const response = await fetch(`${API_BASE_URL}/skills`, {
        method: 'GET',
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch skills');
    }

    return response.json();
};