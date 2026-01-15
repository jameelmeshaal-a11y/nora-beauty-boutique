import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoreSettings {
  id: string;
  show_supplier_name: boolean;
  allow_supplier_registration: boolean;
  min_order_amount: number;
  free_shipping_threshold: number;
  updated_at: string;
}

export const useStoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as StoreSettings | null);
    } catch (error) {
      console.error('Error fetching store settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<StoreSettings>) => {
    if (!settings) return;

    try {
      const { data, error } = await supabase
        .from('store_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data as StoreSettings);
      return data;
    } catch (error) {
      console.error('Error updating store settings:', error);
      throw error;
    }
  };

  return {
    settings,
    isLoading,
    updateSettings,
    refetch: fetchSettings,
  };
};
