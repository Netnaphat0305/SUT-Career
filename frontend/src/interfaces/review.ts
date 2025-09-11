// interfaces/review.ts - อัปเดตใหม่

import type { Jobpost } from "./jobpost";
import type { Ratingscore } from "./ratingscore";

export interface Review {
  ID: number;
  jobpost_id: number;
  jobpost?: Jobpost;
  ratingscore_id: number;
  ratingscore?: Ratingscore;
  comment: string;
  datetime: Date | string;
}

export interface FindReviewRequest {
  jobpost_id: number;
  employer_id?: number;
}

export type CreateReviewPayload = {
  ratingscore_id?: Ratingscore['ID'];
  jobpost_id?: number;
  comment: string;
  datetime?: Date | string;
};

// ✅ เพิ่มใหม่: Interface สำหรับแสดงผลรีวิว
export interface ReviewDisplay {
  ID: number;
  comment: string;
  datetime: Date | string;
  rating: number;
  reviewer?: {
    name?: string;
    avatar?: string;
  };
}

// ✅ เพิ่มใหม่: Interface สำหรับสถิติรีวิว
export interface ReviewStats {
  average: number;
  count: number;
  distribution?: {
    [key: number]: number; // key: rating score (1-5), value: count
  };
}