import { googleSearch } from '../lib/scrape.js';
import { success, error, getCache, setCache, getClientIP, checkRateLimit } from '../lib/myfunc.js';

export default async function handler(req, res) {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`search:${clientIP}`, 30, 60000);
    
    if (!rateLimit.allowed) {
        return error(res, 'Rate limit exceeded', 429);
    }

    const { q, query } = req.query;
    const searchQuery = q || query;
    
    if (!searchQuery) {
        return error(res, "Parameter 'q' atau 'query' diperlukan", 400);
    }

    const cacheKey = `search:${searchQuery}`;
    const cached = getCache(cacheKey);
    if (cached) {
        return success(res, cached, 'Success (cached)');
    }

    try {
        const result = await googleSearch(searchQuery);
        
        if (!result.status) {
            return error(res, result.message, 500);
        }

        setCache(cacheKey, result, 600); // 10 min cache
        return success(res, result, 'Search completed');
        
    } catch (err) {
        console.error('Search Error:', err);
        return error(res, 'Internal server error', 500);
    }
}
