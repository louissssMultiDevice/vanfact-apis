/**
 * VanFact API v2 - Main Entry Point
 * Powerful REST API with multiple endpoints
 */

import { success, error } from '../lib/myfunc.js';

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // API Documentation Response
    return success(res, {
        name: "VanFact API",
        version: "2.0.0",
        owner: "Ndii",
        description: "Powerful REST API Service with multiple endpoints",
        base_url: "https://" + req.headers.host + "/api",
        api_key: "ndii",
        endpoints: {
            // Information
            planet: {
                path: "/api/planet",
                method: "GET",
                description: "Planetary information & visualization",
                params: ["name", "image", "list"]
            },
            prayreminder: {
                path: "/api/prayreminder",
                method: "GET",
                description: "Daily prayer schedule by city",
                params: ["city"]
            },
            deepseek: {
                path: "/api/deepseek",
                method: "GET",
                description: "AI text generation",
                params: ["prompt", "model"]
            },
            status: {
                path: "/api/status",
                method: "GET",
                description: "System status & statistics",
                params: []
            },
            
            // Downloaders
            tiktok: {
                path: "/api/tiktok",
                method: "GET",
                description: "TikTok video downloader (no watermark)",
                params: ["url"]
            },
            instagram: {
                path: "/api/instagram",
                method: "GET",
                description: "Instagram post/reel downloader",
                params: ["url"]
            },
            youtube: {
                path: "/api/youtube",
                method: "GET",
                description: "YouTube video info & formats",
                params: ["url"]
            },
            facebook: {
                path: "/api/facebook",
                method: "GET",
                description: "Facebook video downloader",
                params: ["url"]
            },
            twitter: {
                path: "/api/twitter",
                method: "GET",
                description: "Twitter/X media downloader",
                params: ["url"]
            },
            spotify: {
                path: "/api/spotify",
                method: "GET",
                description: "Spotify track information",
                params: ["url"]
            },
            mediafire: {
                path: "/api/mediafire",
                method: "GET",
                description: "MediaFire direct download link",
                params: ["url"]
            },
            
            // Tools
            search: {
                path: "/api/search",
                method: "GET",
                description: "Google search results",
                params: ["q", "query"]
            },
            fetch: {
                path: "/api/fetch",
                method: "GET",
                description: "Generic HTML fetcher",
                params: ["url"]
            },
            
            // Request System
            request: {
                path: "/api/request",
                method: "POST, GET, PUT, DELETE",
                description: "Feature request system",
                params: ["name", "feature", "description", "code", "contact"]
            },
            notifications: {
                path: "/api/notifications",
                method: "GET, POST, PUT, DELETE",
                description: "Notification system",
                params: ["title", "message", "type"]
            }
        },
        documentation: "/docs/apis.html",
        request_feature: "/request.html",
        admin_panel: "/admin.html",
        stats: {
            total_endpoints: 15,
            categories: ["Information", "Downloaders", "Tools", "System"]
        }
    }, "Welcome to VanFact API!");
}
