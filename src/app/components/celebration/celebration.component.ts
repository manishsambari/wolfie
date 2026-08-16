import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';

@Component({
  selector: 'app-celebration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './celebration.component.html',
  styleUrl: './celebration.component.css'
})
export class CelebrationComponent implements OnInit {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  readonly songs = [
    {
      title: 'TAAJ',
      artist: 'tricksingh',
      icon: '🎵',
      url: 'https://youtu.be/Du8E8g2LVoU?si=PTLuL3Ie0ki_3FOt'
    },
    {
      title: 'Nai Bolna',
      artist: 'Navaan Sandhu',
      icon: '🎵',
      url: 'https://youtu.be/ai9cv29SJsQ?si=nW1ZyKxoUiBdaV2A'
    },
    {
      title: 'Bachke Bachke',
      artist: 'Karan Aujla',
      icon: '🎵',
      url: 'https://youtu.be/fRJ03btNsao?si=4BV7dqradZ9SlFB4'
    }
  ];

  ngOnInit() {
    this.telemetry.logEvent('STAGE_CHANGE', 'Opened Celebration & Music page 🎵');
  }

  onSongClick(songTitle: string) {
    this.telemetry.logEvent('STAGE_CHANGE', `Clicked song: "${songTitle}"`);
  }

  restart() {
    this.appState.reset();
  }
}
