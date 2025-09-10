import type { Addonservice } from "./addonservice";
import type { Employer } from "./employer";

export interface Order {
    ID: number;
    order_name: string;
    description: string;
    order_date: string;
    amount: number;
    service_start_date: Date;
    service_end_date: Date;
    addon_services_id: number;
    addon_service?: Addonservice;
    employer_id: number;
    employer?: Employer;
}