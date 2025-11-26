export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'user';

export type SubscriptionPlan = 'free' | 'basic' | 'premium';

export type Badge = 'bronze' | 'diamond' | 'gold_star';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  real_name: string;
  father_name: string;
  whatsapp_number: string;
  medical_id_card_url?: string;
  batch_year: string;
  class_or_degree: string;
  profile_photo?: string;
  bio?: string;
  
  role: UserRole;
  plan: SubscriptionPlan;
  badge: Badge;
  
  verification_status: VerificationStatus;
  is_blocked: boolean;
  
  // Quota overrides (admin can set custom limits)
  custom_daily_mcqs?: number;
  custom_daily_flashcards?: number;
  custom_daily_definitions?: number;
  custom_daily_pdfs?: number;
  
  created_at: Date;
  approved_at?: Date;
  approved_by?: string;
}

export interface DailyUsage {
  uid: string;
  date: string; // YYYY-MM-DD
  mcqs_used: number;
  flashcards_used: number;
  definitions_used: number;
  pdfs_generated: number;
  true_false_used: number;
}

export interface PlanQuotas {
  mcqs: number;
  flashcards: number;
  definitions: number;
  pdfs: number;
  true_false: number;
}

export const DEFAULT_PLAN_QUOTAS: Record<SubscriptionPlan, PlanQuotas> = {
  free: {
    mcqs: 30,
    flashcards: 30,
    definitions: 30,
    pdfs: 2,
    true_false: 30
  },
  basic: {
    mcqs: 60,
    flashcards: 60,
    definitions: 60,
    pdfs: 10,
    true_false: 60
  },
  premium: {
    mcqs: 200,
    flashcards: 200,
    definitions: 200,
    pdfs: 999,
    true_false: 200
  }
};

export const PLAN_BADGES: Record<SubscriptionPlan, Badge> = {
  free: 'bronze',
  basic: 'diamond',
  premium: 'gold_star'
};

export interface Payment {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  amount: number;
  payment_method: 'easypaisa';
  transaction_ref?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  paid_at: Date;
  expires_at: Date;
  confirmed_by?: string;
  confirmed_at?: Date;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  admin_email: string;
  action_type: string;
  target_user_id?: string;
  details: any;
  timestamp: Date;
}

export interface AppSettings {
  app_enabled: boolean;
  maintenance_message?: string;
  plan_quotas: Record<SubscriptionPlan, PlanQuotas>;
  plan_prices: Record<SubscriptionPlan, number>;
}
