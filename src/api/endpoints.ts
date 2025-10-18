import apiClient from './client';
import { AxiosResponse } from 'axios';

// Types
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface SearchParams extends PaginationParams {
  q?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    per_page: number;
    total_pages?: number;
  };
}

// ==================== AUTH ====================

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  tempToken?: string;
  requirePasswordChange?: boolean;
  requireSecurityQuestions?: boolean;
  message?: string;
  user?: {
    id: number;
    mem_id?: number;
    username: string;
    role: string;
  };
}

export interface SecurityQuestion {
  id: number;
  question: string;
}

export interface ChangePasswordPayload {
  newPassword: string;
  securityQuestions?: Array<{
    questionId: number;
    answer: string;
  }>;
}

export const login = (payload: LoginPayload): Promise<AxiosResponse<LoginResponse>> => {
  return apiClient.post('/api/auth/login', payload);
};

export const logout = (): Promise<AxiosResponse> => {
  return apiClient.post('/api/auth/logout');
};

export const getSecurityQuestions = (): Promise<AxiosResponse<{ questions: SecurityQuestion[] }>> => {
  return apiClient.get('/api/auth/security-questions');
};

export const changePassword = (payload: ChangePasswordPayload): Promise<AxiosResponse<LoginResponse>> => {
  return apiClient.post('/api/auth/change-password', payload);
};

// ==================== UNIONS ====================

