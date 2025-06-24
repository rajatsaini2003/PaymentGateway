export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Transaction {
  _id: string;
  user: string;
  amount: number;
  currency: string;
  paymentId: string;
  status: 'success' | 'failed' | 'pending';
  createdAt: string;
  updatedAt?: string;
}
export interface PendingInvoice {
  short_url: string;
  invoice_id: string;
  amount: number; // Amount in paise (multiply by 100 for rupees)
  due_date: number; // Unix timestamp
}

export interface Subscription {
  _id: string;
  user: string;
  razorpay_subscription_id: string;
  razorpay_plan_id: string;
  status: 'created' | 'active' | 'cancelled' | 'completed' | 'pending';
  current_period_start: string;
  current_period_end: string;
  createdAt: string;
  updatedAt?: string;
  pending_invoice?: PendingInvoice | null;
}
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentFormData {
  amount: number;
  currency?: string;
}
