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

export interface Paymentmethod {
  ID: number;
  method_name: string;
  created_at?: string;
  updated_at?: string;
}