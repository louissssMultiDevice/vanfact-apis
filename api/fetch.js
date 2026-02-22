import { fetchHTML } from '../lib/scrape.js';
import { success, error, getCache, setCache, getClientIP, checkRateLimit, isUrl } from '../lib/myfunc.js';

export default async function handler(req, res) {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`fetch:${clientIP}`, 20, 60000);
    
    if (!rateLimit.allowed) {
        return error(res, 'Rate limit exceeded', 429);
    }

    const { url } = req.query;
    
    if (!url) {
        return error(res, "Parameter 'url' diperlukan", 400);
    }

    if (!isUrl(url)) {
        return error(res, 'Invalid URL format', 400);
    }

    const cacheKey = `fetch:${url}`;
    const cached = getCache(cacheKey);
    if (cached) {
        return success(res, cached, 'Success (cached)');
    }

    try {
        const result = await fetchHTML(url);
        
        if (!result.status) {
            return error(res, result.message, 500);
        }

        setCache(cacheKey, result, 300); // 5 min cache
        return success(res, result, 'Content fetched successfully');
        
    } catch (err) {
        console.error('Fetch Error:', err);
        return error(res, 'Internal server error', 500);
    }
}
