import { mediafireDownloader } from '../lib/scrape.js';
import { success, error, getCache, setCache, getClientIP, checkRateLimit } from '../lib/myfunc.js';

export default async function handler(req, res) {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`mf:${clientIP}`, 10, 60000);
    
    if (!rateLimit.allowed) {
        return error(res, 'Rate limit exceeded', 429);
    }

    const { url } = req.query;
    
    if (!url) {
        return error(res, "Parameter 'url' diperlukan", 400);
    }

    const cacheKey = `mf:${url}`;
    const cached = getCache(cacheKey);
    if (cached) {
        return success(res, cached, 'Success (cached)');
    }

    try {
        const result = await mediafireDownloader(url);
        
        if (!result.status) {
            return error(res, result.message, 500);
        }

        setCache(cacheKey, result.data, 3600);
        return success(res, result.data, 'Download link retrieved');
        
    } catch (err) {
        console.error('MediaFire Error:', err);
        return error(res, 'Internal server error', 500);
    }
}
