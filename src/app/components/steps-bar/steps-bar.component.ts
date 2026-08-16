import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

interface Step {
  stage: number;
  label: string;
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

  readonly steps: Step[] = [
    { stage: 0, label: 'Intro', emoji: '🏡' },
    { stage: 1, label: 'Proposal', emoji: '💌' },
    { stage: 2, label: 'Cuisine', emoji: '🍕' },
    { stage: 3, label: 'Details', emoji: '📅' },
    { stage: 4, label: 'Quiz', emoji: '✨' },
    { stage: 5, label: 'Success', emoji: '💖' }
  ];

  navigateToStage(stage: number) {
    this.appState.setStage(stage);
  }
}
