import { User, Subscription, PaymentFormData, RazorpayOrder, Transaction, SubscriptionNotification, SubscriptionPayment } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
import { useAuth } from '@/hooks/useAuth';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from auth store
    const token = useAuth.getState().token;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ msg: 'Network error' }));
      throw new Error(error.msg || error.message || 'Something went wrong');
    }

    return response.json();
  }

  // Auth methods
  async register(data: { name: string; email: string; password: string }) {
    const response = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Set token and user in store after successful registration
    if (response.token) {
      useAuth.getState().login(response.user, response.token);
    }
    
    return response;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request<{
      success: boolean;
      message: string;
      token: string;
      existingUser: User
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    // Set token and user in store after successful login
    if (response.token) {
      useAuth.getState().login(response.existingUser, response.token);
    }
    
    return {
      user: response.existingUser,
      token: response.token
    };
  }

  async logout() {
    // Clear token from store
    useAuth.getState().logout();
  }

  // Payment methods
  async createOrder(data: PaymentFormData) {
    return this.request<RazorpayOrder>('/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount?: number;
  }) {
    return this.request<{ msg: string; user: User }>(
      '/api/payment/verify',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getTransactions() {
    const response = await this.request<{
      success: boolean;
      count: number;
      transactions: Transaction[]
    }>('/api/payment/transactions');
    return response.transactions;
  }

  // Subscription methods
  async createSubscription(data: { planId: string }) {
    const response = await this.request<{
      success: boolean;
      subscription: Subscription
    }>('/api/payment/subscribe', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { subscription_id: response.subscription.id };
  }

  async verifySubscription(data: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
    plan_id?: string;
    duration: string;
  }) {
    return this.request<{
      success: boolean;
      message: string;
      subscription: Subscription;
      user: User
    }>('/api/payment/verify-subscription', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSubscriptions() {
    const response = await this.request<{
      success: boolean;
      count: number;
      subscriptions: Subscription[]
    }>('/api/payment/subscriptions');
    return response.subscriptions;
  }

  async cancelSubscription(data: { subscriptionId: string }) {
    return this.request<{
      success: boolean;
      message: string;
    }>('/api/payment/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // NEW: Enhanced subscription management methods
  async getSubscriptionNotifications() {
    const response = await this.request<{
      success: boolean;
      subscriptions: Subscription[];
      notifications: SubscriptionNotification[];
    }>('/api/payment/subscriptions/notifications');
    
    return {
      subscriptions: response.subscriptions,
      notifications: response.notifications
    };
  }

  async syncSubscriptionStatus(subscriptionId: string) {
    return this.request<{
      success: boolean;
      subscription: Subscription;
      message: string;
    }>(`/api/payment/subscriptions/sync/${subscriptionId}`, {
      method: 'POST',
    });
  }

  // NEW: Get detailed subscription info
  async getSubscriptionDetails(subscriptionId: string) {
    return this.request<{
      success: boolean;
      subscription: Subscription;
    }>(`/api/payment/subscriptions/${subscriptionId}`);
  }

  // NEW: Update subscription (pause/resume if needed)
  async updateSubscription(subscriptionId: string, data: { action: 'pause' | 'resume' }) {
    return this.request<{
      success: boolean;
      subscription: Subscription;
      message: string;
    }>(`/api/payment/subscriptions/${subscriptionId}/update`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // NEW: Get subscription payment history
  async getSubscriptionPayments(subscriptionId: string) {
    return this.request<{
      success: boolean;
      payments: SubscriptionPayment[];
    }>(`/api/payment/subscriptions/${subscriptionId}/payments`);
  }
}

export const api = new ApiClient();