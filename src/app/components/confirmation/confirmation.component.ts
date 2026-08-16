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

  readonly currentStep = signal<number>(0); // 0-4: Questions, 5: Final Note Leaving
  readonly noteSent = signal<boolean>(false);

  readonly questions: PersonalQuestion[] = [
    { text: "What's one thing you've always wanted to ask me?", emoji: '💬', answer: '' },
    { text: "What's something you've never told me?", emoji: '🤫', answer: '' },
    { text: "What's your favorite memory of us so far?", emoji: '📸', answer: '' },
    { text: "What's something that reminds you of me?", emoji: '💭', answer: '' },
    { text: "What's one song that reminds you of us?", emoji: '🎵', answer: '' }
  ];

  ngOnInit() {
    this.telemetry.logEvent('STAGE_CHANGE', 'Opened final Questionnaire & Celebration page');
  }

  nextStep() {
    if (this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
      this.telemetry.logEvent('STAGE_CHANGE', `Moved to Questionnaire Step ${this.currentStep() + 1}`);
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
      this.telemetry.logEvent('STAGE_CHANGE', `Moved back to Questionnaire Step ${this.currentStep() + 1}`);
    }
  }

  submitAll(finalNote: string) {
    let compiledNote = '';
    const answersArr: { question: string, answer: string }[] = [];

    this.questions.forEach((q, idx) => {
      compiledNote += `**Q${idx + 1}: ${q.text}**\n*${q.answer.trim() || 'No answer'}*\n\n`;
      answersArr.push({
        question: q.text,
        answer: q.answer.trim() || 'No answer'
      });
    });
    compiledNote += `**Final Note:**\n*${finalNote.trim() || 'No note'}*`;

    this.appState.submitUserNote(compiledNote, answersArr);
    this.noteSent.set(true);
  }

  restart() {
    this.appState.reset();
  }
}
