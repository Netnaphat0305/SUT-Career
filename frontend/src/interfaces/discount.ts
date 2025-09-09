export interface Discount {
    ID: number;
    discount_name: string;
    discount_value: number;
    discount_type: string;
    valid_from: Date;
    valid_until: Date;
}