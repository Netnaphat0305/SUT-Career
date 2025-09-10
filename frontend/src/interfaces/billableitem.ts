// import type { Jobpost } from "./jobpost";
// import type { Order } from "./order";

// export interface Billableitem {
//     ID: number;
//     description: string;
//     amount: number;
//     jobpost_id: number;
//     jobpost?: Jobpost;
//     order_id: number;
//     order?: Order;
// }

export interface SalaryTypeForBill {
    id: number;
    salary_type_name: string;
}

export interface JobpostForBill {
    ID: number;
    title: string;
    salary: number;
    salary_type_id: number;
}

export interface OrderForBill {
    ID: number;
    order_name: string;
    amount: number;
}

// export type CreateBillableitemPayload = {
//   amount: JobpostForBill['salary'] | OrderForBill['amount'];
//   description?: JobpostForBill['title'] | OrderForBill['order_name'];
//   jobpost_id?: JobpostForBill['ID'];
//   order_id?: OrderForBill['ID'];
// };

export interface Billableitem {
  ID: number;
  amount: number;
  description: string;
  jobpost_id?: number;
  jobpost?: {
    ID: number;
    title: string;
    employer_id?: number;
    employer?: {
      ID: number;
      company_name: string;
      address: string;
    };
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateBillableitemPayload {
  jobpost_id: number;
  description?: string;
}