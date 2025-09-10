import type { Billableitem } from "./billableitem";
import type { Paymentmethod } from "./paymentmethod";
import type { Paymentreport } from "./paymentreport";
import type { Status } from "./payment_status";
import type { Discount } from "./discount";

export interface Payment {
    ID: number;
    billable_item_id: number;
    billable_item?: Billableitem;
    proof_of_payment: string;
    amount: number;
    datetime: Date;
    payment_method_id: number;
    payment_method?: Paymentmethod;
    status_id: number;
    status?: Status;
    payment_report_id: number;
    payment_report?: Paymentreport;
    discount_id: number;
    discount?: Discount;
}

export type CreatePaymentPayload = {
    amount: number;
    datetime?: Date;
    payment_method_id: number;
    billable_item_id?: number;
    status_id?: number;
    proof_of_payment?: string;
    discount_id?: number;
};