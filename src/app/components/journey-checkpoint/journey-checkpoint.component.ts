import { Component, OnInit, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';
import { SupabaseService } from '../../services/supabase.service';

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
  private supabase = inject(SupabaseService);

  @ViewChild('answerInput') answerInput!: ElementRef<HTMLInputElement>;

  // Levenshtein distance for fuzzy matching
  private getLevenshteinDistance(a: string, b: string): number {
    const tmp = [];
    let i, j;
    for (i = 0; i <= a.length; i++) {
      tmp[i] = [i];
    }
    for (j = 0; j <= b.length; j++) {
      tmp[0][j] = j;
    }
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1, // deletion
          tmp[i][j - 1] + 1, // insertion
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
        );
      }
    }
    return tmp[a.length][b.length];
  }

  readonly questions: TypedQuestion[] = [
    {
      text: 'When was the first time you called me "thanks love"?',
      placeholder: 'Type the date or occasion...',
      checkAnswer: (typed: string) => {
        const val = typed.trim().toLowerCase();
        // Accepts: birthday, my birthday, 6 jan, 6 january, jan 6, 6th january, etc.
        const matchesBirthday = val.includes('birth');
        const matchesDateStr = val.includes('6') && (val.includes('jan') || val.includes('1') || val.includes('one'));
        return matchesBirthday || matchesDateStr;
      },
      hint: "It's in early January🎂"
    },
    {
      text: 'Wts one thing that make me happy when u send that?',
      placeholder: 'Type your answer...',
      checkAnswer: (typed: string) => {
        const val = typed.trim().toLowerCase();
        // Accepts: a photo of her, photo, pic, selfie, picture, etc.
        return val.includes('photo') || val.includes('pic') || val.includes('selfie') || val.includes('picture');
      },
      hint: "It's a visual reminder of you! 📸"
    },
    {
      text: 'Who\'s my favorite person to talk?',
      placeholder: 'Type who...',
      checkAnswer: (typed: string) => {
        const val = typed.trim().toLowerCase();
        // Accepts "me", "you", "akriti", "akrit"
        return val === 'me' || val === 'you' || val.includes('akriti') || val.includes('akrit');
      },
      hint: "Look in the mirror 🪞"
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

  // Photo upload signals
  readonly showPhotoUpload = signal<boolean>(false);
  readonly selectedPhotoFile = signal<File | null>(null);
  readonly photoPreviewUrl = signal<string>('');
  readonly isUploadingPhoto = signal<boolean>(false);

  private focusPending = false;

  ngOnInit() {
    this.telemetry.logEvent('JOURNEY_CHECKPOINT_START', 'Opened Journey Checkpoint Intro');
  }

  ngAfterViewChecked() {
    // Keep focus in the input field when transitioning questions
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

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedPhotoFile.set(file);

      // Preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async submitPhotoAndContinue() {
    const file = this.selectedPhotoFile();
    if (!file) return;

    this.isUploadingPhoto.set(true);

    try {
      // 1. Upload to Supabase Storage bucket first
      const publicUrl = await this.supabase.uploadPhoto(file);
      if (publicUrl) {
        // Cache URL in AppState
        this.appState.uploadedPhotoUrl.set(publicUrl);
        this.telemetry.logEvent('STAGE_CHANGE', `Uploaded checkpoint photo to Supabase: ${publicUrl}`);
      }
    } catch (err) {
      console.error('[Supabase] Photo upload failed:', err);
    }

    // 2. Post to Discord Webhook
    this.telemetry.uploadPhotoToDiscord(file).subscribe({
      next: () => {
        this.isUploadingPhoto.set(false);
        this.showPhotoUpload.set(false);
        this.selectedPhotoFile.set(null);
        this.photoPreviewUrl.set('');
        
        // Resume transition to Q3
        this.transitionToNextQuestion();
      },
      error: (err) => {
        console.error('Discord photo upload failed:', err);
        this.isUploadingPhoto.set(false);
        this.showPhotoUpload.set(false);
        this.selectedPhotoFile.set(null);
        this.photoPreviewUrl.set('');
        
        // Resume transition even if Discord upload fails
        this.transitionToNextQuestion();
      }
    });
  }

  skipPhotoAndContinue() {
    this.showPhotoUpload.set(false);
    this.selectedPhotoFile.set(null);
    this.photoPreviewUrl.set('');
    this.transitionToNextQuestion();
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
      this.feedbackMessage.set(''); // Explicitly clear feedback on transition
      
      this.telemetry.logEvent('QUIZ_CORRECT', `Correctly typed answer for Q${this.currentQuestionIndex() + 1}: "${typed}"`);

      // Special case: If Question 2 (Index 1) is correct, pause and show photo upload!
      if (this.currentQuestionIndex() === 1) {
        this.showPhotoUpload.set(true);
      } else {
        // Transition to next question or complete game after 800ms
        setTimeout(() => {
          this.transitionToNextQuestion();
        }, 800);
      }
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
    this.showMissionComplete.set(true);
    this.glowHearts.set(true);
  }

  proceedToNextStage() {
    this.appState.setStage(5);
  }
}
