import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';

interface PersonalQuestion {
  text: string;
  emoji: string;
  answer: string;
}

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent implements OnInit {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  readonly currentStep = signal<number>(0); // 0-4: Questions

  readonly questions: PersonalQuestion[] = [
    { text: "What's one thing you've always wanted to ask me?", emoji: '💬', answer: '' },
    { text: "What's something you've never told me?", emoji: '🤫', answer: '' },
    { text: "What's your favorite memory of us so far?", emoji: '📸', answer: '' },
    { text: "What's something that reminds you of me?", emoji: '💭', answer: '' },
    { text: "What's one song that reminds you of us?", emoji: '🎵', answer: '' }
  ];

  ngOnInit() {
    this.telemetry.logEvent('STAGE_CHANGE', 'Opened Questions page 💬');
  }

  nextStep() {
    const currentIdx = this.currentStep();
    if (currentIdx < 4) {
      const q = this.questions[currentIdx];
      // Send the question answer to Discord instantly!
      if (q && q.answer.trim()) {
        this.telemetry.sendQuestionAnswerToDiscord(currentIdx + 1, q.text, q.answer.trim());
      }
      this.currentStep.update(s => s + 1);
      this.telemetry.logEvent('STAGE_CHANGE', `Moved to Questionnaire Step ${this.currentStep() + 1}`);
    } else {
      // Question 5 finished -> send to Discord and advance to Leave Note (Stage 7)!
      const q = this.questions[4];
      if (q && q.answer.trim()) {
        this.telemetry.sendQuestionAnswerToDiscord(5, q.text, q.answer.trim());
      }
      this.appState.setStage(7);
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
      this.telemetry.logEvent('STAGE_CHANGE', `Moved back to Questionnaire Step ${this.currentStep() + 1}`);
    }
  }
}
