import api from './api';

const CACHE_KEY = 'youtube-audiobook-searches-v2';
const QUOTA_BLOCK_KEY = 'youtube-audiobook-quota-blocked-until-v2';
const RESULT_CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
const NOT_FOUND_CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const QUOTA_BLOCK_DURATION_MS = 24 * 60 * 60 * 1000;
const pendingSearches = new Map();

const normaliseSearch = (title, author) =>
  `${title || ''} ${author || ''}`.trim().toLowerCase().replace(/\s+/g, ' ');

const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
};

const writeCache = (cache) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const getCachedResult = (cacheKey) => {
  const entry = readCache()[cacheKey];
  if (!entry) return undefined;

  const maxAge = entry.videoId ? RESULT_CACHE_DURATION_MS : NOT_FOUND_CACHE_DURATION_MS;
  if (Date.now() - entry.savedAt > maxAge) return undefined;

  return entry.videoId || null;
};

const cacheResult = (cacheKey, videoId) => {
  const cache = readCache();
  cache[cacheKey] = { videoId: videoId || null, savedAt: Date.now() };
  writeCache(cache);
};

const isQuotaError = (error) => {
  const reasons = error.response?.data?.error?.errors || [];
  return error.response?.status === 429 || reasons.some((item) =>
    ['quotaExceeded', 'dailyLimitExceeded'].includes(item.reason)
  );
};

const isQuotaBlocked = () => {
  const blockedUntil = Number(localStorage.getItem(QUOTA_BLOCK_KEY) || 0);
  return blockedUntil > Date.now();
};

const blockQuotaRequests = () => {
  // A conservative pause prevents every page visit from retrying after quota exhaustion.
  localStorage.setItem(QUOTA_BLOCK_KEY, String(Date.now() + QUOTA_BLOCK_DURATION_MS));
};

export const searchAudiobook = async (title, author = '') => {
  const cacheKey = normaliseSearch(title, author);
  const cachedResult = getCachedResult(cacheKey);
  if (cachedResult !== undefined) return cachedResult;

  if (isQuotaBlocked()) return null;

  // React Strict Mode can mount effects twice in development. Share an in-flight
  // lookup so both effects use one API request instead of two.
  if (pendingSearches.has(cacheKey)) return pendingSearches.get(cacheKey);

  const search = api.get('/books/audio/search', { params: { title, author } })
    .then((res) => {
      const videoId = res.data.videoId || null;
      // Cache misses too, so books with no result do not consume quota repeatedly.
      cacheResult(cacheKey, videoId);
      return videoId;
    })
    .catch((error) => {
      const quotaExceeded = isQuotaError(error) || error.message?.includes('quota has been reached');
      if (quotaExceeded) blockQuotaRequests();

      console.error('YouTube audiobook lookup failed:', error.message);
      const lookupError = new Error('YouTube audiobook lookup failed');
      // Treat Google's 403 quota response the same as a 429 in the UI.
      lookupError.status = quotaExceeded ? 429 : error.response?.status;
      throw lookupError;
    })
    .finally(() => {
      pendingSearches.delete(cacheKey);
    });

  pendingSearches.set(cacheKey, search);
  return search;
};
