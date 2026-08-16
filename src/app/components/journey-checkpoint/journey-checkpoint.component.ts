import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';

interface TypedQuestion {
  text: string;
  placeholder: string;
  checkAnswer: (typed: string) => boolean;
  hint: string;
}

@Component({
  selector: 'app-journey-checkpoint',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journey-checkpoint.component.html',
  styleUrl: './journey-checkpoint.component.css'
})
export class JourneyCheckpointComponent implements OnInit, AfterViewChecked {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

  readonly questions: TypedQuestion[] = [
    {
      text: 'What do you think, will we ever gonna meet?',
      placeholder: 'Type your answer...',
      checkAnswer: (typed: string) => {
        const val = typed.trim().toLowerCase();
        return (
          val === 'no' ||
          val === 'nope' ||
          val === 'nah' ||
          val === 'never' ||
          val === 'n' ||
          val === 'na' ||
          val === 'nhi' ||
          val === 'nahi' ||
          val === 'nahin' ||
          val === 'no way' ||
          val.startsWith('no') ||
          val.startsWith('nah')
        );
      },
      hint: "Try typing 'No' 😉"
    },
    {
      text: 'Do you ever gonna love me again?',
      placeholder: 'Type your answer...',
      checkAnswer: (typed: string) => {
        const val = typed.trim().toLowerCase();
        return (
          val === 'no' ||
          val === 'nope' ||
          val === 'nah' ||
          val === 'never' ||
          val === 'n' ||
          val === 'na' ||
          val === 'nhi' ||
          val === 'nahi' ||
          val === 'nahin' ||
          val === 'no way' ||
          val.startsWith('no') ||
          val.startsWith('nah')
        );
      },
      hint: "Think carefully... try 'No' 🙃"
    },
    {
      text: 'Did you ever think I never loved you?',
      placeholder: 'Type your answer...',
      checkAnswer: (typed: string) => {
        const val = typed.trim().toLowerCase();
        return (
          val === 'yes' ||
          val === 'y' ||
          val === 'yeah' ||
          val === 'yep' ||
          val === 'always' ||
          val === 'ha' ||
          val === 'haa' ||
          val === 'haan' ||
          val === 'true' ||
          val === 'of course' ||
          val.startsWith('ye') ||
          val.startsWith('ya')
        );
      },
      hint: "You always think that... try typing 'Yes' 💭"
    },
    {
      text: 'Do you think I will ever stop caring about you?',
      placeholder: 'Type your answer...',
      checkAnswer: (typed: string) => {
        const val = typed.trim().toLowerCase();
        return (
          val === 'no' ||
          val === 'nope' ||
          val === 'nah' ||
          val === 'never' ||
          val === 'n' ||
          val === 'na' ||
          val === 'nhi' ||
          val === 'nahi' ||
          val === 'nahin' ||
          val === 'no way' ||
          val.startsWith('no') ||
          val.startsWith('nah')
        );
      },
      hint: "Never gonna happen... try typing 'No' 🤍"
    },
    {
      text: 'Do you think we will ever talk again?',
      placeholder: 'Type your answer...',
      checkAnswer: (typed: string) => {
        const val = typed.trim().toLowerCase();
        return (
          val === 'no' ||
          val === 'nope' ||
          val === 'nah' ||
          val === 'never' ||
          val === 'n' ||
          val === 'na' ||
          val === 'nhi' ||
          val === 'nahi' ||
          val === 'nahin' ||
          val === 'no way' ||
          val.startsWith('no') ||
          val.startsWith('nah')
        );
      },
      hint: "Try typing 'No' 💬"
    }
  ];

  // Component stage flags
  readonly quizStarted = signal<boolean>(false);
  readonly currentQuestionIndex = signal<number>(0);
  readonly filledHearts = signal<number>(0);
  readonly typedAnswer = signal<string>('');
  
  // Feedback flags
  readonly feedbackMessage = signal<string>('');
  readonly isShaking = signal<boolean>(false);
  readonly isCorrectAnswerSelected = signal<boolean>(false);

  // Transition & Animation flags
  readonly allQuestionsAnswered = signal<boolean>(false);
  readonly showMissionComplete = signal<boolean>(false);
  readonly glowHearts = signal<boolean>(false);

  private focusPending = false;

  ngOnInit() {
    this.telemetry.logEvent('JOURNEY_CHECKPOINT_START', 'Opened Journey Checkpoint Intro');
  }

  ngAfterViewChecked() {
    if (this.focusPending && this.answerInput) {
      this.answerInput.nativeElement.focus();
      this.focusPending = false;
    }
  }

  startQuiz() {
    this.quizStarted.set(true);
    this.focusPending = true;
    this.telemetry.logEvent('STAGE_CHANGE', 'Started Journey Checkpoint Questions');
  }

  submitAnswer() {
    const typed = this.typedAnswer();
    if (!typed.trim() || this.isCorrectAnswerSelected()) return;

    const currentQuestion = this.questions[this.currentQuestionIndex()];

    if (currentQuestion.checkAnswer(typed)) {
      // Correct!
      this.isCorrectAnswerSelected.set(true);
      const newFilledHearts = this.filledHearts() + 1;
      this.filledHearts.set(newFilledHearts);
      this.feedbackMessage.set('');
      
      this.telemetry.logEvent('QUIZ_CORRECT', `Correctly typed answer for Q${this.currentQuestionIndex() + 1}: "${typed}"`);

      // Transition smoothly to next question or completion
      setTimeout(() => {
        this.transitionToNextQuestion();
      }, 700);
    } else {
      // Wrong!
      this.feedbackMessage.set(`Not quite 😋 Hint: ${currentQuestion.hint}`);
      this.isShaking.set(true);
      
      this.telemetry.logEvent('QUIZ_WRONG', `Incorrect typed answer for Q${this.currentQuestionIndex() + 1}: "${typed}"`);

      setTimeout(() => {
        this.isShaking.set(false);
      }, 500);
    }
  }

  transitionToNextQuestion() {
    if (this.currentQuestionIndex() < this.questions.length - 1) {
      this.currentQuestionIndex.update(idx => idx + 1);
      this.isCorrectAnswerSelected.set(false);
      this.typedAnswer.set('');
      this.feedbackMessage.set('');
      this.focusPending = true;
    } else {
      this.allQuestionsAnswered.set(true);
      this.handleQuizCompletion();
    }
  }

  private handleQuizCompletion() {
    this.telemetry.logEvent('QUIZ_COMPLETE', 'All open questions answered correctly');
    this.appState.markJourneyDone();
    this.showMissionComplete.set(true);
    this.glowHearts.set(true);
  }

  proceedToNextStage() {
    this.appState.setStage(5);
  }
}
