import { tiktokDownloader } from '../lib/scrape.js';
import { success, error, getCache, setCache, getClientIP, checkRateLimit } from '../lib/myfunc.js';

export default async function handler(req, res) {
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`tiktok:${clientIP}`, 10, 60000); // 10 requests per minute
    
    if (!rateLimit.allowed) {
        return error(res, 'Rate limit exceeded. Try again later.', 429);
    }

    const { url } = req.query;
    
    if (!url) {
        return error(res, "Parameter 'url' diperlukan", 400);
    }

    // Check cache
    const cacheKey = `tiktok:${url}`;
    const cached = getCache(cacheKey);
    if (cached) {
        return success(res, cached, 'Success (cached)');
    }

    try {
        const result = await tiktokDownloader(url);
        
        if (!result.status) {
            return error(res, result.message || 'Failed to download video', 500);
        }

        // Cache successful result for 1 hour
        setCache(cacheKey, result.data, 3600);
        
        return success(res, result.data, 'Video downloaded successfully');
        
    } catch (err) {
        console.error('TikTok Error:', err);
        return error(res, 'Internal server error', 500);
    }
}
