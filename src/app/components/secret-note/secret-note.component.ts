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

  readonly activeCard = signal<'today' | 'previous'>('today');

  readonly todayNoteText: string = "nothing here for today hehe... 💌";

  readonly previousNoteParagraphs: string[] = [
    `btw... tere ton pehla vi koi ni si, te tere ton baad vi ye acha haina line haina lmaoo i genuinely feel this sometimes. Cuz yk what yr pata nai koi ldki aaj tak pasand ni ayi tere baad i swear on my mom `,
    `and like I hv some goals i want to achieve and illl do whatever it takes to make them a into reality. so rn, im fully focused on building the life I dream of,`,
    `and its like ive talked to u so much alrdy and even if u dont love me i dont care at all ive told you how i feel so many times and u know that very well nd we both just pretend like we dont know anything shit haha nd that so funny lmao,`,
    `cuz i know ily and idc wt u think if its a yes then itll be good for us and i promise u this time... I just want to share little moments of happeniss with u, talk about love, spend time together nd enjoy each others company with love`,
    `cuz i remember that fking 6 months at starting that was something amazing days i cant forget omfg i used to cry for u idk y, bc maza ata tha i just want that days back yr,`,
    `i just love that type of mainsh i want that back again i wanna feel that feeling again maybe we should get together again get things sort and enjoy that love agian yk, that all i want rn cuz mai pura drain ho jata office se aake itna kaam krta rehta h bc sar dukh jata,`,
    `and pata nai maine sare easy dopamine chize hata diya hai life se jab se main atomic habits book pada hai (bahut sexy h i recommend to read that holy peak book its overrated but life changing hia h bahut jano ki) sooo its like when I talk to u ,i genuinly feel happy idk fking whyyyyyyyyyyyyyyy but thats just how it is. 🩶`,
    `bc i wanna blabber a lot about u but bc hath dukhi i cant type more rn, but haha u got my point right so yea... umm wow bc kitna kuch lik diya hai maine wow hehe... i literally cant stop yappingg byeeezzz. soo yea dont mind me if I said anything that made u uncomfortable. Fk me broo, umm so yea fk i cant even type that shit lmaoo tata call me after reading this hehe ..`
  ];

  ngOnInit() {
    this.telemetry.logEvent('NOTE_OPEN', 'Opened Secret Note Stack');
  }

  showPreviousNote() {
    this.activeCard.set('previous');
    this.telemetry.logEvent('STAGE_CHANGE', 'Flipped to Previous Note in stack');
  }

  showTodayNote() {
    this.activeCard.set('today');
    this.telemetry.logEvent('STAGE_CHANGE', 'Flipped back to Today Note in stack');
  }

  proceedToNextStage() {
    this.appState.setStage(6);
  }
}
