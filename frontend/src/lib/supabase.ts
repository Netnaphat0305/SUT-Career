// // src/lib/supabase.ts

// import { createClient } from '@supabase/supabase-js';

// // 1. สร้างและ export Supabase client
// //    ใช้ environment variables VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY จากไฟล์ .env ของคุณ
// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL!,
//   import.meta.env.VITE_SUPABASE_ANON_KEY!
// );

// // 2. ฟังก์ชันสำหรับอัปโหลดรูปภาพไปยัง Supabase Storage
// /**
//  * อัปโหลดไฟล์รูปภาพไปยัง Supabase Storage
//  * @param file ไฟล์ที่ต้องการอัปโหลด
//  * @param type ประเภทการอัปโหลด (สำหรับแยกโฟลเดอร์)
//  * @returns URL สาธารณะของไฟล์ที่อัปโหลดแล้ว
//  */
// export const uploadHelpCenterImageToSupabase = async (
//   file: File,
//   type: 'ticket' | 'reply'
// ): Promise<{ url: string; originalName: string } | null> => {
//   try {
//     // ตรวจสอบขนาดและประเภทของไฟล์
//     if (file.size > 5 * 1024 * 1024) { // จำกัดขนาด 5MB
//       throw new Error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
//     }
//     if (!file.type.startsWith('image/')) {
//       throw new Error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
//     }

//     // กำหนด Path ที่จะเก็บไฟล์ใน Storage เพื่อความเป็นระเบียบ
//     const folder = type === 'ticket' ? 'help-center/tickets' : 'help-center/replies';
//     const fileName = `${Date.now()}_${file.name}`;
//     const filePath = `${folder}/${fileName}`;

//     // อัปโหลดไฟล์ไปที่ Bucket ของคุณ (สำคัญ: แก้ชื่อ 'SA-G08-1-68' หากจำเป็น)
//     const { data, error: uploadError } = await supabase.storage
//       .from('SA-G08-1-68') // <-- **ตรวจสอบให้แน่ใจว่าเป็นชื่อ Bucket ที่ถูกต้อง**
//       .upload(filePath, file);

//     if (uploadError) {
//       throw uploadError; // หากอัปโหลดไม่สำเร็จ ให้โยน error ออกไป
//     }

//     // ดึง Public URL ของไฟล์ที่อัปโหลดสำเร็จ
//     const { data: publicUrlData } = supabase.storage
//       .from('SA-G08-1-68')
//       .getPublicUrl(data.path);
      
//     if (!publicUrlData) {
//         throw new Error('ไม่สามารถดึง Public URL ของไฟล์ได้');
//     }

//     // ส่งคืน URL และชื่อไฟล์เดิม
//     return {
//       url: publicUrlData.publicUrl,
//       originalName: file.name
//     };

//   } catch (error) {
//     console.error('Supabase upload failed:', error);
//     if (error instanceof Error) {
//         throw new Error(error.message);
//     }
//     throw new Error('เกิดข้อผิดพลาดที่ไม่รู้จักระหว่างการอัปโหลดไฟล์');
//   }
// };
// import { createClient } from '@supabase/supabase-js';

// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL!,
//   import.meta.env.VITE_SUPABASE_ANON_KEY!
// );

// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 1. สร้างและ export Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// 2. ฟังก์ชันสำหรับอัปโหลดรูปภาพไปยัง Supabase Storage
/**
 * อัปโหลดไฟล์รูปภาพไปยัง Supabase Storage
 * @param file ไฟล์ที่ต้องการอัปโหลด
 * @param type ประเภทการอัปโหลด (สำหรับแยกโฟลเดอร์)
 * @returns URL สาธารณะของไฟล์ที่อัปโหลดแล้ว
 */
export const uploadHelpCenterImageToSupabase = async (
  file: File,
  type: 'ticket' | 'reply'
): Promise<{ url: string; originalName: string } | null> => {
  try {
    // ตรวจสอบขนาดและประเภทของไฟล์
    if (file.size > 5 * 1024 * 1024) { // จำกัดขนาด 5MB
      throw new Error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    }

    // กำหนด Path ที่จะเก็บไฟล์ใน Storage เพื่อความเป็นระเบียบ
    const folder = type === 'ticket' ? 'help-center/tickets' : 'help-center/replies';
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${folder}/${fileName}`;

    // อัปโหลดไฟล์ไปที่ Bucket ของคุณ
    const { data, error: uploadError } = await supabase.storage
      .from('SA-G08-1-68')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // ดึง Public URL ของไฟล์ที่อัปโหลดสำเร็จ
    const { data: publicUrlData } = supabase.storage
      .from('SA-G08-1-68')
      .getPublicUrl(data.path);

    if (!publicUrlData) {
      throw new Error('ไม่สามารถดึง Public URL ของไฟล์ได้');
    }

    // ส่งคืน URL และชื่อไฟล์เดิม
    return {
      url: publicUrlData.publicUrl,
      originalName: file.name
    };
  } catch (error) {
    console.error('Supabase upload failed:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('เกิดข้อผิดพลาดที่ไม่รู้จักระหว่างการอัปโหลดไฟล์');
  }
};

// ✅ เพิ่มฟังก์ชันใหม่สำหรับใช้ upload endpoint ของ backend
export const uploadFileToBackend = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch('https://sut-career-backend.onrender.com/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('Backend upload failed:', error);
    throw error;
  }
};
