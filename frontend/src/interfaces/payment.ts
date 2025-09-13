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
  created_at?: string;
  updated_at?: string;
}

export type CreatePaymentPayload = {
  jobTitle: number;
  amount: number;
  datetime?: Date;
  payment_method_id: number;
  billable_item_id: number;
  status_id: number;
  proof_of_payment?: string;
  discount_id?: number;
};

// ------------- Student Finance ----------------
export interface StudentFinance {
  student_id: number;
  job_id: number;
  jobTitle: string;
  amount: number;
  status_id: number;
  datetime?: Date;
}

export interface StudentFinanceResponse {
  data: StudentFinance[];
}

export interface FinanceSummary {
  monthlyJobCount: number;
  totalJobCount: number;
  totalEarnings: number;
}

export interface FinanceSummaryResponse {
  data: FinanceSummary;
}