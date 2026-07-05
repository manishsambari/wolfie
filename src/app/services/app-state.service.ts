import { Injectable, computed, inject, signal } from '@angular/core';
import { TelemetryService } from './telemetry.service';
import { SupabaseService } from './supabase.service';

interface ActivityEvent {
  id: number;
  timestamp: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private telemetry = inject(TelemetryService);
  private supabase = inject(SupabaseService);

  readonly currentStage = signal<number>(0);
  readonly uploadedPhotoUrl = signal<string>('');
  readonly dodgeCount = signal<number>(0);
  readonly selectedCuisine = signal<string>('Dessert 🍰');
  readonly place = signal<string>('Shimla Cafe ☕');
  readonly selectedDate = signal<string>('2026-10-10');
  readonly userNote = signal<string>('');
  
  // Expose telemetry logs to the template for debugging panel compatibility
  readonly activityHistory = computed<ActivityEvent[]>(() => {
    return this.telemetry.getEvents().map((e, idx) => ({
      id: idx,
      timestamp: e.timestamp,
      message: e.details
    }));
  });

  // Yes button scale starts at 1.0 and grows by 0.25 per dodge, capped at 2.5
  readonly yesButtonScale = computed(() => {
    const scale = 1 + this.dodgeCount() * 0.25;
    return Math.min(scale, 2.5);
  });

  // Calculate the day countdown from today to selectedDate
  readonly countdownDays = computed(() => {
    const dateStr = this.selectedDate();
    if (!dateStr) return null;
    
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  });

  readonly isConfirmed = computed(() => {
    return this.place().trim() !== '' && this.selectedDate() !== '';
  });

  // Heart burst overlay state
  readonly showHeartBurst = signal<boolean>(false);

  initHistory() {
    // Set initial history state if not already set
    if (!window.history.state || typeof window.history.state.stage !== 'number') {
      window.history.replaceState({ stage: 0 }, 'Stage 0');
    }
    this.telemetry.logEvent('STAGE_CHANGE', `App opened on Stage ${this.currentStage()}`);
  }

  setStage(stage: number, pushHistory = true) {
    this.currentStage.set(stage);
    this.telemetry.logEvent('STAGE_CHANGE', `Transitioned to Stage ${stage}`);
    if (pushHistory) {
      window.history.pushState({ stage }, `Stage ${stage}`);
    }
  }

  goBack() {
    const current = this.currentStage();
    let prevStage = 0;
    if (current === 5) {
      prevStage = 4;
    } else if (current === 4) {
      prevStage = 3;
    } else if (current === 3) {
      prevStage = 2;
    } else if (current === 2) {
      prevStage = 1;
    } else if (current === 1) {
      prevStage = 0;
    }

    this.setStage(prevStage, false);

    try {
      window.history.back();
    } catch (e) {
      // Ignore if browser history stack is empty
    }
  }

  incrementDodge() {
    this.dodgeCount.update(c => c + 1);
  }

  setCuisine(cuisine: string) {
    this.selectedCuisine.set(cuisine);
    this.telemetry.logEvent('CUISINE_SELECT', `Selected cuisine mood: "${cuisine}"`);
  }

  setPlaceAndDate(place: string, date: string) {
    this.place.set(place);
    this.selectedDate.set(date);
    this.telemetry.logEvent('FORM_SUBMIT', `Submitted final date details - Spot: "${place}", Date: "${date}"`);
    
    // Fire the logs to Discord
    this.telemetry.sendLogsToDiscord(place, date, this.selectedCuisine(), this.dodgeCount(), '');
  }

  submitUserNote(note: string, answers: { question: string, answer: string }[]) {
    this.userNote.set(note);
    this.telemetry.logEvent('NOTE_OPEN', `Akriti sent you a note: "${note}" 📝`);
    
    // Send final logs to Discord including the note
    this.telemetry.sendLogsToDiscord(
      this.place(),
      this.selectedDate(),
      this.selectedCuisine(),
      this.dodgeCount(),
      note
    );

    // Save Date Plan backup to Supabase (including the detailed answers & telemetry click timeline!)
    this.supabase.saveDatePlan({
      cuisine: this.selectedCuisine(),
      meeting_spot: this.place(),
      date: this.selectedDate(),
      dodge_count: this.dodgeCount(),
      questions_answers: { 
        answers: answers,
        timeline: this.telemetry.getEvents(), // Saves every click / dodge she ever performed
        device_info: this.telemetry.getDeviceInfo()
      },
      final_note: note,
      photo_url: this.uploadedPhotoUrl()
    }).catch(err => console.error('[Supabase] Failed to backup plan to DB:', err));
  }

  triggerHeartBurst() {
    this.telemetry.logEvent('YES_CLICK', "Accepted the proposal! (Clicked 'Yes, let's go')");
    this.showHeartBurst.set(true);
    setTimeout(() => {
      this.showHeartBurst.set(false);
      this.setStage(2);
    }, 1500);
  }

  reset() {
    this.telemetry.logEvent('STAGE_CHANGE', 'Reset proposal card path to start over');
    this.dodgeCount.set(0);
    this.selectedCuisine.set('');
    this.place.set('');
    this.selectedDate.set('');
    this.userNote.set('');
    this.showHeartBurst.set(false);
    this.setStage(0);
  }
}
