import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // ==========================================
  // PASTE YOUR SUPABASE CREDENTIALS HERE!
  // ==========================================
  private readonly supabaseUrl = 'https://erjavcgpsfncnoecgtrz.supabase.co'; 
  private readonly supabaseKey = 'sb_publishable_P8t2mMm_eXjZBa5BjW7i0A_NcejVHpF'; 

  private supabase: SupabaseClient | null = null;

  constructor() {
    if (this.supabaseUrl && this.supabaseKey) {
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }
  }

  /**
   * Uploads her selfie/photo to a public storage bucket in Supabase called 'date-photos'
   */
  async uploadPhoto(file: File): Promise<string | null> {
    if (!this.supabase) {
      console.warn('[Supabase] Client not initialized. Skipping upload.');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      // Upload to the 'date-photos' bucket
      const { data, error } = await this.supabase.storage
        .from('date-photos')
        .upload(filePath, file);

      if (error) {
        console.error('[Supabase] File upload failed:', error);
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('date-photos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('[Supabase] Upload error:', e);
      return null;
    }
  }

  /**
   * Saves the entire date plan payload to your PostgreSQL 'date_plans' table
   */
  async saveDatePlan(payload: {
    cuisine: string;
    meeting_spot: string;
    date: string;
    dodge_count: number;
    questions_answers: any;
    final_note: string;
    photo_url: string;
  }) {
    if (!this.supabase) {
      console.warn('[Supabase] Client not initialized. Skipping database save.');
      return;
    }

    const { data, error } = await this.supabase
      .from('date_plans')
      .insert([payload]);

    if (error) {
      console.error('[Supabase] Database save failed:', error);
      throw error;
    }

    console.log('[Supabase] Plan successfully saved to database!', data);
  }
}
