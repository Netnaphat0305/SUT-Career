import type { JobApplication } from "./jobApplication";
import type { Ratingscore } from "./ratingscore";

export interface Review {
    ID: number;
    job_application_id: number;
    job_application?: JobApplication;
    ratingscore_id: number;
    ratingscore?: Ratingscore;
    comment: string;
    datetime: Date | string;
}

export interface FindReviewRequest {
    job_application_id: number;
    employer_id?: number;
}

export type CreateReviewPayload = {
    ratingscore_id?: number;
    job_application_id?: number;
    comment: string;
    datetime?: Date | string;
}