import { Component, OnInit, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css'
})
export class IntroComponent implements OnInit {
  private appState = inject(AppStateService);
  
  readonly currentDistance = signal<number>(0);
  
  ngOnInit() {
    this.animateDistance();
  }
  
  private animateDistance() {
    const duration = 1500; // 1.5s
    const steps = 60;
    const stepTime = duration / steps;
    const target = 1400;
    const increment = target / steps;
    
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        this.currentDistance.set(target);
        clearInterval(interval);
      } else {
        this.currentDistance.set(Math.floor(current));
      }
    }, stepTime);
  }
  
  nextStage() {
    this.appState.setStage(1);
  }
}
