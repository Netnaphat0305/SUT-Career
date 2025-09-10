import type { Payment } from "./payment";
import type { Jobpost } from "./jobpost";
import type { Paymentmethod } from "./paymentmethod";
import type { Employer } from "./employer";


export interface Paymentreport {
    ID: number;
    // FK อยู่ฝั่ง payments.paymentreport_id → ส่วนนี้เป็น backref เฉย ๆ
    payment_id?: number;
    payment?: Payment;
    report_name: string;
    file_path: string;
    create_date: Date;
}

export interface PaymentReportRow {
  ID?: Paymentreport['ID'];
  reportname?: string;
  file_path?: string;
  create_date?: string;
  payment?: Payment;
  jobpost?: Jobpost;
  methodname?: Paymentmethod;
}

export interface TableDataType {
  key: React.Key;
  id?: number;
  title: string;
  method: string;
  fileName?: string;
  whenOrStatus: React.ReactNode;
  file_path?: string;
  highlight: boolean;
}

export type GenReportInputReactPDF = {
  paymentId: Payment['ID'];
  amount: Payment['amount'];
  date?: Paymentreport['create_date'];
  method_name?: Paymentmethod['method_name'];
  jobTitle?: Jobpost['title'];
  employerName?: Employer['company_name'];
  employerAddress?: Employer['address'];
  logoDataUrl: string;
};