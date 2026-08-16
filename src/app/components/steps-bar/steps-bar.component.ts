import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

interface Step {
  stage: number;
  label: string;
  subtitle: string;
  emoji: string;
}

@Component({
  selector: 'app-steps-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './steps-bar.component.html',
  styleUrl: './steps-bar.component.css'
})
export class StepsBarComponent {
  protected appState = inject(AppStateService);

  readonly isDrawerOpen = signal<boolean>(false);

  readonly steps: Step[] = [
    { stage: 0, label: 'Intro', subtitle: '1,400 KM distance counter', emoji: '🏡' },
    { stage: 1, label: 'Proposal', subtitle: 'Will you go out with me?', emoji: '💌' },
    { stage: 2, label: 'Cuisine', subtitle: 'Food mood selector', emoji: '🍕' },
    { stage: 3, label: 'Details', subtitle: 'Spot & date calendar', emoji: '📅' },
    { stage: 4, label: 'Quiz', subtitle: 'Memory checkpoint & photo', emoji: '✨' },
    { stage: 5, label: 'Letter', subtitle: "Manish's secret letter", emoji: '✉️' },
    { stage: 6, label: 'Questions', subtitle: '5 questions about us', emoji: '💬' },
    { stage: 7, label: 'Your Note', subtitle: 'Leave a note for Manish', emoji: '📝' },
    { stage: 8, label: 'Finish', subtitle: 'Chai & Punjabi songs', emoji: '💖' }
  ];

  toggleDrawer() {
    this.isDrawerOpen.update(v => !v);
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
  }

  navigateToStage(stage: number) {
    this.appState.setStage(stage);
    this.closeDrawer();
  }
}
