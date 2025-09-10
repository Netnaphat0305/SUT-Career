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
  methodname?: string; // เผื่อ backend ส่งมาแบบเก่า
  created_at?: string;
  updated_at?: string;
}