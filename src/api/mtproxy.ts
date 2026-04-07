import apiClient from './client';

export interface ProxyItem {
  secret: string;
  link: string;
  web_link?: string;
  active: boolean;
  created_at: string | null;
  expires_at: string | null;
  days: number | null;
}

export interface MTProxyStatus {
  enabled: boolean;
  price_30d: number;
  proxies: ProxyItem[];
  active_count: number;
  total_count: number;
  is_admin: boolean;
}

export interface PurchaseResult {
  success: boolean;
  link: string | null;
  expires_at: string | null;
  error: string | null;
}

export interface DeleteResult {
  success: boolean;
  refund_kopeks: number;
  remaining_days: number;
  total_days: number;
}

export const mtproxyApi = {
  getStatus: () => apiClient.get<MTProxyStatus>('/cabinet/mtproxy/status').then(r => r.data),
  purchase: () => apiClient.post<PurchaseResult>('/cabinet/mtproxy/purchase').then(r => r.data),
  deleteProxy: (secret: string) => apiClient.post<DeleteResult>(`/cabinet/mtproxy/delete/${secret}`).then(r => r.data),
};

export interface GiftProxyRequest {
  recipient_username: string;
  quantity: number;
  message?: string;
}

export interface GiftProxyResult {
  success: boolean;
  created: number;
  total_cost: number;
  recipient_name: string | null;
  error: string | null;
}

export const mtproxyGiftApi = {
  gift: (data: GiftProxyRequest) => apiClient.post<GiftProxyResult>('/cabinet/mtproxy/gift', data).then(r => r.data),
};
