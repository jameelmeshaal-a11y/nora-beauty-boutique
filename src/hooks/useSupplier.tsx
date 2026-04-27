import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Supplier {
  id: string;
  user_id: string;
  company_name: string;
  company_name_ar: string | null;
  company_name_ru: string | null;
  logo_url: string | null;
  description: string | null;
  description_ar: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  address_ar: string | null;
  bank_account: string | null;
  total_sales: number | null;
  country: string | null;
  rating: number;
  reviews_count: number;
  is_verified: boolean;
  is_active: boolean;
  commission_rate: number;
  created_at: string;
}

export const useSupplier = () => {
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupplier, setIsSupplier] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSupplier();
      checkSupplierRole();
    } else {
      setSupplier(null);
      setIsSupplier(false);
      setIsLoading(false);
    }
  }, [user]);

  const checkSupplierRole = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'supplier')
        .maybeSingle();
      
      setIsSupplier(!!data);
    } catch (error) {
      console.error('Error checking supplier role:', error);
    }
  };

  const fetchSupplier = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching supplier:', error);
      }
      
      setSupplier(data as Supplier | null);
    } catch (error) {
      console.error('Error fetching supplier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const registerAsSupplier = async (supplierData: {
    company_name: string;
    company_name_ar?: string;
    description?: string;
    description_ar?: string;
    contact_email?: string;
    contact_phone?: string;
    address?: string;
    address_ar?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        user_id: user.id,
        ...supplierData,
      })
      .select()
      .single();

    if (error) throw error;

    // Add supplier role
    await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'supplier' as any,
      });

    setSupplier(data as Supplier);
    setIsSupplier(true);
    return data;
  };

  const updateSupplier = async (updates: Partial<Supplier>) => {
    if (!supplier) throw new Error('No supplier found');

    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', supplier.id)
      .select()
      .single();

    if (error) throw error;
    setSupplier(data as Supplier);
    return data;
  };

  return {
    supplier,
    isLoading,
    isSupplier,
    registerAsSupplier,
    updateSupplier,
    refetch: fetchSupplier,
  };
};
