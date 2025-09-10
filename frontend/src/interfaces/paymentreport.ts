import type { Payment } from './payment'

export interface Paymentreport {
    ID: number;
    // FK อยู่ฝั่ง payments.paymentreport_id → ส่วนนี้เป็น backref เฉย ๆ
    payment_id?: number;
    payment?: Payment;
    report_name: string;
    file_path: string;
    create_date: Date;
}