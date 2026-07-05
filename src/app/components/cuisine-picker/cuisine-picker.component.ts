import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';

interface CuisineOption {
  name: string;
  emoji: string;
  fullName: string;
}

@Component({
  selector: 'app-cuisine-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cuisine-picker.component.html',
  styleUrl: './cuisine-picker.component.css'
})
export class CuisinePickerComponent implements OnInit {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  readonly cuisines: CuisineOption[] = [
    { name: 'Punjabi', emoji: '🍛', fullName: 'Punjabi 🍛' },
    { name: 'Italian', emoji: '🍕', fullName: 'Italian 🍕' },
    { name: 'Chinese', emoji: '🍜', fullName: 'Chinese 🍜' },
    { name: 'South Indian', emoji: '🥗', fullName: 'South Indian 🥗' },
    { name: 'Continental', emoji: '🍞', fullName: 'Continental 🍞' },
    { name: 'Cafe', emoji: '☕', fullName: 'Cafe ☕' },
    { name: 'Desserts', emoji: '🍰', fullName: 'Desserts 🍰' },
    { name: 'Street Food', emoji: '🍢', fullName: 'Street Food 🍢' },
    { name: 'Anything With You', emoji: '💖', fullName: 'Anything With You 💖' }
  ];

  readonly dragonReaction = signal<string>('');

  ngOnInit() {
    const current = this.appState.selectedCuisine();
    if (current) {
      const match = this.cuisines.find(c => c.fullName === current);
      if (match) {
        this.dragonReaction.set(this.getDragonReaction(match.name));
      }
    }
  }

  isSelected(c: CuisineOption): boolean {
    return this.appState.selectedCuisine() === c.fullName;
  }

  getDragonReaction(cuisineName: string): string {
    const reactions: { [key: string]: string[] } = {
      'Punjabi': [
        "Oho... Punjabi food! Butter chicken and naan? 🍛",
        "Aha! Balle balle! Punjabi flavors are legendary! 🍛✨"
      ],
      'Italian': [
        "Yesss... Pizza sounds amazing 🍕",
        "Pasta and garlic bread? Count me in! 🍝"
      ],
      'Chinese': [
        "Noodles and momos, let's go! 🥟",
        "Dim sums and fried rice? Chinese is a great choice! 🍜"
      ],
      'South Indian': [
        "Masala dosa? Count me in! 🥗",
        "Idli Sambhar is so comforting! Approved! 🍛"
      ],
      'Continental': [
        "Continental breakfast vibes? Approved! 🍞",
        "Sizzler or pasta? Continental sounds fancy! 🥩"
      ],
      'Cafe': [
        "Coffee dates are the best, approved! ☕",
        "Hot chocolate and croissants? Perfect! ☕🥐"
      ],
      'Desserts': [
        "I definitely approve this choice 🍰",
        "Sweet tooth? Desserts are always correct! 🧁"
      ],
      'Street Food': [
        "Golgappe and chaat? Hell yeah! 🍢",
        "Tikka and pakoras? Street food is love! 🍢😋"
      ],
      'Anything With You': [
        "Whatever makes you happy, makes me happy 💖"
      ]
    };

    const list = reactions[cuisineName] || ["That sounds delicious! Can't wait! 😋"];
    // Select a random response from the lists to make it feel alive!
    return list[Math.floor(Math.random() * list.length)];
  }

  selectCuisine(c: CuisineOption) {
    this.appState.setCuisine(c.fullName);
    this.dragonReaction.set(this.getDragonReaction(c.name));
    this.telemetry.logEvent('CUISINE_SELECT', `Picked "${c.fullName}". Dragon reaction: "${this.dragonReaction()}"`);

    if (this.appState.currentStage() === 2) {
      setTimeout(() => {
        this.appState.setStage(3);
      }, 1500); // 1.5s delay so she has time to see the selection check and read the reaction
    }
  }
}
