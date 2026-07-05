import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';

interface CalendarDay {
  date: Date | null;
  label: string;
  isPast: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-date-place-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe],
  templateUrl: './date-place-form.component.html',
  styleUrl: './date-place-form.component.css'
})
export class DatePlaceFormComponent implements OnInit {
  protected appState = inject(AppStateService);

  readonly minDate = signal<string>('');
  readonly distance = signal<number>(1400);
  readonly isClosingIn = signal<boolean>(false);

  // Custom Calendar Picker State Signals
  readonly calendarOpen = signal<boolean>(false);
  readonly weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  readonly viewedMonth = signal<number>(0); // 0-indexed
  readonly viewedYear = signal<number>(0);
  readonly currentMonthName = signal<string>('');
  readonly calendarDays = signal<CalendarDay[]>([]);
  readonly monthsList = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  readonly yearsList = [2026, 2027, 2028, 2029, 2030, 2031];
  readonly selectedDateVal = signal<string>('');

  // Morphing Adventure Prep Signals
  readonly prepStep = signal<number>(0);
  readonly prepText = signal<string>('Planning the adventure...');

  readonly datePlaceForm = new FormGroup({
    place: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  // Human-readable selected date for trigger label
  readonly selectedDateFormatted = computed(() => {
    const rawVal = this.selectedDateVal();
    if (!rawVal) return '';
    // Use raw parts to avoid timezone shifting
    const parts = rawVal.split('-');
    if (parts.length !== 3) return rawVal;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    const dateObj = new Date(year, month, day);
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return formatter.format(dateObj);
  });

  ngOnInit() {
    // Set min date to today's date formatted as YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate.set(`${year}-${month}-${day}`);

    // Initialize calendar view variables
    this.viewedMonth.set(today.getMonth());
    this.viewedYear.set(today.getFullYear());
    this.generateCalendar();
  }

  toggleCalendar() {
    this.calendarOpen.update(val => !val);
    if (this.calendarOpen()) {
      this.generateCalendar();
    }
  }

  onMonthChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.viewedMonth.set(parseInt(select.value, 10));
    this.generateCalendar();
  }

  onYearChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.viewedYear.set(parseInt(select.value, 10));
    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.viewedYear();
    const month = this.viewedMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days: CalendarDay[] = [];
    
    // Weekday layout offset padding
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, label: '', isPast: true, isSelected: false });
    }
    
    // Populate grid dates
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const dateObj = new Date(year, month, dayNum);
      const isPast = dateObj.getTime() < today.getTime();
      
      const selectedStr = this.selectedDateVal();
      let isSelected = false;
      if (selectedStr) {
        const parts = selectedStr.split('-');
        if (parts.length === 3) {
          const sy = parseInt(parts[0], 10);
          const sm = parseInt(parts[1], 10) - 1;
          const sd = parseInt(parts[2], 10);
          isSelected = (y => y.getFullYear() === sy && y.getMonth() === sm && y.getDate() === sd)(dateObj);
        }
      }
      
      days.push({
        date: dateObj,
        label: String(dayNum),
        isPast,
        isSelected
      });
    }
    
    this.calendarDays.set(days);
    
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
    this.currentMonthName.set(formatter.format(firstDay));
  }

  prevMonth() {
    let m = this.viewedMonth() - 1;
    let y = this.viewedYear();
    if (m < 0) {
      m = 11;
      y--;
    }
    this.viewedMonth.set(m);
    this.viewedYear.set(y);
    this.generateCalendar();
  }

  nextMonth() {
    let m = this.viewedMonth() + 1;
    let y = this.viewedYear();
    if (m > 11) {
      m = 0;
      y++;
    }
    this.viewedMonth.set(m);
    this.viewedYear.set(y);
    this.generateCalendar();
  }

  selectDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    
    this.datePlaceForm.patchValue({ date: dateStr });
    this.selectedDateVal.set(dateStr);
    this.generateCalendar();
    this.calendarOpen.set(false); // Autoclose on selection
  }

  onConfirm() {
    if (this.datePlaceForm.invalid) return;

    this.isClosingIn.set(true);
    this.datePlaceForm.disable();

    // Step 1: Planning the adventure...
    this.prepStep.set(1);
    this.prepText.set('Planning the adventure...');

    // Step 2: Date Locked 📅 (after 1.2s)
    setTimeout(() => {
      this.prepStep.set(2);
      this.prepText.set('Date Locked 📅');
    }, 1200);

    // Step 3: Mission Accepted 🐉 (after 2.4s)
    setTimeout(() => {
      this.prepStep.set(3);
      this.prepText.set('Mission Accepted 🐉');
    }, 2400);

    // Step 4: Countdown start text (after 3.6s)
    setTimeout(() => {
      this.prepStep.set(4);
      this.prepText.set('The dragon has officially started counting down...');
    }, 3600);

    // Transition to confirmation success page (after 5.0s)
    setTimeout(() => {
      const formValues = this.datePlaceForm.getRawValue();
      this.appState.setPlaceAndDate(formValues.place, formValues.date);
      this.appState.setStage(4);
    }, 5000);
  }
}
