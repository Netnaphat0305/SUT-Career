import type { Jobpost } from "./jobpost"
import type { Ratingscore } from "./ratingscore";

export interface Review {
    id: number;
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
}