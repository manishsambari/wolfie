import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from './services/app-state.service';
import { TelemetryService } from './services/telemetry.service';
import { IntroComponent } from './components/intro/intro.component';
import { ProposalCardComponent } from './components/proposal-card/proposal-card.component';
import { CuisinePickerComponent } from './components/cuisine-picker/cuisine-picker.component';
import { DatePlaceFormComponent } from './components/date-place-form/date-place-form.component';
import { JourneyCheckpointComponent } from './components/journey-checkpoint/journey-checkpoint.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { HeartBurstComponent } from './components/heart-burst/heart-burst.component';
import { StepsBarComponent } from './components/steps-bar/steps-bar.component';
import { SecretNoteComponent } from './components/secret-note/secret-note.component';
import { CelebrationComponent } from './components/celebration/celebration.component';
import { LeaveNoteComponent } from './components/leave-note/leave-note.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    IntroComponent,
    ProposalCardComponent,
    CuisinePickerComponent,
    DatePlaceFormComponent,
    JourneyCheckpointComponent,
    SecretNoteComponent,
    ConfirmationComponent,
    LeaveNoteComponent,
    CelebrationComponent,
    HeartBurstComponent,
    StepsBarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  private lastScrollTime = 0;

  ngOnInit() {
    this.appState.initHistory();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const now = Date.now();
    if (now - this.lastScrollTime > 10000) {
      this.lastScrollTime = now;
      this.telemetry.logEvent('STAGE_CHANGE', 'User is scrolling/reading the page 📜');
    }
  }

  @HostListener('window:blur', [])
  onWindowBlur() {
    this.telemetry.logEvent('STAGE_CHANGE', 'User minimized or switched away from the browser tab 💤');
  }

  @HostListener('window:focus', [])
  onWindowFocus() {
    this.telemetry.logEvent('STAGE_CHANGE', 'User returned/focused back to the browser tab ✨');
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    // When the browser back action occurs, update current stage without pushing to history stack again
    if (event.state && typeof event.state.stage === 'number') {
      this.appState.setStage(event.state.stage, false);
    } else {
      this.appState.setStage(0, false);
    }
  }
}
