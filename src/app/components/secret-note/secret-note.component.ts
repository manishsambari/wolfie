import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';

@Component({
  selector: 'app-secret-note',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './secret-note.component.html',
  styleUrl: './secret-note.component.css'
})
export class SecretNoteComponent implements OnInit {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  // 3D Envelope Animation Signals
  readonly envelopeOpened = signal<boolean>(false);
  readonly envelopeFloat = signal<boolean>(false);
  readonly envelopeOpen = signal<boolean>(false);
  readonly paperSlideOut = signal<boolean>(false);
  readonly paperUnfold = signal<boolean>(false);

  // Actual secret letter stored for Akriti
  readonly storedActualNote: string[] = [
    `btw... tere ton pehla vi koi ni si, te tere ton baad vi ye acha haina line haina lmaoo idk this sounds cringe af but i genuinely felt this sometimes. Cuz yk what yr pata nai yar koi aur ladki pasand ati hai tho bi usse bore ho jata hu baat krke then i was like fk her i dont want her shes not what i want and muje time waste ni krna ye sab mai,`,
    `and like I hv some goals i want to achieve and illl do whatever it takes to make them a into reality. so rn, im fully focused on building the life I dream of,`,
    `and its like ive talked to u so much alrdy and even if u dont love me i dont care at all ive told you how i feel so many times and u know that very well nd we both just pretend like we dont know anything shit haha nd that so funny lmao,`,
    `cuz i know ily and idc wt u think if its a yes then itll be good for us cuz were alrdy living far apart so even if we ever broke up it wouldnt matter that much, I just want to share little moments of happeniss with u, talk about love, spend time together nd enjoy each others company with love`,
    `cuz i remember that fking 6 months at starting that was something amazing days i cant forget omfg i used to cry for u idk y, bc maza ata tha i just want that days back cuz itna kuch serious nai hota m 2 3 din baad back to normal manish ho jata tha mai irl,`,
    `i just love that type of mainsh i want that back again i wanna feel that feeling again, that all i want rn cuz mai pura drain ho jata office se aake itna kaam krta rehta h bc sar dukh jata,`,
    `and pata nai maine sare easy dopamine chize hata diya hai life se jab se main atomic habits book pada hai (bahut sexy h i recommend to read that holy peak book its overrated but life changing hia h bahut jano ki) sooo its like when I talk to u ,i genuinly feel happy idk fking whyyyyyyyyyyyyyyy but thats just how it is. 🩶`,
    `bc i wanna blabber a lot about u but bc hath dukhi i cant type more rn, but haha u got my point right so yea... umm wow bc kitna kuch lik diya hai maine one take mein wow awesome nd damn my typing speed is actually improving W yea if something feels cringe just laugh at it cuz sometimes i feel like wtf am i even doing hahahaha. i literally cant stop yappingg byeeezzz. soo yea dont mind me if I said anything that made u uncomfortable. Fk me broo, umm so yea fk i cant even type that shit lmaoo tata call me after reading this hehe ..`
  ];

  // Letter Typing Animation States
  readonly typedParagraphs = signal<string[]>([]);
  readonly currentTypingParaIndex = signal<number>(0);
  readonly isTyping = signal<boolean>(false);
  readonly showSignature = signal<boolean>(false);

  ngOnInit() {
    this.telemetry.logEvent('NOTE_OPEN', 'Opened Secret Note section');
    // Start envelope opening sequence automatically
    this.triggerEnvelopeSequence();
  }

  triggerEnvelopeSequence() {
    this.envelopeOpened.set(true);
    this.envelopeFloat.set(false);
    this.envelopeOpen.set(false);
    this.paperSlideOut.set(false);
    this.paperUnfold.set(false);
    this.isTyping.set(false);
    this.showSignature.set(false);

    setTimeout(() => {
      this.envelopeFloat.set(true);

      setTimeout(() => {
        this.envelopeOpen.set(true);
      }, 900);

      setTimeout(() => {
        this.paperSlideOut.set(true);
      }, 1600);

      setTimeout(() => {
        this.paperUnfold.set(true);
        this.startTyping();
      }, 2300);
    }, 400);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startTyping() {
    this.isTyping.set(true);
    this.typedParagraphs.set([]);

    const baseSpeed = 14;
    const source = this.storedActualNote;

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

        const delay = baseSpeed + (Math.random() * 12 - 6);
        await this.sleep(delay);
      }

      if (!this.isTyping()) break;
      await this.sleep(300);
    }

    if (this.isTyping()) {
      this.isTyping.set(false);
      this.finishTyping();
    }
  }

  skipTyping() {
    this.isTyping.set(false);
    this.typedParagraphs.set([...this.storedActualNote]);
    this.finishTyping();
    this.telemetry.logEvent('LETTER_TYPING_SKIP', 'Skipped letter typing animation');
  }

  private finishTyping() {
    setTimeout(() => {
      this.showSignature.set(true);
      this.telemetry.logEvent('LETTER_COMPLETE', 'Finished reading the secret letter 💌');
    }, 400);
  }

  proceedToNextStage() {
    this.appState.setStage(6);
  }

  replay() {
    this.triggerEnvelopeSequence();
  }
}
