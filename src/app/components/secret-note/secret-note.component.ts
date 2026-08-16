import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';

export interface StoryNote {
  id: string;
  tag: string;
  timeLabel: string;
  paragraphs: string[];
}

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

  // 3D Envelope Opening Animation Signals
  readonly envelopeOpened = signal<boolean>(false);
  readonly envelopeFloat = signal<boolean>(false);
  readonly envelopeOpen = signal<boolean>(false);
  readonly paperSlideOut = signal<boolean>(false);
  readonly paperUnfold = signal<boolean>(false);

  // Story Notes Collection
  readonly storyNotes: StoryNote[] = [
    {
      id: 'today',
      tag: "Today's Note",
      timeLabel: "Latest ✨",
      paragraphs: [
        "i can now use signals and computed properties to manage state in a more reactive way. This makes the code cleaner and easier to maintain.",
      ]
    },
    {
      id: 'note2',
      tag: "A Little Thought",
      timeLabel: "Memory 💭",
      paragraphs: [
        " npx ng serve --host 0.0.0.0 --port 4200 💭"
      ]
    },
    {
      id: 'previous',
      tag: "Saved Letter",
      timeLabel: "Entry #1 📜",
      paragraphs: [
        `btw... tere ton pehla vi koi ni si, te tere ton baad vi ye acha haina line haina lmaoo i genuinely feel this sometimes. Cuz yk what yr pata nai koi ldki aaj tak pasand ni ayi tere baad i swear on my mom `,
        `and like I hv some goals i want to achieve and illl do whatever it takes to make them a into reality. so rn, im fully focused on building the life I dream of,`,
        `and its like ive talked to u so much alrdy and even if u dont love me i dont care at all ive told you how i feel so many times and u know that very well nd we both just pretend like we dont know anything shit haha nd that so funny lmao,`,
        `cuz i know ily and idc wt u think if its a yes then itll be good for us and i promise u this time... I just want to share little moments of happeniss with u, talk about love, spend time together nd enjoy each others company with love`,
        `cuz i remember that fking 6 months at starting that was something amazing days i cant forget omfg i used to cry for u idk y, bc maza ata tha i just want that days back yr,`,
        `i just love that type of mainsh i want that back again i wanna feel that feeling again maybe we should get together again get things sort and enjoy that love agian yk, that all i want rn cuz mai pura drain ho jata office se aake itna kaam krta rehta h bc sar dukh jata,`,
        `and pata nai maine sare easy dopamine chize hata diya hai life se jab se main atomic habits book pada hai (bahut sexy h i recommend to read that holy peak book its overrated but life changing hia h bahut jano ki) sooo its like when I talk to u ,i genuinly feel happy idk fking whyyyyyyyyyyyyyyy but thats just how it is. 🩶`,
        `bc i wanna blabber a lot about u but bc hath dukhi i cant type more rn, but haha u got my point right so yea... umm wow bc kitna kuch lik diya hai maine wow hehe... i literally cant stop yappingg byeeezzz. soo yea dont mind me if I said anything that made u uncomfortable. Fk me broo, umm so yea fk i cant even type that shit lmaoo tata call me after reading this hehe ..`
      ]
    }
  ];

  readonly activeStoryIndex = signal<number>(0);

  ngOnInit() {
    this.telemetry.logEvent('NOTE_OPEN', 'Opened Secret Note Story Carousel');
    this.triggerEnvelopeSequence();
  }

  triggerEnvelopeSequence() {
    this.envelopeOpened.set(true);
    this.envelopeFloat.set(false);
    this.envelopeOpen.set(false);
    this.paperSlideOut.set(false);
    this.paperUnfold.set(false);
    this.activeStoryIndex.set(0);

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
      }, 2300);
    }, 400);
  }

  goToStory(index: number) {
    if (index >= 0 && index < this.storyNotes.length) {
      this.activeStoryIndex.set(index);
      this.telemetry.logEvent('STAGE_CHANGE', `Viewed Story Note ${index + 1}: ${this.storyNotes[index].tag}`);
    }
  }

  nextStory() {
    if (this.activeStoryIndex() < this.storyNotes.length - 1) {
      this.goToStory(this.activeStoryIndex() + 1);
    } else {
      // Loop back to start
      this.goToStory(0);
    }
  }

  prevStory() {
    if (this.activeStoryIndex() > 0) {
      this.goToStory(this.activeStoryIndex() - 1);
    }
  }

  replay() {
    this.triggerEnvelopeSequence();
  }

  proceedToNextStage() {
    this.appState.setStage(6);
  }
}
