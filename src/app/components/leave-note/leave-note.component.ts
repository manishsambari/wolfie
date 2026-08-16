import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';

@Component({
  selector: 'app-leave-note',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leave-note.component.html',
  styleUrl: './leave-note.component.css'
})
export class LeaveNoteComponent implements OnInit {
  protected appState = inject(AppStateService);
  private telemetry = inject(TelemetryService);

  readonly noteText = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);

  ngOnInit() {
    this.telemetry.logEvent('NOTE_OPEN', 'Opened Leave a Note section 📝');
    // Pre-populate if already written earlier
    if (this.appState.userNote()) {
      this.noteText.set(this.appState.userNote());
    }
  }

  sendNote() {
    const note = this.noteText().trim();
    this.isSubmitting.set(true);

    // 1. Send the note immediately to Discord in a dedicated instant alert embed
    this.telemetry.sendQuestionAnswerToDiscord(
      6,
      "Before you go... leave me a little note? 💜",
      note || "No note left"
    );

    // 2. Submit full date package to Supabase and Discord summary
    this.appState.submitUserNote(
      note ? `**Final Note from Akriti:**\n*${note}*` : 'No note left.',
      []
    );

    // 3. Move straight to celebration stage (Stage 8)
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.appState.setStage(8);
    }, 400);
  }
}
