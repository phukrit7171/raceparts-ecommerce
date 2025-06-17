import cache from './cache';

// Default blocklist URL (replace with your actual URL)
const DEFAULT_BLOCKLIST_URL = 'https://raw.githubusercontent.com/Bon-Appetit/porn-domains/refs/heads/master/block.txt';

// In-memory cache with TTL (1 hour)
const BLOCKLIST_CACHE_KEY = 'blocklist';
const BLOCKLIST_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Default blocklist (fallback if fetch fails)
const DEFAULT_BLOCKLIST: string[] = [
  'example-blocked-domain.com',
  'another-blocked-domain.com'
];

/**
 * Checks if a URL is in the blocklist
 * @param url The URL to check
 * @param blocklist The blocklist to check against
 * @returns boolean indicating if the URL is blocked
 */
function isUrlBlocked(url: string, blocklist: string[]): boolean {
  if (!url || !blocklist.length) return false;
  
  try {
    const { hostname } = new URL(url);
    if (!hostname) return false;
    
    return blocklist.some(domain => {
      if (!domain) return false;
      return hostname === domain || hostname.endsWith(`.${domain}`);
    });
  } catch (error) {
    console.error('Error checking URL against blocklist:', error);
    return false;
  }
}

/**
 * Fetches the blocklist from the specified URL or returns a cached version
 * @param url Optional custom blocklist URL
 * @returns Promise with the blocklist array
 */
async function fetchBlocklist(url: string = DEFAULT_BLOCKLIST_URL): Promise<string[]> {
  try {
    // First check cache
    const cachedList = await cache.getWithTTL<string[]>(BLOCKLIST_CACHE_KEY, BLOCKLIST_TTL);
    if (cachedList && Array.isArray(cachedList)) {
      return cachedList;
    }

    // If not in cache, try to fetch the latest blocklist
    const response = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch blocklist, using default');
      return [...DEFAULT_BLOCKLIST];
    }

    const text = await response.text();
    const blocklist = text
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain && !domain.startsWith('#'));

    // Cache the result
    await cache.setWithTTL(BLOCKLIST_CACHE_KEY, blocklist, BLOCKLIST_TTL);
    
    return blocklist;
  } catch (error) {
    console.error('Error fetching blocklist:', error);
    return [...DEFAULT_BLOCKLIST];
  }
}

/**
 * Checks if a URL is blocked by the blocklist
 * @param url The URL to check
 * @returns Promise that resolves to true if the URL is blocked
 */
export async function isBlocked(url: string): Promise<boolean> {
  if (!url) return false;
  
  try {
    const blocklist = await fetchBlocklist();
    return isUrlBlocked(url, blocklist);
  } catch (error) {
    console.error('Error checking if URL is blocked:', error);
    return isUrlBlocked(url, DEFAULT_BLOCKLIST);
  }
}

export const updateBlocklist = async (): Promise<void> => {
  try {
    const response = await fetch(DEFAULT_BLOCKLIST_URL, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (response.ok) {
      const text = await response.text();
      const blocklist = text.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
      
      await cache.setWithTTL(BLOCKLIST_CACHE_KEY, blocklist, BLOCKLIST_TTL);
    }
  } catch (error) {
    console.error('Error updating blocklist:', error);
  }
};
