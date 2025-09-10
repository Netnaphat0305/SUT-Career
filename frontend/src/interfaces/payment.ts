// import type { Billableitem } from "./billableitem";
// import type { Paymentmethod } from "./paymentmethod";
// import type { Paymentreport } from "./paymentreport";
// import type { Status } from "./payment_status";
// import type { Discount } from "./discount";
// import type { Jobpost } from "./jobpost";

// export interface Payment {
//     ID: number;
//     billable_item_id: number;
//     billable_item?: Billableitem;
//     proof_of_payment: string;
//     amount: number;
//     datetime: Date;
//     payment_method_id: number;
//     payment_method?: Paymentmethod;
//     status_id: number;
//     status?: Status;
//     payment_report_id: number;
//     payment_report?: Paymentreport;
//     discount_id: number;
//     discount?: Discount;
// }

// export type CreatePaymentPayload = {
//     jobTitle: Jobpost['title'];
//     amount: Billableitem['amount'];
//     datetime?: Date;
//     payment_method_id: number;
//     billable_item_id: Billableitem['ID'];
//     status_id: number;
//     proof_of_payment?: string;
//     discount_id?: Discount['ID'];
// };

import type { Billableitem } from "./billableitem";
import type { Paymentmethod } from "./paymentmethod";
import type { Paymentreport } from "./paymentreport";
import type { Status } from "./payment_status";
import type { Discount } from "./discount";
import type { Jobpost } from "./jobpost";

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
  jobTitle: Jobpost['title'];
  amount: Billableitem['amount'];
  datetime?: Date;
  payment_method_id: number;
  billable_item_id: Billableitem['ID'];
  status_id: number;
  proof_of_payment?: string;
  discount_id?: Discount['ID'];
};