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
  status: 'active' | 'pending' | 'cancelled' | 'completed' | 'paused';
  current_period_start: string | Date;
  current_period_end: string | Date;
  last_payment_date?: string | Date;
  last_payment_amount?: number;
  payment_failed_count?: number;
  last_payment_attempt?: string | Date;
  payment_due_date?: string | Date;
  cancelled_at?: string | Date;
  completed_at?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SubscriptionNotification {
  type: 'payment_due_soon' | 'payment_overdue' | 'payment_failed' | 'general';
  message: string;
  subscriptionId: string;
  severity: 'info' | 'warning' | 'error';
}

export interface WebhookPayload {
  event: string;
  payload: {
    subscription: {
      entity: RazorpaySubscription;
    };
    payment?: {
      entity: RazorpayPayment;
    };
  };
}
export interface RazorpaySubscription {
  id: string;
  entity: string;
  plan_id: string;
  customer_id: string;
  status: string;
  current_start: number;
  current_end: number;
  ended_at?: number;
  quantity: number;
  notes: Record<string, any>;
  charge_at: number;
  start_at: number;
  end_at: number;
  auth_attempts: number;
  total_count: number;
  paid_count: number;
  customer_notify: boolean;
  created_at: number;
  expire_by?: number;
  short_url?: string;
  has_scheduled_changes: boolean;
  change_scheduled_at?: number;
  source: string;
  offer_id?: string;
  remaining_count: number;
}

export interface RazorpayPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id?: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: string;
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, any>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  acquirer_data?: Record<string, any>;
  created_at: number;
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
