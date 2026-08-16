import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';
import { TelemetryService } from '../../services/telemetry.service';
import { SupabaseService } from '../../services/supabase.service';

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
  private supabase = inject(SupabaseService);

  readonly noteText = signal<string>('');
  readonly selectedPhotoFile = signal<File | null>(null);
  readonly photoPreviewUrl = signal<string>('');
  readonly isSubmitting = signal<boolean>(false);
  readonly isPhotoUploading = signal<boolean>(false);
  readonly photoUploadedSuccess = signal<boolean>(false);

  ngOnInit() {
    this.telemetry.logEvent('NOTE_OPEN', 'Opened Leave a Note section 📝');
    if (this.appState.userNote()) {
      this.noteText.set(this.appState.userNote());
    }
  }

  async onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedPhotoFile.set(file);
      this.isPhotoUploading.set(true);

      // 1. Generate local preview immediately
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);

      // 2. INSTANT DISCORD DELIVERY: Send photo to Discord Webhook IMMEDIATELY without waiting for "Send Note" button
      try {
        this.telemetry.uploadPhotoToDiscord(file).subscribe({
          next: () => {
            console.log('[Telemetry] Photo sent directly to Discord upon selection!');
            this.isPhotoUploading.set(false);
            this.photoUploadedSuccess.set(true);
          },
          error: (err) => {
            console.error('[Telemetry] Direct photo send error:', err);
            this.isPhotoUploading.set(false);
          }
        });
      } catch (err) {
        console.error('[Telemetry] Photo dispatch exception:', err);
        this.isPhotoUploading.set(false);
      }

      // 3. Upload to Supabase Storage in background
      try {
        this.supabase.uploadPhoto(file).then(publicUrl => {
          if (publicUrl) {
            this.appState.uploadedPhotoUrl.set(publicUrl);
            this.telemetry.logEvent('STAGE_CHANGE', `Uploaded final note photo to Supabase: ${publicUrl}`);
          }
        }).catch(e => console.error('Supabase photo storage failed:', e));
      } catch (err) {
        console.error('Supabase storage exception:', err);
      }
    }
  }

  removePhoto() {
    this.selectedPhotoFile.set(null);
    this.photoPreviewUrl.set('');
    this.photoUploadedSuccess.set(false);
  }

  async sendNote() {
    const note = this.noteText().trim();
    const hasPhoto = !!this.selectedPhotoFile();
    this.isSubmitting.set(true);

    // 1. Send the note text immediately to Discord
    this.telemetry.sendQuestionAnswerToDiscord(
      6,
      "Before you go... leave me a little note? 💜",
      note ? (hasPhoto ? `${note}\n*(📸 Photo attached)*` : note) : (hasPhoto ? "*(📸 Photo attached with no text)*" : "No note left")
    );

    // 2. Submit full date package to Supabase and Discord summary
    this.appState.submitUserNote(
      note ? `**Final Note from Akriti:**\n*${note}*` : (hasPhoto ? '*(📸 Photo attached)*' : 'No note left.'),
      []
    );

    // 3. Move to celebration stage (Stage 8)
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.appState.setStage(8);
    }, 500);
  }
}
