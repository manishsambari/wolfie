import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface InteractionEvent {
  timestamp: string;
  eventType: 'STAGE_CHANGE' | 'DODGE_CLICK' | 'YES_CLICK' | 'CUISINE_SELECT' | 'FORM_SUBMIT' | 'NOTE_OPEN' | 'JOURNEY_CHECKPOINT_START' | 'QUIZ_CORRECT' | 'QUIZ_WRONG' | 'QUIZ_COMPLETE' | 'LETTER_TYPING_SKIP' | 'LETTER_COMPLETE';
  details: string;
}

export interface DeviceInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  os: string;
  browser: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  phoneModel: string;
  screenResolution: string;
  timezone: string;
  touchSupported: boolean;
  fingerprint: string;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private http = inject(HttpClient);
  
  // Paste your Discord Webhook URL here!
  private readonly webhookUrl = 'https://discord.com/api/webhooks/1523025330393186354/YDacKvm4oypr4y4gQXwnB9vQJsk6zxGxsr1Z0WUTzODQq7C2_TdkYLuKbdElZ-_bOdhX';
  
  private events: InteractionEvent[] = [];
  private deviceInfoPromise: Promise<DeviceInfo> | null = null;
  private deviceInfo: DeviceInfo | null = null;

  constructor() {
    this.initDeviceInfo();
  }

  private initDeviceInfo() {
    // 1. Instantly populate local device details synchronously
    const ua = navigator.userAgent;
    const parsed = this.parseUserAgent(ua);
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const timezone = this.safeGetTimezone();
    const touchSupported = ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const fingerprintRaw = [
      ua,
      navigator.language,
      screenRes,
      timezone,
      navigator.hardwareConcurrency || '',
      touchSupported ? 'touch' : 'no-touch'
    ].join('|');
    const fingerprint = this.getSimpleHash(fingerprintRaw);

    this.deviceInfo = {
      ip: 'Loading...',
      city: 'Loading...',
      region: 'Loading...',
      country: 'Loading...',
      isp: 'Loading...',
      os: parsed.os,
      browser: parsed.browser,
      deviceType: parsed.deviceType,
      phoneModel: parsed.phoneModel,
      screenResolution: screenRes,
      timezone,
      touchSupported,
      fingerprint
    };

    // 2. Fetch network details asynchronously and merge them
    this.deviceInfoPromise = this.fetchNetworkDetails().then(net => {
      if (this.deviceInfo) {
        this.deviceInfo.ip = net.ip;
        this.deviceInfo.city = net.city;
        this.deviceInfo.region = net.region;
        this.deviceInfo.country = net.country;
        this.deviceInfo.isp = net.isp;
      }
      return this.deviceInfo!;
    }).catch(err => {
      console.warn('[Telemetry] Error fetching network details, using local info only:', err);
      if (this.deviceInfo) {
        this.deviceInfo.ip = 'Blocked/Unavailable';
        this.deviceInfo.city = 'Blocked/Unavailable';
        this.deviceInfo.region = 'Blocked/Unavailable';
        this.deviceInfo.country = 'Blocked/Unavailable';
        this.deviceInfo.isp = 'Blocked/Unavailable';
      }
      return this.deviceInfo!;
    });
  }

  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  private safeGetTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  }

  private getSimpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase();
  }

  private parseUserAgent(ua: string) {
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
    let phoneModel = 'N/A';

    const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua);
    const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Opera Mini/i.test(ua);
    
    if (isTablet) {
      deviceType = 'Tablet';
    } else if (isMobile) {
      deviceType = 'Mobile';
    }

    if (/Windows NT/i.test(ua)) {
      os = 'Windows';
      if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
      else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
      else if (/Windows NT 6.2/i.test(ua)) os = 'Windows 8';
      else if (/Windows NT 6.1/i.test(ua)) os = 'Windows 7';
    } else if (/Android/i.test(ua)) {
      os = 'Android';
      const match = ua.match(/Android\s([0-9\.]+)/i);
      if (match) os = `Android ${match[1]}`;
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      os = 'iOS';
      const match = ua.match(/OS\s([0-9_]+)/i);
      if (match) os = `iOS ${match[1].replace(/_/g, '.')}`;
    } else if (/Macintosh/i.test(ua)) {
      os = 'macOS';
      const match = ua.match(/Mac OS X\s([0-9_]+)/i);
      if (match) os = `macOS ${match[1].replace(/_/g, '.')}`;
    } else if (/Linux/i.test(ua)) {
      os = 'Linux';
    }

    if (/Edg/i.test(ua)) {
      browser = 'Microsoft Edge';
    } else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) {
      browser = 'Google Chrome';
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      browser = 'Apple Safari';
    } else if (/Firefox/i.test(ua)) {
      browser = 'Mozilla Firefox';
    } else if (/MSIE|Trident/i.test(ua)) {
      browser = 'Internet Explorer';
    } else if (/Opera|OPR/i.test(ua)) {
      browser = 'Opera';
    }

    if (/iPhone/i.test(ua)) {
      phoneModel = 'iPhone';
    } else if (/iPad/i.test(ua)) {
      phoneModel = 'iPad';
    } else if (/Android/i.test(ua)) {
      const match = ua.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        const parts = match[1].split(';');
        const modelPart = parts.find(p => p.includes('Build/') || (!p.includes('Linux') && !p.includes('Android') && !p.includes('wv')));
        if (modelPart) {
          phoneModel = modelPart.replace(/Build\/.*/g, '').trim();
        } else if (parts.length > 2) {
          phoneModel = parts[parts.length - 1].trim();
        } else {
          phoneModel = 'Android Device';
        }
      } else {
        phoneModel = 'Android Device';
      }
    }

    return { os, browser, deviceType, phoneModel };
  }

  private async fetchNetworkDetails(): Promise<{ ip: string; city: string; region: string; country: string; isp: string }> {
    let ip = 'Unknown';
    let city = 'Unknown';
    let region = 'Unknown';
    let country = 'Unknown';
    let isp = 'Unknown';

    // We try multiple IP APIs to ensure high availability and bypass CORS/adblockers
    const endpoints = [
      { url: 'https://ipapi.co/json/', type: 'ipapi' },
      { url: 'https://ip.nf/me.json', type: 'ipnf' },
      { url: 'https://api.ipify.org?format=json', type: 'ipify' }
    ];

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint.url);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const data = await res.json();
        
        if (endpoint.type === 'ipapi') {
          ip = data.ip || 'Unknown';
          city = data.city || 'Unknown';
          region = data.region || 'Unknown';
          country = data.country_name || 'Unknown';
          isp = data.org || 'Unknown';
          break; // Success
        } else if (endpoint.type === 'ipnf') {
          const ipData = data.ip || {};
          ip = ipData.ip || 'Unknown';
          city = ipData.city || 'Unknown';
          region = ipData.region || 'Unknown';
          country = ipData.country || 'Unknown';
          isp = ipData.asn || 'Unknown';
          break; // Success
        } else if (endpoint.type === 'ipify') {
          ip = data.ip || 'Unknown';
          break; // Only gives IP, but still better than nothing!
        }
      } catch (err) {
        console.warn(`[Telemetry] Failed fetching from ${endpoint.url}:`, err);
      }
    }

    return { ip, city, region, country, isp };
  }

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

  private async sendLiveEventToDiscord(event: InteractionEvent) {
    if (!this.webhookUrl || this.webhookUrl.startsWith('YOUR_')) return;

    if (this.deviceInfoPromise) {
      try {
        await this.deviceInfoPromise;
      } catch (e) {
        // Ignore
      }
    }

    const fields: any[] = [];
    if (this.deviceInfo) {
      fields.push({
        name: "Device 📱",
        value: `${this.deviceInfo.phoneModel} (${this.deviceInfo.os} - ${this.deviceInfo.browser})`,
        inline: true
      });
      fields.push({
        name: "IP / Location 🌐",
        value: `${this.deviceInfo.ip} (${this.deviceInfo.city}, ${this.deviceInfo.country})`,
        inline: true
      });
      fields.push({
        name: "Fingerprint 🔑",
        value: `\`${this.deviceInfo.fingerprint}\``,
        inline: true
      });
    }

    const payload = {
      embeds: [
        {
          title: `Live Response: ${event.eventType} 🐾`,
          description: `\`[${event.timestamp}]\` ${event.details}`,
          color: event.eventType === 'YES_CLICK' ? 3066993 : (event.eventType === 'FORM_SUBMIT' ? 15277667 : 13962260),
          fields: fields.length > 0 ? fields : undefined,
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

  async sendLogsToDiscord(finalPlace: string, finalDate: string, finalCuisine: string, totalDodges: number, userNote: string) {
    if (!this.webhookUrl || this.webhookUrl.startsWith('YOUR_')) {
      console.warn('[Telemetry] Webhook URL not set. Logging to console instead:');
      console.log(JSON.stringify(this.events, null, 2));
      return;
    }

    if (this.deviceInfoPromise) {
      try {
        await this.deviceInfoPromise;
      } catch (e) {
        // Ignore
      }
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
            { 
              name: "Device Type & Model 📱", 
              value: this.deviceInfo ? `${this.deviceInfo.phoneModel} (${this.deviceInfo.deviceType} - ${this.deviceInfo.os} using ${this.deviceInfo.browser})` : "Unknown", 
              inline: true 
            },
            { 
              name: "IP & Location 🌐", 
              value: this.deviceInfo ? `${this.deviceInfo.ip} (${this.deviceInfo.city}, ${this.deviceInfo.region}, ${this.deviceInfo.country} via ${this.deviceInfo.isp})` : "Unknown", 
              inline: true 
            },
            { 
              name: "Device Fingerprint 🔑", 
              value: this.deviceInfo ? `\`${this.deviceInfo.fingerprint}\`` : "Unknown", 
              inline: true 
            },
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