export interface Union {
  id: number;
  union_code: string;
  name_en: string;
  name_am: string;
  sector: string;
  organization: string;
  established_date: string;
  terms_of_election: number;
  strategic_plan_in_place: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnionFilters extends SearchParams {
  sector?: string;
}

export const getUnions = (params?: UnionFilters): Promise<AxiosResponse<ApiResponse<Union[]>>> => {
  return apiClient.get('/api/unions', { params });
};

export const getUnion = (id: number): Promise<AxiosResponse<Union>> => {
  return apiClient.get(`/api/unions/${id}`);
};

export const createUnion = (data: Partial<Union>): Promise<AxiosResponse<Union>> => {
  return apiClient.post('/api/unions', data);
};

export const updateUnion = (id: number, data: Partial<Union>): Promise<AxiosResponse<Union>> => {
  return apiClient.put(`/api/unions/${id}`, data);
};

export const deleteUnion = (id: number, confirm = true): Promise<AxiosResponse> => {
  return apiClient.delete(`/api/unions/${id}`, { params: { confirm } });
};

// ==================== MEMBERS ====================

export interface Member {
  mem_id: number;  // Backend uses mem_id, not id
  id?: number;      // Alias for compatibility
  mem_uuid?: string;
  union_id: number;
  member_code: string;
  first_name: string;
  father_name: string;
  surname: string;
  sex: string;
  birthdate: string;
  education: string;
  phone: string;
  email: string;
  salary: number;
  registry_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface MemberFilters extends SearchParams {
  union_id?: number;
  sex?: string;
}

export const getMembers = (
  params?: MemberFilters
): Promise<AxiosResponse<ApiResponse<Member[]>>> => {
  return apiClient.get('/api/members', { params });
};

export const getMember = (mem_id: number): Promise<AxiosResponse<Member>> => {
  return apiClient.get(`/api/members/${mem_id}`);
};

export const createMember = (data: Partial<Member>): Promise<AxiosResponse<Member>> => {
  return apiClient.post('/api/members', data);
};

export const updateMember = (mem_id: number, data: Partial<Member>): Promise<AxiosResponse<Member>> => {
  return apiClient.put(`/api/members/${mem_id}`, data);
};

export const archiveMember = (
  mem_id: number,
  reason?: string
): Promise<AxiosResponse<{ message: string }>> => {
  return apiClient.delete(`/api/members/${mem_id}`, {
    params: { archive: true },
    data: { reason },
  });
};

export const deleteMember = (mem_id: number): Promise<AxiosResponse> => {
  return apiClient.delete(`/api/members/${mem_id}`, { params: { confirm: true } });
};

// ==================== UNION EXECUTIVES ====================

export interface UnionExecutive {
  id: number;
  union_id: number;
  mem_id: number;
  position: string;
  appointed_date: string;
  term_length_years: number;
  created_at?: string;
}

export const getUnionExecutives = (
  params?: { union_id?: number } & PaginationParams
): Promise<AxiosResponse<ApiResponse<UnionExecutive[]>>> => {
  return apiClient.get('/api/union-executives', { params });
};

export const getUnionExecutive = (id: number): Promise<AxiosResponse<UnionExecutive>> => {
  return apiClient.get(`/api/union-executives/${id}`);
};

export const createUnionExecutive = (
  data: Partial<UnionExecutive>
): Promise<AxiosResponse<UnionExecutive>> => {
  return apiClient.post('/api/union-executives', data);
};

export const updateUnionExecutive = (
  id: number,
  data: Partial<UnionExecutive>
): Promise<AxiosResponse<UnionExecutive>> => {
  return apiClient.put(`/api/union-executives/${id}`, data);
};

export const deleteUnionExecutive = (id: number): Promise<AxiosResponse> => {
  return apiClient.delete(`/api/union-executives/${id}`, { params: { confirm: true } });
};

// ==================== CBAs ====================

export interface CBA {
  id: number;
  union_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  status: string;
  document_url?: string;
  notes?: string;
  registration_date: string;
  next_end_date: string;
  round: string;
  created_at?: string;
}

export const getCBAs = (
  params?: { union_id?: number; status?: string } & PaginationParams
): Promise<AxiosResponse<ApiResponse<CBA[]>>> => {
  return apiClient.get('/api/cbas', { params });
};

export const getCBA = (id: number): Promise<AxiosResponse<CBA>> => {
  return apiClient.get(`/api/cbas/${id}`);
};

export const createCBA = (data: Partial<CBA>): Promise<AxiosResponse<CBA>> => {
  return apiClient.post('/api/cbas', data);
};

export const updateCBA = (id: number, data: Partial<CBA>): Promise<AxiosResponse<CBA>> => {
  return apiClient.put(`/api/cbas/${id}`, data);
};

export const deleteCBA = (id: number): Promise<AxiosResponse> => {
  return apiClient.delete(`/api/cbas/${id}`, { params: { confirm: true } });
};

// ==================== NEWS ====================

export interface News {
  id: number;
  title: string;
  body: string;
  summary: string;
  published_at: string;
  is_published: boolean;
  image_filename?: string | null;
  is_local?: boolean;
  image_url?: string | null;
  created_at?: string;
}

export const getNews = (
  params?: { is_published?: boolean } & PaginationParams
): Promise<AxiosResponse<ApiResponse<News[]>>> => {
  return apiClient.get('/api/news', { params });
};

export const getNewsItem = (id: number): Promise<AxiosResponse<News>> => {
  return apiClient.get(`/api/news/${id}`);
};

export const createNews = (data: Partial<News>): Promise<AxiosResponse<News>> => {
  return apiClient.post('/api/news', data);
};

export const updateNews = (id: number, data: Partial<News>): Promise<AxiosResponse<News>> => {
  return apiClient.put(`/api/news/${id}`, data);
};

export const deleteNews = (id: number): Promise<AxiosResponse> => {
  return apiClient.delete(`/api/news/${id}`, { params: { confirm: true } });
};

// Upload news with image file
export const uploadNewsWithImage = (
  file: File,
  data: {
    title: string;
    body?: string;
    summary?: string;
    published_at?: string;
    is_published?: boolean;
  }
): Promise<AxiosResponse<News>> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('title', data.title);
  if (data.body) formData.append('body', data.body);
  if (data.summary) formData.append('summary', data.summary);
  if (data.published_at) formData.append('published_at', data.published_at);
  if (data.is_published !== undefined) formData.append('is_published', String(data.is_published));

