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
      title: 'PEED',
      artist: 'Diljit Dosanjh',
      icon: '🎵',
      url: 'https://youtu.be/cXUndHRKmXQ?si=YqKZ66eq7ZeljogQ'
    },
    {
      title: 'RUKH',
      artist: 'Navaan Sandhu',
      icon: '🎵',
      url: 'https://www.youtube.com/watch?v=nyWgcJQNWzA'
    },
    {
      title: 'HIM',
      artist: 'Karan Aujla',
      icon: '🎵',
      url: 'https://youtu.be/_eoYsV5RwyA?si=Syz4USkb_rqdG2Gr'
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
