import { Component, ElementRef, HostListener, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';

interface AmbientEmoji {
  id: number;
  char: string;
  left: string;
  delay: string;
  duration: string;
}

@Component({
  selector: 'app-proposal-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proposal-card.component.html',
  styleUrl: './proposal-card.component.css'
})
export class ProposalCardComponent implements OnInit {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  @ViewChild('cardContainer', { static: true }) cardContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('noButton', { static: true }) noButton!: ElementRef<HTMLButtonElement>;

  readonly ambientEmojis = signal<AmbientEmoji[]>([]);
  readonly noButtonText = signal<string>('No');
  
  // Default coordinates centered stacked inside the screen viewport
  readonly noLeft = signal<string>('50%');
  readonly noTop = signal<string>('68%');

  private lastDodgeTime = 0;
  private lastCursorX = window.innerWidth / 2;
  private lastCursorY = window.innerHeight * 0.68;

  // Shortened custom Punjabi artist track names to prevent viewport overflow on narrow mobile screens
  private readonly noLabels = [
    "acha qt 🐺🥺",
    "nice try 😉",
    "Ji mera dil khush ae, te main khush aan plij babu 😭☺️",
    "not today 🐉",
    "eh biba tere pyarr da saroor aeeeeeeeee💓",
    "the dragon flew 1400km, don't do this 🐉🥺✈️",
    "Kiddan manaavaan ehnu? Ke jera te kar thoda 😌",
    "dragon will cry... 😭💔",
    "oye dil le gaya tu meri kudeeeeeee wapas lene ara hu😠😘",
    "nope! 💖",
    "Teri ditti peed sambh di 😩",
    "Ve main hasseyan naal kardi ladaiyan😭😭",
    "Teri ditti peed sambh di 🫶",
    "are you sure? 😢",
    "Assi Safaran De Viche Thakk Choor Ho Gaye Ni, Par Tere Shehar Aake Saanu Milda E Aaram. i wanna feel this 😭🌹",
    "ello! 👑😿",
    "Haal Kade Puchh Tu Mureed Da😌", 
    "no is not an option! 🔒😣",
    "tuje pata awazz teri gun jiwe lata ji to lata hehe 🥰🤗",
    "try again! 🐉🥺",
    "nice click... almost! 🏹",
    "Sadde ishq nu darja mil, Ya na mile koyi gham nahi😭💖",
    "Sun sohneya teri yaad naal , Ve main khed'di din raat ve fking true 😭💖",
    "c'mon akriti... 🐺💭",
    // "BTW, tere ton pehla vi koi nahi si, te tere ton baad ni i mean maybe . Cuz yk what pata nai yar koi aur ladki pasand ati hai tho bi usse bore ho jata hu baat krke then i was like fk her i dont want her shes not what i want and muje time waste ni krna ye sab mai, and like I hv some goals i want to achieve and illl do whatever it takes to make them a into reality. so rn, im fully focused on building the life I dream of, and its like ive talked to u so much alrdy and even if u dont love me i dont care at all ive told you how i feel so many times and u know that very well nd we both just pretend like we dont know anything shit haha and that so funny lmao, cuz i know ily and idc wt u think if its a yes then itll be good for us cuz were already living far apart so even if we ever broke up it wouldnt matter that much, I just want to share little moments of happeniss with u, talk about love, spend time together nd enjoy each others company with love cuz i remember that fking 6 months at starting that was something amazing days i cant forget omfg i used to cry for u idk y bc maza ata tha i just want that days back cuz itna kuch serious nai hota m 2 3 din baad back to normal manish ho jata tha mai i irl,  i just love that type of mainsh i want that back again i wanna feel that feeling again, that all i want rn cuz mai pura drain ho jata office se aake itna kaam krta rehta h bc sar dukh jata, and pata nai maine sare easy dopamine chize hata diya hai life se jab se main atomic habits book pada hai( bahut sexy h i recommend to read that holy peak book its overrated but life changing hia h bahut jano ki) sooo its like when I talk to u ,i genuinely feel happy idk fking y but thats just how it is. 🩶",     
    "Chamdi Nu Chhil Chhil Ke Munda Naam Banaunda Tera ye mani kudeee 🥺🫠",
    "Koi tere jiya sona nai, Koi tere jiya chehara nai, Koi tere wang hasad nai, Koi tere jiya hona nai.☺️😘",
    "tu pyari hai bass 😤",
    "Ohde bina koi hor na🫵",
    "bc type krte krte hath dukh rahe plij accept na meri qt 😭🥺✨"
  ];

  ngOnInit() {
    this.generateAmbientEmojis();
  }

  private generateAmbientEmojis() {
    const emojis: AmbientEmoji[] = [];
    const characters = ['🐺', '🐉'];
    for (let i = 0; i < 20; i++) {
      emojis.push({
        id: i,
        char: characters[i % 2],
        left: `${Math.random() * 90 + 5}%`,
        delay: `${Math.random() * -20}s`,
        duration: `${12 + Math.random() * 10}s`
      });
    }
    this.ambientEmojis.set(emojis);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.appState.currentStage() !== 1) return;
    this.checkAndDodge(event.clientX, event.clientY);
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.appState.currentStage() !== 1) return;
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.checkAndDodge(touch.clientX, touch.clientY);
    }
  }

  onNoTouchStart(event: TouchEvent) {
    event.preventDefault(); // Stop simulated double triggers
    this.dodge();
  }

  onNoClick() {
    this.dodge();
  }

  private checkAndDodge(mouseX: number, mouseY: number) {
    this.lastCursorX = mouseX;
    this.lastCursorY = mouseY;

    if (!this.noButton) return;
    const btn = this.noButton.nativeElement;
    const rect = btn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;
    
    const distance = Math.hypot(mouseX - btnCenterX, mouseY - btnCenterY);
    
    if (distance < 90) {
      this.dodge();
    }
  }

  private dodge() {
    const now = Date.now();
    if (now - this.lastDodgeTime < 300) return; // Cooldown for mobile taps
    this.lastDodgeTime = now;

    this.appState.incrementDodge();
    
    // Cycle label text
    const labelIndex = (this.appState.dodgeCount() - 1) % this.noLabels.length;
    const btnText = this.noLabels[labelIndex];
    this.noButtonText.set(btnText);
    this.telemetry.logEvent('DODGE_CLICK', `No button dodged. Text displayed: "${btnText}"`);

    if (this.noButton) {
      // Estimate width and height based on wrapping text on mobile screens
      const maxAllowedWidth = Math.min(280, window.innerWidth * 0.80);
      const rawEstimatedWidth = btnText.length * 6.8 + 36;
      const estimatedWidth = Math.min(maxAllowedWidth, rawEstimatedWidth);
      
      // Compute expected wrapping lines and height
      const lines = Math.ceil(rawEstimatedWidth / maxAllowedWidth);
      const estimatedHeight = lines * 18 + 26;

      const padding = 15;
      
      // Get entire screen bounds (full screen size)
      const maxX = Math.max(padding, window.innerWidth - estimatedWidth - padding);
      const maxY = Math.max(padding, window.innerHeight - estimatedHeight - padding);

      // Yes button is centered: left: 50%, top: 48% of screen size
      const yesCenterX = window.innerWidth / 2;
      const yesCenterY = window.innerHeight * 0.55;

      let randomX = 0;
      let randomY = 0;
      let attempts = 0;

      const currentCursorX = this.lastCursorX;
      const currentCursorY = this.lastCursorY;

      // Dynamic thresholds that scale down to let the button occupy smaller lower screen bounds on small viewports
      let minCursorDist = 120;

      do {
        // Handle narrow mobile screen horizontal wrapping constraints
        if (window.innerWidth < estimatedWidth + 2 * padding) {
          randomX = (window.innerWidth - estimatedWidth) / 2;
        } else {
          randomX = Math.max(padding, Math.random() * maxX);
        }

        randomY = Math.max(padding, Math.random() * maxY);
        attempts++;

        const proposedCenterX = randomX + estimatedWidth / 2;
        const proposedCenterY = randomY + estimatedHeight / 2;

        const distanceToCursor = Math.hypot(proposedCenterX - currentCursorX, proposedCenterY - currentCursorY);

        // AABB Collision check with centered Yes button footprint (Yes button is ~180px wide, ~60px high)
        const overlapsYes = (
          randomX < yesCenterX + 95 &&
          randomX + estimatedWidth > yesCenterX - 95 &&
          randomY < yesCenterY + 45 &&
          randomY + estimatedHeight > yesCenterY - 45
        );

        // Reject position if it overlaps the Yes button, or if it is too close to the touch/cursor coords
        if (!overlapsYes && (distanceToCursor > minCursorDist || attempts > 25)) {
          break;
        }

        // Gradually ease the limits on smaller displays if search runs too long
        if (attempts === 6) {
          minCursorDist = 80;
        } else if (attempts === 15) {
          minCursorDist = 50;
        }
      } while (true);

      // Adjust coordinate mapping so translation aligns centered
      const finalX = randomX + estimatedWidth / 2;
      const finalY = randomY + estimatedHeight / 2;

      this.noLeft.set(`${finalX}px`);
      this.noTop.set(`${finalY}px`);
    }
  }

  onYesClick() {
    this.appState.triggerHeartBurst();
  }
}
