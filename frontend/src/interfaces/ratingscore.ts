// interfaces/ratingscore.ts - อัปเดตใหม่

export interface Ratingscore {
    ID: number;
    score: number;
    created_at?: string;
    updated_at?: string;
  }
  
  // ✅ เพิ่มใหม่: Type สำหรับสร้าง rating score
  export type CreateRatingScorePayload = {
    score: number; // 1-5
  };
  
  // ✅ เพิ่มใหม่: Constants สำหรับ rating
  export const RATING_SCORES = {
    MIN: 1,
    MAX: 5,
    LABELS: {
      1: 'แย่มาก',
      2: 'แย่',
      3: 'ปานกลาง',
      4: 'ดี',
      5: 'ดีเยี่ยม'
    }
  } as const;
  
  export type RatingLabel = typeof RATING_SCORES.LABELS[keyof typeof RATING_SCORES.LABELS];