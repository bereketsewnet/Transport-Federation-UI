// CMS API Endpoints for managing website content
import apiClient, { publicApiClient } from './client';
import { AxiosResponse } from 'axios';

// ==================== TYPES ====================

// Home Content
export interface HomeContent {
  id: number;
  heroTitleEn: string;
  heroTitleAm: string;
  heroSubtitleEn: string;
  heroSubtitleAm: string;
  overviewEn: string;
  overviewAm: string;
  stat1LabelEn: string;
  stat1LabelAm: string;
  stat1Value: number;
  stat2LabelEn: string;
  stat2LabelAm: string;
  stat2Value: number;
  stat3LabelEn: string;
  stat3LabelAm: string;
  stat3Value: number;
  stat4LabelEn: string;
  stat4LabelAm: string;
  stat4Value: number;
  heroImage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeContentUpdate {
  heroTitleEn?: string;
  heroTitleAm?: string;
  heroSubtitleEn?: string;
  heroSubtitleAm?: string;
  overviewEn?: string;
  overviewAm?: string;
  stat1Value?: number;
  stat2Value?: number;
  stat2LabelEn?: string;
  stat2LabelAm?: string;
  stat3Value?: number;
  stat3LabelEn?: string;
  stat3LabelAm?: string;
  stat4Value?: number;
  stat4LabelEn?: string;
  stat4LabelAm?: string;
}

// About Content
export interface AboutContent {
  id: number;
  missionEn: string;
  missionAm: string;
  visionEn: string;
  visionAm: string;
  valuesEn: string[];
  valuesAm: string[];
  historyEn: string;
  historyAm: string;
  objectivesEn: string[];
  objectivesAm: string[];
  structureTitleEn: string;
  structureTitleAm: string;
  structureDepartmentsEn: string[];
  structureDepartmentsAm: string[];
  stakeholdersTitleEn: string;
  stakeholdersTitleAm: string;
  stakeholdersListEn: string[];
  stakeholdersListAm: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutContentUpdate {
  missionEn?: string;
  missionAm?: string;
  visionEn?: string;
  visionAm?: string;
  valuesEn?: string[];
  valuesAm?: string[];
  historyEn?: string;
  historyAm?: string;
  objectivesEn?: string[];
  objectivesAm?: string[];
  structureTitleEn?: string;
  structureTitleAm?: string;
  structureDepartmentsEn?: string[];
  structureDepartmentsAm?: string[];
  stakeholdersTitleEn?: string;
  stakeholdersTitleAm?: string;
  stakeholdersListEn?: string[];
  stakeholdersListAm?: string[];
}

// Executive
export interface Executive {
  id: number;
  nameEn: string;
  nameAm: string;
  positionEn: string;
  positionAm: string;
  bioEn?: string | null;
  bioAm?: string | null;
  image?: string | null;
  type: 'executive' | 'expert';
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExecutiveCreate {
  nameEn: string;
  nameAm: string;
  positionEn: string;
  positionAm: string;
  bioEn?: string;
  bioAm?: string;
  image?: string;
  type: 'executive' | 'expert';
  displayOrder?: number;
}

export interface ExecutiveUpdate {
  nameEn?: string;
  nameAm?: string;
  positionEn?: string;
  positionAm?: string;
  bioEn?: string;
  bioAm?: string;
  image?: string;
  type?: 'executive' | 'expert';
  displayOrder?: number;
}

// Contact Info
export interface ContactInfo {
  id: number;
  addressEn: string;
  addressAm: string;
  phone: string;
  phone2?: string | null;
  email: string;
  fax?: string | null;
  poBox?: string | null;
  mapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  telegramUrl?: string | null;
  youtubeUrl?: string | null;
  workingHoursEn?: string | null;
  workingHoursAm?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInfoUpdate {
  addressEn?: string;
  addressAm?: string;
  phone?: string;
  phone2?: string;
  email?: string;
  fax?: string;
  poBox?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
  facebookUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  telegramUrl?: string;
  youtubeUrl?: string;
  workingHoursEn?: string;
  workingHoursAm?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    page?: number;
    per_page?: number;
    total_pages?: number;
  };
}

// ==================== HOME CONTENT ENDPOINTS ====================

/**
 * Get home page content (public)
 */
export const getHomeContent = (): Promise<AxiosResponse<ApiResponse<HomeContent>>> => {
  return publicApiClient.get('/api/cms/home-content');
};

/**
 * Update home page content (admin only)
 */
export const updateHomeContent = (data: HomeContentUpdate): Promise<AxiosResponse<ApiResponse<HomeContent>>> => {
  return apiClient.put('/api/cms/home-content', data);
};

/**
 * Upload hero image for home page (admin only)
 */
export const uploadHeroImage = (file: File): Promise<AxiosResponse<{ message: string; imageUrl: string }>> => {
  const formData = new FormData();
  formData.append('image', file);
  
  return apiClient.post('/api/cms/home-content/hero-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ==================== ABOUT CONTENT ENDPOINTS ====================

/**
 * Get about page content (public)
 */
export const getAboutContent = (): Promise<AxiosResponse<ApiResponse<AboutContent>>> => {
  return publicApiClient.get('/api/cms/about-content');
};

/**
 * Update about page content (admin only)
 */
export const updateAboutContent = (data: AboutContentUpdate): Promise<AxiosResponse<ApiResponse<AboutContent>>> => {
  return apiClient.put('/api/cms/about-content', data);
};

// ==================== EXECUTIVES ENDPOINTS ====================

/**
 * Get all executives/experts (public)
 */
export const getExecutives = (params?: {
  type?: 'executive' | 'expert';
  page?: number;
  per_page?: number;
}): Promise<AxiosResponse<ApiResponse<Executive[]>>> => {
  return publicApiClient.get('/api/cms/executives', { params });
};

/**
 * Get single executive by ID (public)
 */
export const getExecutive = (id: number): Promise<AxiosResponse<ApiResponse<Executive>>> => {
  return publicApiClient.get(`/api/cms/executives/${id}`);
};

/**
 * Create new executive (admin only)
 */
export const createExecutive = (data: ExecutiveCreate): Promise<AxiosResponse<ApiResponse<Executive>>> => {
  return apiClient.post('/api/cms/executives', data);
};

/**
 * Update executive (admin only)
 */
export const updateExecutive = (id: number, data: ExecutiveUpdate): Promise<AxiosResponse<ApiResponse<Executive>>> => {
  return apiClient.put(`/api/cms/executives/${id}`, data);
};

/**
 * Delete executive (admin only)
 */
export const deleteExecutive = (id: number): Promise<AxiosResponse<{ message: string }>> => {
  return apiClient.delete(`/api/cms/executives/${id}`);
};

/**
 * Upload image for executive (admin only)
 */
export const uploadExecutiveImage = (id: number, file: File): Promise<AxiosResponse<{ message: string; imageUrl: string }>> => {
  const formData = new FormData();
  formData.append('image', file);
  
  return apiClient.post(`/api/cms/executives/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// ==================== CONTACT INFO ENDPOINTS ====================

/**
 * Get contact information (public)
 */
export const getContactInfo = (): Promise<AxiosResponse<ApiResponse<ContactInfo>>> => {
  return publicApiClient.get('/api/cms/contact-info');
};

/**
 * Update contact information (admin only)
 */
export const updateContactInfo = (data: ContactInfoUpdate): Promise<AxiosResponse<ApiResponse<ContactInfo>>> => {
  return apiClient.put('/api/cms/contact-info', data);
};

