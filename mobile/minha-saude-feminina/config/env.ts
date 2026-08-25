export function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, '');

  if (!apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL nao configurada');
  }

  return apiBaseUrl;
}
