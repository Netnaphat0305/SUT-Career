import type { Jobpost } from "./jobpost";
import type { Order } from "./order";

export interface Billableitem {
    ID: number;
    description: string;
    amount: number;
    jobpost_id: number;
    jobpost?: Jobpost;
    order_id: number;
    order?: Order;
}