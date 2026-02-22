import { success, error, getClientIP, checkRateLimit, formatNumber, timeAgo } from '../lib/myfunc.js';

// In-memory stats
const stats = {
    startTime: Date.now(),
    requests: 0,
    endpoints: {
        planet: { hits: 0, lastUsed: null },
        prayreminder: { hits: 0, lastUsed: null },
        tiktok: { hits: 0, lastUsed: null },
        instagram: { hits: 0, lastUsed: null },
        youtube: { hits: 0, lastUsed: null },
        facebook: { hits: 0, lastUsed: null },
        twitter: { hits: 0, lastUsed: null },
        spotify: { hits: 0, lastUsed: null },
        mediafire: { hits: 0, lastUsed: null },
        deepseek: { hits: 0, lastUsed: null },
        search: { hits: 0, lastUsed: null },
        fetch: { hits: 0, lastUsed: null },
        status: { hits: 0, lastUsed: null }
    }
};

export function trackEndpoint(endpoint) {
    if (stats.endpoints[endpoint]) {
        stats.endpoints[endpoint].hits++;
        stats.endpoints[endpoint].lastUsed = new Date().toISOString();
    }
    stats.requests++;
}

export default async function handler(req, res) {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`status:${clientIP}`, 60, 60000);
    
    if (!rateLimit.allowed) {
        return error(res, 'Rate limit exceeded', 429);
    }

    trackEndpoint('status');

    const uptime = Date.now() - stats.startTime;
    
    // Calculate active endpoints (used in last 24 hours)
    const activeEndpoints = Object.entries(stats.endpoints)
        .filter(([_, data]) => data.hits > 0)
        .map(([name, data]) => ({
            name,
            hits: formatNumber(data.hits),
            lastUsed: data.lastUsed ? timeAgo(data.lastUsed) : 'Never'
        }));

    const data = {
        website: "VanFact API",
        version: "1.0.0",
        owner: "Ndii",
        uptime: {
            milliseconds: uptime,
            formatted: formatDuration(uptime)
        },
        totalRequests: formatNumber(stats.requests),
        totalApis: Object.keys(stats.endpoints).length,
        activeApis: activeEndpoints.length,
        endpoints: activeEndpoints,
        system: {
            platform: process.platform,
            nodeVersion: process.version,
            memory: formatMemory(process.memoryUsage())
        },
        timestamp: new Date().toISOString()
    };

    return success(res, data, 'System status retrieved');
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function formatMemory(mem) {
    return {
        used: formatBytes(mem.heapUsed),
        total: formatBytes(mem.heapTotal),
        rss: formatBytes(mem.rss)
    };
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
