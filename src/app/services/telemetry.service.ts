import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface InteractionEvent {
  timestamp: string;
  eventType: 'STAGE_CHANGE' | 'DODGE_CLICK' | 'YES_CLICK' | 'CUISINE_SELECT' | 'FORM_SUBMIT' | 'NOTE_OPEN' | 'JOURNEY_CHECKPOINT_START' | 'QUIZ_CORRECT' | 'QUIZ_WRONG' | 'QUIZ_COMPLETE' | 'LETTER_TYPING_SKIP' | 'LETTER_COMPLETE';
  details: string;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private http = inject(HttpClient);
  
  // Paste your Discord Webhook URL here!
  private readonly webhookUrl = 'https://discord.com/api/webhooks/1523025330393186354/YDacKvm4oypr4y4gQXwnB9vQJsk6zxGxsr1Z0WUTzODQq7C2_TdkYLuKbdElZ-_bOdhX';
  
  private events: InteractionEvent[] = [];

  logEvent(eventType: InteractionEvent['eventType'], details: string) {
    const event: InteractionEvent = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      eventType,
      details
    };
    this.events.push(event);
    console.log(`[Telemetry] ${event.timestamp} - ${eventType}: ${details}`);
    
    // Send live response to Discord in real-time
    this.sendLiveEventToDiscord(event);
  }

  private sendLiveEventToDiscord(event: InteractionEvent) {
    if (!this.webhookUrl || this.webhookUrl.startsWith('YOUR_')) return;

    const payload = {
      embeds: [
        {
          title: `Live Response: ${event.eventType} 🐾`,
          description: `\`[${event.timestamp}]\` ${event.details}`,
          color: event.eventType === 'YES_CLICK' ? 3066993 : (event.eventType === 'FORM_SUBMIT' ? 15277667 : 13962260),
          timestamp: new Date().toISOString()
        }
      ]
    };

    fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => console.error('[Telemetry] Live notification failed:', err));
  }

  getEvents() {
    return this.events;
  }

  sendLogsToDiscord(finalPlace: string, finalDate: string, finalCuisine: string, totalDodges: number, userNote: string) {
    if (!this.webhookUrl || this.webhookUrl.startsWith('YOUR_')) {
      console.warn('[Telemetry] Webhook URL not set. Logging to console instead:');
      console.log(JSON.stringify(this.events, null, 2));
      return;
    }

    let timelineText = this.events
      .map(e => `\`[${e.timestamp}]\` **${e.eventType}**: ${e.details}`)
      .join('\n');

    // Discord message embeds payload
    const payload = {
      embeds: [
        {
          title: "🐺 Akriti Selected Her Date! 🐉",
          description: "Here is the summary of her responses and the timeline of her clicks on the proposal card:",
          color: 13962260, // Deep Wine #D50C14 decimal code
          fields: [
            { name: "Cuisine Selected 🍰", value: finalCuisine || "None", inline: true },
            { name: "Meeting Spot 📍", value: finalPlace || "None", inline: true },
            { name: "Meeting Date 🗓️", value: finalDate || "None", inline: true },
            { name: "Total 'No' Dodges 🏹", value: `${totalDodges} times`, inline: true },
            { name: "Akriti's Note for You 📝", value: userNote || "*No note left.*", inline: false },
            { name: "Full Timeline of Clicks & Typings", value: timelineText || "No events logged.", inline: false }
          ],
          footer: {
            text: "Ask Date Proposal App • Telemetry Logs"
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    this.http.post(this.webhookUrl, payload).subscribe({
      next: () => console.log('[Telemetry] Interaction logs sent to Discord successfully!'),
      error: (err) => console.error('[Telemetry] Failed to send logs to Discord:', err)
    });
  }

  uploadPhotoToDiscord(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const payload = {
      embeds: [
        {
          title: "📸 Akriti sent you a photo! 🐺❤️",
          description: "Here is the photo Akriti uploaded during the Journey Checkpoint! 🌸",
          color: 13962260,
          timestamp: new Date().toISOString()
        }
      ]
    };
    formData.append('payload_json', JSON.stringify(payload));

    return this.http.post(this.webhookUrl, formData);
  }
}
