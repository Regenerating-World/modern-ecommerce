"use client";

import { ContentAsset } from "@/types/ecommerce";
import { tagManager } from "./tag-manager";

export class ContentPersonalizer {
  private static instance: ContentPersonalizer;

  private constructor() {}

  public static getInstance(): ContentPersonalizer {
    if (!ContentPersonalizer.instance) {
      ContentPersonalizer.instance = new ContentPersonalizer();
    }
    return ContentPersonalizer.instance;
  }

  /**
   * Sort content assets based on user tags and relevance
   */
  public personalizeContent(assets: ContentAsset[]): ContentAsset[] {
    const userTags = tagManager.getAllTags().map(tag => tag.tag);
    
    // Filter only active assets within valid date range
    const activeAssets = assets.filter(asset => {
      if (!asset.isActive) return false;
      
      const now = new Date();
      if (asset.validFrom && new Date(asset.validFrom) > now) return false;
      if (asset.validUntil && new Date(asset.validUntil) < now) return false;
      
      return true;
    });

    // Calculate relevance score for each asset
    const scoredAssets = activeAssets.map(asset => ({
      ...asset,
      relevanceScore: this.calculateRelevanceScore(asset, userTags),
    }));

    // Sort by relevance score (descending) and then by priority (descending)
    return scoredAssets.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.priority - a.priority;
    });
  }

  /**
   * Calculate relevance score based on tag matching
   */
  private calculateRelevanceScore(asset: ContentAsset, userTags: string[]): number {
    if (asset.tags.length === 0) {
      // Assets without tags get a neutral score
      return 0.5;
    }

    // Calculate exact matches
    const exactMatches = asset.tags.filter(tag => userTags.includes(tag)).length;
    
    // Calculate partial matches (for more flexible matching)
    const partialMatches = this.calculatePartialMatches(asset.tags, userTags);
    
    // Base score from exact matches
    let score = exactMatches / asset.tags.length;
    
    // Bonus for partial matches
    score += (partialMatches * 0.1);
    
    // Bonus for having fewer tags (more specific targeting)
    if (asset.tags.length <= 3) {
      score += 0.1;
    }
    
    // Cap the score at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Calculate partial matches for more flexible content matching
   */
  private calculatePartialMatches(assetTags: string[], userTags: string[]): number {
    let partialMatches = 0;
    
    for (const assetTag of assetTags) {
      for (const userTag of userTags) {
        // Check for partial string matches
        if (assetTag !== userTag && 
            (assetTag.includes(userTag) || userTag.includes(assetTag))) {
          partialMatches += 0.5;
        }
        
        // Check for category matches (e.g., DEVICE_MOBILE and MOBILE_USER)
        if (this.areCategoryMatches(assetTag, userTag)) {
          partialMatches += 0.3;
        }
      }
    }
    
    return partialMatches;
  }

  /**
   * Check if two tags belong to the same category
   */
  private areCategoryMatches(tag1: string, tag2: string): boolean {
    const categories = [
      ['DEVICE_MOBILE', 'MOBILE', 'SMARTPHONE'],
      ['DEVICE_DESKTOP', 'DESKTOP', 'COMPUTER'],
      ['TIME_MORNING', 'MORNING', 'AM'],
      ['TIME_AFTERNOON', 'AFTERNOON', 'PM'],
      ['TIME_EVENING', 'EVENING', 'NIGHT'],
      ['BEHAVIOR_FREQUENT', 'LOYAL', 'RETURNING'],
      ['BEHAVIOR_NEW', 'FIRST_TIME', 'NEWCOMER'],
      ['GYM', 'FITNESS', 'WORKOUT', 'EXERCISE'],
      ['VEGAN', 'VEGETARIAN', 'PLANT_BASED'],
      ['HEALTHY', 'NUTRITION', 'WELLNESS'],
    ];

    return categories.some(category => 
      category.includes(tag1) && category.includes(tag2)
    );
  }

  /**
   * Fetch banners from Contentful Components API
   */
  public async fetchBanners(): Promise<ContentAsset[]> {
    try {
      const response = await fetch('/api/content/components?type=banners');
      if (!response.ok) {
        throw new Error('Failed to fetch banners');
      }
      const banners = await response.json();
      return this.sortContentByRelevance(banners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  }

  /**
   * Fetch product highlights from Contentful Components API
   */
  public async fetchProductHighlights(): Promise<ContentAsset[]> {
    try {
      const response = await fetch('/api/content/components?type=productHighlights');
      if (!response.ok) {
        throw new Error('Failed to fetch product highlights');
      }
      const highlights = await response.json();
      return this.sortContentByRelevance(highlights);
    } catch (error) {
      console.error('Error fetching product highlights:', error);
      return [];
    }
  }

  /**
   * Fetch testimonials from Contentful Components API
   */
  public async fetchTestimonials(): Promise<ContentAsset[]> {
    try {
      const response = await fetch('/api/content/components?type=testimonials');
      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }
      const testimonials = await response.json();
      return this.sortContentByRelevance(testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }

  /**
   * Fetch features from Contentful Components API
   */
  public async fetchFeatures(): Promise<ContentAsset[]> {
    try {
      const response = await fetch('/api/content/components?type=features');
      if (!response.ok) {
        throw new Error('Failed to fetch features');
      }
      const features = await response.json();
      return this.sortContentByRelevance(features);
    } catch (error) {
      console.error('Error fetching features:', error);
      return [];
    }
  }

  /**
   * Sort content by relevance score
   */
  private sortContentByRelevance(content: ContentAsset[]): ContentAsset[] {
    const userTags = tagManager.getAllTags().map(tag => tag.tag);
    const scoredContent = content.map(asset => ({
      ...asset,
      relevanceScore: this.calculateRelevanceScore(asset, userTags),
    }));
    return scoredContent.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Get personalized banners for the homepage
   */
  public async getPersonalizedBanners(limit: number = 3): Promise<ContentAsset[]> {
    try {
      const banners = await this.fetchBanners();
      return banners.slice(0, limit);
    } catch (error) {
      console.error('Error fetching personalized banners:', error);
      return [];
    }
  }

  /**
   * Get personalized product highlights
   */
  public async getPersonalizedProductHighlights(limit: number = 6): Promise<ContentAsset[]> {
    try {
      const highlights = await this.fetchProductHighlights();
      return highlights.slice(0, limit);
    } catch (error) {
      console.error('Error fetching personalized product highlights:', error);
      return [];
    }
  }

  /**
   * Get personalized testimonials
   */
  public async getPersonalizedTestimonials(limit: number = 3): Promise<ContentAsset[]> {
    try {
      const testimonials = await this.fetchTestimonials();
      return testimonials.slice(0, limit);
    } catch (error) {
      console.error('Error fetching personalized testimonials:', error);
      return [];
    }
  }

  /**
   * Get personalized features/benefits content
   */
  public async getPersonalizedFeatures(limit: number = 4): Promise<ContentAsset[]> {
    try {
      const features = await this.fetchFeatures();
      return features.slice(0, limit);
    } catch (error) {
      console.error('Error fetching personalized features:', error);
      return [];
    }
  }

  /**
   * Log content interaction for improving personalization
   */
  public logContentInteraction(contentId: string, interactionType: 'view' | 'click' | 'share'): void {
    // Add behavioral tag based on interaction
    tagManager.addBehavioralTag(`CONTENT_${interactionType.toUpperCase()}`, contentId);
    
    // Track interaction for analytics
    fetch('/api/analytics/content-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentId,
        interactionType,
        timestamp: new Date().toISOString(),
        userTags: tagManager.getAllTags(),
      }),
    }).catch(error => {
      console.error('Error logging content interaction:', error);
    });
  }

  /**
   * Get content recommendations based on user behavior
   */
  public getContentRecommendations(currentContent: ContentAsset, allContent: ContentAsset[]): ContentAsset[] {
    const userTags = tagManager.getAllTags().map(tag => tag.tag);
    
    // Find similar content based on tag overlap
    const recommendations = allContent
      .filter(content => content.id !== currentContent.id && content.isActive)
      .map(content => ({
        ...content,
        similarity: this.calculateSimilarity(currentContent.tags, content.tags, userTags),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    return recommendations;
  }

  /**
   * Calculate similarity between content pieces
   */
  private calculateSimilarity(tags1: string[], tags2: string[], userTags: string[]): number {
    const commonTags = tags1.filter(tag => tags2.includes(tag));
    const userRelevantTags = commonTags.filter(tag => userTags.includes(tag));
    
    // Base similarity from common tags
    let similarity = commonTags.length / Math.max(tags1.length, tags2.length);
    
    // Boost similarity if common tags are relevant to user
    if (userRelevantTags.length > 0) {
      similarity += (userRelevantTags.length / commonTags.length) * 0.3;
    }
    
    return Math.min(similarity, 1.0);
  }
}

// Export singleton instance
export const contentPersonalizer = ContentPersonalizer.getInstance();

// React hook for personalized content
export function usePersonalizedContent() {
  return {
    getPersonalizedBanners: contentPersonalizer.getPersonalizedBanners.bind(contentPersonalizer),
    getPersonalizedProductHighlights: contentPersonalizer.getPersonalizedProductHighlights.bind(contentPersonalizer),
    getPersonalizedTestimonials: contentPersonalizer.getPersonalizedTestimonials.bind(contentPersonalizer),
    getPersonalizedFeatures: contentPersonalizer.getPersonalizedFeatures.bind(contentPersonalizer),
    logContentInteraction: contentPersonalizer.logContentInteraction.bind(contentPersonalizer),
    getContentRecommendations: contentPersonalizer.getContentRecommendations.bind(contentPersonalizer),
  };
}
