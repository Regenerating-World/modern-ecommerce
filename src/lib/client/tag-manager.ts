"use client";

import { UserTag } from "@/types/ecommerce";
import { AnonymousSession } from "@/types/user";

export class TagManager {
  private static instance: TagManager;
  private userTags: UserTag[] = [];
  private sessionTags: UserTag[] = [];

  private constructor() {
    this.loadSessionTags();
    this.detectAndAssignAutomaticTags();
  }

  public static getInstance(): TagManager {
    if (!TagManager.instance) {
      TagManager.instance = new TagManager();
    }
    return TagManager.instance;
  }

  // Load tags from localStorage for anonymous users
  private loadSessionTags(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const storedTags = localStorage.getItem('sessionTags');
      if (storedTags) {
        this.sessionTags = JSON.parse(storedTags);
      }
    } catch (error) {
      console.error('Error loading session tags:', error);
    }
  }

  // Save tags to localStorage for anonymous users
  private saveSessionTags(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('sessionTags', JSON.stringify(this.sessionTags));
    } catch (error) {
      console.error('Error saving session tags:', error);
    }
  }

  // Detect and assign automatic tags based on environment
  private detectAndAssignAutomaticTags(): void {
    if (typeof window === 'undefined') return;

    // UTM Parameters
    this.detectUTMTags();
    
    // Device and browser info
    this.detectDeviceTags();
    
    // Time-based tags
    this.detectTimeTags();
    
    // Location (if geolocation is available)
    this.detectLocationTags();
  }

  private detectUTMTags(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      source: urlParams.get('utm_source'),
      medium: urlParams.get('utm_medium'),
      campaign: urlParams.get('utm_campaign'),
      term: urlParams.get('utm_term'),
      content: urlParams.get('utm_content'),
    };

    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        this.addTag({
          tag: `UTM_${key.toUpperCase()}_${value.toUpperCase()}`,
          source: 'utm',
          value,
          assignedAt: new Date().toISOString(),
        });
      }
    });
  }

  private detectDeviceTags(): void {
    const userAgent = navigator.userAgent;
    
    // Mobile detection
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      this.addTag({
        tag: 'DEVICE_MOBILE',
        source: 'device',
        assignedAt: new Date().toISOString(),
      });
    } else {
      this.addTag({
        tag: 'DEVICE_DESKTOP',
        source: 'device',
        assignedAt: new Date().toISOString(),
      });
    }

    // OS detection
    if (/Windows/.test(userAgent)) {
      this.addTag({
        tag: 'OS_WINDOWS',
        source: 'device',
        assignedAt: new Date().toISOString(),
      });
    } else if (/Mac/.test(userAgent)) {
      this.addTag({
        tag: 'OS_MAC',
        source: 'device',
        assignedAt: new Date().toISOString(),
      });
    } else if (/Linux/.test(userAgent)) {
      this.addTag({
        tag: 'OS_LINUX',
        source: 'device',
        assignedAt: new Date().toISOString(),
      });
    }

    // Browser detection
    if (/Chrome/.test(userAgent)) {
      this.addTag({
        tag: 'BROWSER_CHROME',
        source: 'device',
        assignedAt: new Date().toISOString(),
      });
    } else if (/Firefox/.test(userAgent)) {
      this.addTag({
        tag: 'BROWSER_FIREFOX',
        source: 'device',
        assignedAt: new Date().toISOString(),
      });
    } else if (/Safari/.test(userAgent)) {
      this.addTag({
        tag: 'BROWSER_SAFARI',
        source: 'device',
        assignedAt: new Date().toISOString(),
      });
    }
  }

  private detectTimeTags(): void {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      this.addTag({
        tag: 'TIME_MORNING',
        source: 'time',
        assignedAt: new Date().toISOString(),
      });
    } else if (hour >= 12 && hour < 18) {
      this.addTag({
        tag: 'TIME_AFTERNOON',
        source: 'time',
        assignedAt: new Date().toISOString(),
      });
    } else if (hour >= 18 && hour < 22) {
      this.addTag({
        tag: 'TIME_EVENING',
        source: 'time',
        assignedAt: new Date().toISOString(),
      });
    } else {
      this.addTag({
        tag: 'TIME_NIGHT',
        source: 'time',
        assignedAt: new Date().toISOString(),
      });
    }

    // Day of week
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      this.addTag({
        tag: 'DAY_WEEKEND',
        source: 'time',
        assignedAt: new Date().toISOString(),
      });
    } else {
      this.addTag({
        tag: 'DAY_WEEKDAY',
        source: 'time',
        assignedAt: new Date().toISOString(),
      });
    }
  }

  private detectLocationTags(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // For privacy, we'll only use general location info
          // In a real app, you'd use a geolocation service to get city/country
          this.addTag({
            tag: 'LOCATION_DETECTED',
            source: 'location',
            assignedAt: new Date().toISOString(),
          });
        },
        (error) => {
          console.log('Geolocation not available:', error);
        },
        { timeout: 5000 }
      );
    }
  }

  // Add a tag (avoiding duplicates)
  public addTag(tag: UserTag): void {
    const existingTagIndex = this.sessionTags.findIndex(t => t.tag === tag.tag);
    
    if (existingTagIndex === -1) {
      this.sessionTags.push(tag);
      this.saveSessionTags();
    }
  }

  // Add tags from questionnaire answers
  public addQuestionnaireTag(questionId: string, tags: string[]): void {
    tags.forEach(tagName => {
      this.addTag({
        tag: tagName,
        source: 'questionnaire',
        value: questionId,
        assignedAt: new Date().toISOString(),
      });
    });
  }

  // Add behavioral tags based on user actions
  public addBehavioralTag(behavior: string, context?: string): void {
    this.addTag({
      tag: `BEHAVIOR_${behavior.toUpperCase()}`,
      source: 'behavior',
      value: context,
      assignedAt: new Date().toISOString(),
    });
  }

  // Get all current tags
  public getAllTags(): UserTag[] {
    return [...this.userTags, ...this.sessionTags];
  }

  // Get tags by source
  public getTagsBySource(source: UserTag['source']): UserTag[] {
    return this.getAllTags().filter(tag => tag.source === source);
  }

  // Check if user has specific tag
  public hasTag(tagName: string): boolean {
    return this.getAllTags().some(tag => tag.tag === tagName);
  }

  // Calculate tag match score for content
  public calculateMatchScore(contentTags: string[]): number {
    const userTagNames = this.getAllTags().map(tag => tag.tag);
    const matches = contentTags.filter(tag => userTagNames.includes(tag));
    
    if (contentTags.length === 0) return 0;
    return matches.length / contentTags.length;
  }

  // Set user tags (for logged-in users)
  public setUserTags(tags: UserTag[]): void {
    this.userTags = tags;
  }

  // Clear session tags (useful for testing or privacy)
  public clearSessionTags(): void {
    this.sessionTags = [];
    this.saveSessionTags();
  }

  // Get session data for anonymous users
  public getSessionData(): AnonymousSession {
    const sessionId = this.getOrCreateSessionId();
    const userAgent = navigator.userAgent;
    return {
      sessionId,
      tags: this.sessionTags,
      events: {
        clicks: {},
        views: {},
        purchases: {},
      } as any,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      utmParams: this.extractUTMParams(),
      deviceInfo: {
        userAgent,
        platform: navigator.platform,
        isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
        screenSize: `${screen.width}x${screen.height}`,
      },
      locationInfo: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  }

  // Sync session data with Contentful (optimized structure)
  public async syncSessionData(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionData = this.getSessionData();
      
      const response = await fetch('/api/sessions/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync session data');
      }

      console.log('Session data synced successfully');
    } catch (error) {
      console.error('Error syncing session data:', error);
      // Don't throw error to avoid breaking the user experience
    }
  }

  private extractUTMParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined,
    };
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
}

// Export singleton instance
export const tagManager = TagManager.getInstance();