  return apiClient.post('/api/news', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Update news with new image file
export const updateNewsWithImage = (
  id: number,
  file: File,
  data: {
    title: string;
    body?: string;
    summary?: string;
    published_at?: string;
    is_published?: boolean;
  }
): Promise<AxiosResponse<News>> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('title', data.title);
  formData.append('body', data.body || '');
  formData.append('summary', data.summary || '');
  formData.append('published_at', data.published_at || new Date().toISOString());
  formData.append('is_published', String(data.is_published ?? false));

  return apiClient.put(`/api/news/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Create news from URL
export const createNewsFromURL = (data: {
  title: string;
  body?: string;
  summary?: string;
  published_at?: string;
  is_published?: boolean;
  image_url: string;
}): Promise<AxiosResponse<News>> => {
  return apiClient.post('/api/news', data);
};

// ==================== GALLERIES & PHOTOS ====================

export interface Gallery {
  id: number;
  title: string;
  description: string;
  created_at?: string;
}

export interface Photo {
  id: number;
  gallery_id: number;
  filename: string;
  caption: string;
  taken_at: string;
  created_at?: string;
  image_url?: string; // Full URL for local files or external URL
  is_local?: boolean; // True if uploaded locally, false if from URL
}

export const getGalleries = (
  params?: PaginationParams
): Promise<AxiosResponse<ApiResponse<Gallery[]>>> => {
  return apiClient.get('/api/galleries', { params });
};

export const createGallery = (data: Partial<Gallery>): Promise<AxiosResponse<Gallery>> => {
  return apiClient.post('/api/galleries', data);
};

export const getPhotos = (
  params?: { gallery_id?: number } & PaginationParams
): Promise<AxiosResponse<ApiResponse<Photo[]>>> => {
  return apiClient.get('/api/photos', { params });
};

export const createPhoto = (data: Partial<Photo>): Promise<AxiosResponse<Photo>> => {
  return apiClient.post('/api/photos', data);
};

export const uploadPhoto = (
  file: File,
  galleryId: number,
  caption?: string,
  takenAt?: string
): Promise<AxiosResponse<Photo>> => {
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('gallery_id', galleryId.toString());
  if (caption) formData.append('caption', caption);
  if (takenAt) formData.append('taken_at', takenAt);

  return apiClient.post('/api/photos', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const createPhotoFromURL = (data: {
  gallery_id: number;
  image_url: string;
  caption?: string;
  taken_at?: string;
}): Promise<AxiosResponse<Photo>> => {
  return apiClient.post('/api/photos', data);
};

export const updatePhoto = (
  id: number,
  data: {
    caption?: string;
    taken_at?: string;
  }
): Promise<AxiosResponse<Photo>> => {
  return apiClient.put(`/api/photos/${id}`, data);
};

export const deletePhoto = (id: number): Promise<AxiosResponse<{ message: string }>> => {
  return apiClient.delete(`/api/photos/${id}`, {
    params: { confirm: 'true' }
  });
};

// ==================== ARCHIVES ====================

export interface Archive {
  id: number;
  title: string;
  description?: string;
  category: string;
  document_type: string;
  file_url: string;
  file_size?: number;
  file_name?: string;
  tags?: string[];
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
}

export interface ArchiveFilters extends SearchParams {
  category?: string;
  document_type?: string;
  is_public?: boolean;
  tags?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getArchives = (params?: ArchiveFilters): Promise<AxiosResponse<ApiResponse<Archive[]>>> => {
  return apiClient.get('/api/archives', { params });
};

export const getArchive = (id: number): Promise<AxiosResponse<Archive>> => {
  return apiClient.get(`/api/archives/${id}`);
};

export const createArchive = (data: Partial<Archive>): Promise<AxiosResponse<Archive>> => {
  return apiClient.post('/api/archives', data);
};

export const updateArchive = (id: number, data: Partial<Archive>): Promise<AxiosResponse<Archive>> => {
  return apiClient.put(`/api/archives/${id}`, data);
};

export const deleteArchive = (id: number): Promise<AxiosResponse> => {
  return apiClient.delete(`/api/archives/${id}`, { params: { confirm: true } });
};

export const uploadArchiveFile = (file: File, onProgress?: (progress: number) => void): Promise<AxiosResponse<{ file_url: string; file_name: string; file_size: number }>> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiClient.post('/api/archives/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

// ==================== TERMINATED UNIONS ====================

export interface TerminatedUnion {
  id: number;
  union_id: number;
  termination_date: string;
  termination_reason: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  union?: Union; // For display purposes
}

export interface TerminatedUnionFilters extends SearchParams {
  union_id?: number;
  termination_reason?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getTerminatedUnions = (params?: TerminatedUnionFilters): Promise<AxiosResponse<ApiResponse<TerminatedUnion[]>>> => {
  return apiClient.get('/api/terminated-unions', { params });
};

export const getTerminatedUnion = (id: number): Promise<AxiosResponse<TerminatedUnion>> => {
  return apiClient.get(`/api/terminated-unions/${id}`);
};

export const createTerminatedUnion = (data: Partial<TerminatedUnion>): Promise<AxiosResponse<TerminatedUnion>> => {
  return apiClient.post('/api/terminated-unions', data);
};

export const updateTerminatedUnion = (id: number, data: Partial<TerminatedUnion>): Promise<AxiosResponse<TerminatedUnion>> => {
  return apiClient.put(`/api/terminated-unions/${id}`, data);
};

export const deleteTerminatedUnion = (id: number): Promise<AxiosResponse> => {
  return apiClient.delete(`/api/terminated-unions/${id}`, { params: { confirm: true } });
};

// ==================== CONTACTS ====================

export interface Contact {
  id: number
  name: string;
  email_or_phone: string;
  subject: string;
  message: string;
  created_at?: string;
}

export const submitContact = (data: Partial<Contact>): Promise<AxiosResponse<Contact>> => {
  return apiClient.post('/api/contacts', data);
};

export const getContacts = (
  params?: PaginationParams
): Promise<AxiosResponse<ApiResponse<Contact[]>>> => {
  return apiClient.get('/api/contacts', { params });
};

// ==================== VISITORS ====================

export interface Visitor {
  id: number;
  visit_date: string;
  count: number;
}

export const getVisitors = (params?: {
  from?: string;
  to?: string;
}): Promise<AxiosResponse<ApiResponse<Visitor[]>>> => {
  return apiClient.get('/api/visitors', { params });
};

export const incrementVisitor = (data: {
  visit_date: string;
  increment: number;
}): Promise<AxiosResponse<Visitor>> => {
  return apiClient.post('/api/visitors', data);
};


// ==================== REPORTS ====================

export interface MembersSummaryReport {
  totals: Array<{ sex: string; cnt: number }>;
  per_year: Array<{ year: number; cnt: number }>;
}

export interface UnionsCBAExpiredReport {
  data: Array<{
    union_id: number;
    name_en: string;
    next_end_date: string;
  }>;
}

export const getMembersSummary = (): Promise<AxiosResponse<MembersSummaryReport>> => {
  return apiClient.get('/api/reports/members-summary');
};

export const getUnionsCBAExpired = (): Promise<AxiosResponse<UnionsCBAExpiredReport>> => {
  return apiClient.get('/api/reports/unions-cba-expired');
};

export const saveReportCache = (data: {
  report_name: string;
  payload: Record<string, unknown>;
}): Promise<AxiosResponse> => {
  return apiClient.post('/api/reports/cache', data);
};

// Additional Reports Endpoints (from postman_reports_collection.json and docs)
export interface MembersByGenderResponse {
  summary: {
    by_sex: Array<{ sex: string; count: number }>;
    grand_total: number;
  };
  by_year: Array<{ year: number; Male: number; Female: number; total: number }>; // for flexible charts
}

export const getMembersSummaryFull = (): Promise<AxiosResponse<MembersByGenderResponse>> => {
  return apiClient.get('/api/reports/members-summary');
};

export interface UnionsSummaryResponse {
  total_unions: number;
  by_sector: Array<{ sector: string; count: number }>;
  by_organization: Array<{ organization: string; count: number }>;
}

export const getUnionsSummary = (): Promise<AxiosResponse<UnionsSummaryResponse>> => {
  return apiClient.get('/api/reports/unions-summary');
};

export interface ExecutivesRemainingDaysItem {
  id: number;
  union_id: number;
  union_name: string;
  mem_id: number;
  executive_name: string;
  sex: string;
  position: string;
  appointed_date: string;
  term_end_date: string;
  days_remaining: number;
  status?: string;
}

export const getExecutivesRemainingDays = (): Promise<AxiosResponse<{ data: ExecutivesRemainingDaysItem[] }>> => {
  return apiClient.get('/api/reports/executives-remaining-days');
};

export const getExecutivesExpiringBefore = (date: string): Promise<AxiosResponse<{ target_date: string; count: number; data: ExecutivesRemainingDaysItem[] }>> => {
  return apiClient.get('/api/reports/executives-expiring-before', { params: { date } });
};

export const getExecutivesByUnion = (union_id: number): Promise<AxiosResponse<{ union_id: number; union_name: string; executives_count: { by_sex: Array<{ sex: string; count: number }>; total: number } }>> => {
  return apiClient.get('/api/reports/executives-by-union', { params: { union_id } });
};

export const getMembersUnder35 = (): Promise<AxiosResponse<{ category: string; by_sex: Array<{ sex: string; count: number }>; total: number }>> => {
  return apiClient.get('/api/reports/members-under-35');
};

export const getMembersAbove35 = (): Promise<AxiosResponse<{ category: string; by_sex: Array<{ sex: string; count: number }>; total: number }>> => {
  return apiClient.get('/api/reports/members-above-35');
};

export const getUnionsCBAStatus = (): Promise<AxiosResponse<{ total_unions: number; with_cba: number; without_cba: number; percentage_with_cba: string }>> => {
  return apiClient.get('/api/reports/unions-cba-status');
};

export const getUnionsWithoutCBA = (): Promise<AxiosResponse<{ count: number; data: Array<Record<string, unknown>> }>> => {
  return apiClient.get('/api/reports/unions-without-cba');
};

export const getUnionsCBAExpiredList = (): Promise<AxiosResponse<{ count: number; data: Array<Record<string, unknown>> }>> => {
  return apiClient.get('/api/reports/unions-cba-expired');
};

export const getUnionsCBAExpiringSoon = (days = 90): Promise<AxiosResponse<{ threshold_days: number; count: number; data: Array<Record<string, unknown>> }>> => {
  return apiClient.get('/api/reports/unions-cba-expiring-soon', { params: { days } });
};

export const getUnionsCBAOngoing = (): Promise<AxiosResponse<{ count: number; data: Array<Record<string, unknown>> }>> => {
  return apiClient.get('/api/reports/unions-cba-ongoing');
};

export const getGeneralAssemblyStatus = (): Promise<AxiosResponse<{ total_unions: number; conducted_general_assembly: number; not_conducted: number; percentage_conducted?: string }>> => {
  return apiClient.get('/api/reports/unions-general-assembly-status');
};

export const getUnionsNoGeneralAssembly = (): Promise<AxiosResponse<{ count: number; data: Array<Record<string, unknown>> }>> => {
  return apiClient.get('/api/reports/unions-no-general-assembly');
};

export const getUnionsAssemblyOnDate = (date: string): Promise<AxiosResponse<{ target_date?: string; search_date?: string; count: number; data: Array<Record<string, unknown>> }>> => {
  return apiClient.get('/api/reports/unions-assembly-on-date', { params: { date } });
};

export const getUnionsAssemblyRecent = (months = 3): Promise<AxiosResponse<{ threshold_months: number; count: number; data: Array<Record<string, unknown>> }>> => {
  return apiClient.get('/api/reports/unions-assembly-recent', { params: { months } });
};

export const getTerminatedUnionsCount = (): Promise<AxiosResponse<{ total_terminated: number; by_sector?: Array<{ sector: string; count: number }> }>> => {
  return apiClient.get('/api/reports/terminated-unions-count');
};

export const getTerminatedUnionsList = (): Promise<AxiosResponse<{ count: number; data: Array<Record<string, unknown>> }>> => {
  return apiClient.get('/api/reports/terminated-unions-list');
};

// ==================== ORGANIZATION LEADERS ====================

export interface OrgLeader {
  id: number;
  union_id: number;
  title: string;
  first_name: string;
  position: string;
  phone: string;
  email: string;
}

export const getOrgLeaders = (
  params?: PaginationParams
): Promise<AxiosResponse<ApiResponse<OrgLeader[]>>> => {
  return apiClient.get('/api/org-leaders', { params });
};

export const createOrgLeader = (data: Partial<OrgLeader>): Promise<AxiosResponse<OrgLeader>> => {
  return apiClient.post('/api/org-leaders', data);
};

// ==================== LOGIN ACCOUNTS (Admin) ====================

export interface LoginAccount {
  id: number;
  username: string;
  role: string;
  created_at?: string;
}

export const getLoginAccounts = (
  params?: PaginationParams
): Promise<AxiosResponse<ApiResponse<LoginAccount[]>>> => {
  return apiClient.get('/api/login-accounts', { params });
};

export const createLoginAccount = (data: {
  username: string;
  password: string;
  role: string;
}): Promise<AxiosResponse<LoginAccount>> => {
  return apiClient.post('/api/login-accounts', data);
};

export const resetPassword = (username: string, password: string): Promise<AxiosResponse> => {
  return apiClient.post(`/api/login-accounts/reset/${username}`, { password });
};

