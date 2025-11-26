import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DailyUsage, DEFAULT_PLAN_QUOTAS, PlanQuotas } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';

export const useQuotas = () => {
  const { profile } = useAuth();
  const [dailyUsage, setDailyUsage] = useState<DailyUsage | null>(null);
  const [quotas, setQuotas] = useState<PlanQuotas | null>(null);
  const [loading, setLoading] = useState(true);

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const fetchDailyUsage = async () => {
    if (!profile) return;

    const today = getTodayString();
    const usageRef = doc(db, 'daily_usage', `${profile.uid}_${today}`);
    
    try {
      const usageSnap = await getDoc(usageRef);
      
      if (usageSnap.exists()) {
        setDailyUsage(usageSnap.data() as DailyUsage);
      } else {
        // Initialize today's usage
        const newUsage: DailyUsage = {
          uid: profile.uid,
          date: today,
          mcqs_used: 0,
          flashcards_used: 0,
          definitions_used: 0,
          pdfs_generated: 0,
          true_false_used: 0
        };
        await setDoc(usageRef, newUsage);
        setDailyUsage(newUsage);
      }
    } catch (error) {
      console.error('Error fetching daily usage:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      // Set quotas (custom or default)
      const userQuotas: PlanQuotas = {
        mcqs: profile.custom_daily_mcqs ?? DEFAULT_PLAN_QUOTAS[profile.plan].mcqs,
        flashcards: profile.custom_daily_flashcards ?? DEFAULT_PLAN_QUOTAS[profile.plan].flashcards,
        definitions: profile.custom_daily_definitions ?? DEFAULT_PLAN_QUOTAS[profile.plan].definitions,
        pdfs: profile.custom_daily_pdfs ?? DEFAULT_PLAN_QUOTAS[profile.plan].pdfs,
        true_false: DEFAULT_PLAN_QUOTAS[profile.plan].true_false
      };
      
      setQuotas(userQuotas);
      fetchDailyUsage().then(() => setLoading(false));
    }
  }, [profile]);

  const incrementUsage = async (type: keyof Omit<DailyUsage, 'uid' | 'date'>, amount: number) => {
    if (!profile || !dailyUsage) return false;

    const today = getTodayString();
    const usageRef = doc(db, 'daily_usage', `${profile.uid}_${today}`);

    try {
      const newValue = (dailyUsage[type] || 0) + amount;
      await updateDoc(usageRef, { [type]: newValue });
      
      setDailyUsage(prev => prev ? { ...prev, [type]: newValue } : null);
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  const canGenerate = (type: 'mcqs' | 'flashcards' | 'definitions' | 'pdfs' | 'true_false', amount: number) => {
    if (!quotas || !dailyUsage) return false;
    
    const used = dailyUsage[`${type}_used` as keyof DailyUsage] as number || 0;
    const limit = quotas[type === 'true_false' ? 'true_false' : type];
    
    return (used + amount) <= limit;
  };

  const getRemainingQuota = (type: 'mcqs' | 'flashcards' | 'definitions' | 'pdfs' | 'true_false') => {
    if (!quotas || !dailyUsage) return 0;
    
    const used = dailyUsage[`${type}_used` as keyof DailyUsage] as number || 0;
    const limit = quotas[type === 'true_false' ? 'true_false' : type];
    
    return Math.max(0, limit - used);
  };

  return {
    dailyUsage,
    quotas,
    loading,
    canGenerate,
    incrementUsage,
    getRemainingQuota,
    refreshUsage: fetchDailyUsage
  };
};
