export interface Paymentmethod {
    ID: number;
    method_name: string;
}

export interface SelectorPaymentMethod {
  id: number;
  method_name: string;
  is_active: boolean;
  icon: string;
}