import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

class SupabaseService {
  constructor() {
    this.client = null;
    this.initClient();
  }

  initClient() {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummykey';

    try {
      this.client = createClient(supabaseUrl, supabaseKey);
      console.log('[SupabaseService] Supabase client initialized for database operations.');
    } catch (err) {
      console.warn('[SupabaseService] Supabase fallback to local memory store:', err.message);
      this.client = null;
    }
  }

  async getUsers() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from('users').select('*');
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[SupabaseService] Error querying users table:', err.message);
      return null;
    }
  }

  async getDocuments() {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from('documents').select('*');
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[SupabaseService] Error querying documents table:', err.message);
      return null;
    }
  }

  async logAudit(event) {
    if (!this.client) return null;
    try {
      const { data, error } = await this.client.from('audit_logs').insert([event]);
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('[SupabaseService] Error inserting audit log:', err.message);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
