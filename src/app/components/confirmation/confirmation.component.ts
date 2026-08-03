import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent implements OnInit {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  readonly currentStep = signal<number>(0);
  readonly noteSent = signal<boolean>(false);

  readonly questions: PersonalQuestion[] = [
    { text: "What's one thing you've always wanted to ask me?", emoji: '💬', answer: '' },
    { text: "What's something you've never told me?", emoji: '🤫', answer: '' },
    { text: "What's your favorite memory of us so far?", emoji: '📸', answer: '' },
    { text: "What's something that reminds you of me?", emoji: '💭', answer: '' },
    { text: "What's one song that reminds you of us?", emoji: '🎵', answer: '' }
  ];

  // 3D Envelope Animation Signals
  readonly showEnvelope = signal<boolean>(false);
  readonly envelopeFloat = signal<boolean>(false);
  readonly envelopeOpen = signal<boolean>(false);
  readonly paperSlideOut = signal<boolean>(false);
  readonly paperUnfold = signal<boolean>(false);

  // Actual secret letter stored for later use
  readonly storedActualNote = [
    `btw... tere ton pehla vi koi ni si, te tere ton baad vi ye acha haina line haina lmaoo idk this sounds cringe af but i genuinely felt this sometimes. Cuz yk what yr pata nai yar koi aur ladki pasand ati hai tho bi usse bore ho jata hu baat krke then i was like fk her i dont want her shes not what i want and muje time waste ni krna ye sab mai,`,
    `and like I hv some goals i want to achieve and illl do whatever it takes to make them a into reality. so rn, im fully focused on building the life I dream of,`,
    `and its like ive talked to u so much alrdy and even if u dont love me i dont care at all ive told you how i feel so many times and u know that very well nd we both just pretend like we dont know anything shit haha nd that so funny lmao,`,
    `cuz i know ily and idc wt u think if its a yes then itll be good for us cuz were alrdy living far apart so even if we ever broke up it wouldnt matter that much, I just want to share little moments of happeniss with u, talk about love, spend time together nd enjoy each others company with love`,
    `cuz i remember that fking 6 months at starting that was something amazing days i cant forget omfg i used to cry for u idk y, bc maza ata tha i just want that days back cuz itna kuch serious nai hota m 2 3 din baad back to normal manish ho jata tha mai irl,`,
    `i just love that type of mainsh i want that back again i wanna feel that feeling again, that all i want rn cuz mai pura drain ho jata office se aake itna kaam krta rehta h bc sar dukh jata,`,
    `and pata nai maine sare easy dopamine chize hata diya hai life se jab se main atomic habits book pada hai (bahut sexy h i recommend to read that holy peak book its overrated but life changing hia h bahut jano ki) sooo its like when I talk to u ,i genuinly feel happy idk fking whyyyyyyyyyyyyyyy but thats just how it is. 🩶`,
    `bc i wanna blabber a lot about u but bc hath dukhi i cant type more rn, but haha u got my point right so yea... umm wow bc kitna kuch lik diya hai maine one take mein wow awesome nd damn my typing speed is actually improving W yea if something feels cringe just laugh at it cuz sometimes i feel like wtf am i even doing hahahaha. i literally cant stop yappingg byeeezzz. soo yea dont mind me if I said anything that made u uncomfortable. Fk me broo, umm so yea fk i cant even type that shit lmaoo tata call me after reading this hehe ..`
  ];

  // Playful note shown to her for now
  readonly paragraphs = [
    "Wait a second... 👀",
    "Did you really think it would be that easy to read my note? 😜",
    "If you want to read the real note... you have to ask Manish directly! Haha! 🐉💜",
    "Go on, bug him for it! But first... I'd love to read something from you. Leave me a little note before you go.💌"
  ];

  // Letter Typing Animation States
  readonly typedParagraphs = signal<string[]>([]);
  readonly currentTypingParaIndex = signal<number>(0);
  readonly isTyping = signal<boolean>(false);
  readonly showSignature = signal<boolean>(false);

  // Which letter is currently on screen: false = playful decoy, true = real secret letter
  readonly showingRealLetter = signal<boolean>(false);

  readonly dateStrFormatted = computed(() => {
    const rawDate = this.appState.selectedDate();
    if (!rawDate) return '';
    return rawDate;
  });

  ngOnInit() {
    this.telemetry.logEvent('STAGE_CHANGE', 'Opened final Questionnaire page');
  }

  nextStep() {
    if (this.currentStep() < 6) {
      this.currentStep.update(s => s + 1);
      this.telemetry.logEvent('STAGE_CHANGE', `Moved to Questionnaire Step ${this.currentStep() + 1}`);

      // If we just entered Step 5 (Letter Step, 0-indexed), start envelope sequence!
      if (this.currentStep() === 5) {
        this.triggerEnvelopeSequence();
      }
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
      this.telemetry.logEvent('STAGE_CHANGE', `Moved back to Questionnaire Step ${this.currentStep() + 1}`);
    }
  }

  triggerEnvelopeSequence() {
    this.showEnvelope.set(true);
    this.envelopeFloat.set(false);
    this.envelopeOpen.set(false);
    this.paperSlideOut.set(false);
    this.paperUnfold.set(false);
    this.isTyping.set(false);
    this.showSignature.set(false);
    this.showingRealLetter.set(false);

    // Wait 1 second before starting envelope animation steps
    setTimeout(() => {
      // Floating animation
      this.envelopeFloat.set(true);

      // Flap opening
      setTimeout(() => {
        this.envelopeOpen.set(true);
      }, 1200);

      // Paper sliding out
      setTimeout(() => {
        this.paperSlideOut.set(true);
      }, 2000);

      // Paper unfolding (hides envelope, reveals unfolded letter card overlay)
      setTimeout(() => {
        this.paperUnfold.set(true);
        this.startTyping();
      }, 3000);

    }, 1000);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startTyping() {
    this.isTyping.set(true);
    this.typedParagraphs.set([]);

    const baseSpeed = 16; // ms per character
    const source = this.showingRealLetter() ? this.storedActualNote : this.paragraphs;

    for (let i = 0; i < source.length; i++) {
      if (!this.isTyping()) break;

      this.currentTypingParaIndex.set(i);
      this.typedParagraphs.update(arr => [...arr, '']);

      const paragraphText = source[i];
      for (let j = 0; j < paragraphText.length; j++) {
        if (!this.isTyping()) break;
        
        this.typedParagraphs.update(arr => {
          arr[i] += paragraphText[j];
          return [...arr];
        });
        
        const delay = baseSpeed + (Math.random() * 16 - 8);
        await this.sleep(delay);
      }
      
      if (!this.isTyping()) break;
      await this.sleep(400);
    }
    
    if (this.isTyping()) {
      this.isTyping.set(false);
      this.finishTyping();
    }
  }

  skipTyping() {
    this.isTyping.set(false);
    const source = this.showingRealLetter() ? this.storedActualNote : this.paragraphs;
    this.typedParagraphs.set([...source]);
    this.finishTyping();
    this.telemetry.logEvent('LETTER_TYPING_SKIP', 'Skipped typing animation');
  }

  private finishTyping() {
    setTimeout(() => {
      this.showSignature.set(true);
      const detail = this.showingRealLetter()
        ? 'Finished reading the real secret letter 💌'
        : 'Finished reading the decoy note';
      this.telemetry.logEvent('LETTER_COMPLETE', detail);
    }, 600);
  }

  // Swap the decoy out for the real secret letter and re-run the typing animation
  revealRealLetter() {
    this.showingRealLetter.set(true);
    this.showSignature.set(false);
    this.currentTypingParaIndex.set(0);
    this.telemetry.logEvent('STAGE_CHANGE', 'Revealed the real secret letter 💌');
    this.startTyping();
  }

  proceedFromLetter() {
    // Hide letter overlay
    this.paperUnfold.set(false);
    // Go to Step 6 (Final Note-leaving step)
    this.currentStep.set(6);
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
