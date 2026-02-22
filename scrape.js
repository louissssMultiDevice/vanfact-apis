/**
 * VanFact API - Scraping Utilities
 * Various scraping functions for different platforms
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

// Axios instance with common config
const axiosInstance = axios.create({
    timeout: 30000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    },
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

/**
 * TikTok Downloader - No Watermark
 * @param {string} url - TikTok video URL
 * @returns {Promise<Object>} Video data
 */
export async function tiktokDownloader(url) {
    try {
        // Validate URL
        if (!url.match(/https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/.+/)) {
            throw new Error('Invalid TikTok URL');
        }

        // Method 1: Using ssstik.io API
        const ssstikData = await ssstikDownload(url);
        if (ssstikData.status) return ssstikData;

        // Method 2: Using snaptik.app API
        const snaptikData = await snaptikDownload(url);
        if (snaptikData.status) return snaptikData;

        // Method 3: Using tiktok-downloader API
        const downloaderData = await tiktokApiDownload(url);
        if (downloaderData.status) return downloaderData;

        throw new Error('All download methods failed');

    } catch (error) {
        return {
            status: false,
            message: error.message,
            error: error.response?.data || null
        };
    }
}

// ssstik.io method
async function ssstikDownload(url) {
    try {
        const res = await axiosInstance.post('https://ssstik.io/abc', 
            new URLSearchParams({ id: url, locale: 'en' }),
            {
                headers: {
                    ...axiosInstance.defaults.headers,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Origin': 'https://ssstik.io',
                    'Referer': 'https://ssstik.io/en'
                }
            }
        );

        const $ = cheerio.load(res.data);
        
        const downloadLink = $('a[data-event="download"]').attr('href');
        const thumbnail = $('img[data-event="thumbnail"]').attr('src');
        const title = $('h1').text().trim() || $('p.maintext').text().trim();
        const author = $('a[data-event="author"]').text().trim();

        if (!downloadLink) throw new Error('Download link not found');

        return {
            status: true,
            source: 'ssstik',
            data: {
                title: title || 'TikTok Video',
                author: author || 'Unknown',
                thumbnail: thumbnail || null,
                video: {
                    noWatermark: downloadLink,
                    watermark: null
                },
                audio: null // ssstik doesn't provide audio separately
            }
        };

    } catch (error) {
        return { status: false };
    }
}

// snaptik.app method
async function snaptikDownload(url) {
    try {
        const tokenRes = await axiosInstance.get('https://snaptik.app/');
        const $ = cheerio.load(tokenRes.data);
        const token = $('input[name="token"]').val();

        const res = await axiosInstance.post('https://snaptik.app/abc2.php',
            new URLSearchParams({ url: url, token: token }),
            {
                headers: {
                    ...axiosInstance.defaults.headers,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Origin': 'https://snaptik.app',
                    'Referer': 'https://snaptik.app/'
                }
            }
        );

        const result = res.data;
        
        if (result.error) throw new Error(result.error);

        return {
            status: true,
            source: 'snaptik',
            data: {
                title: result.title || 'TikTok Video',
                author: result.author?.unique_id || 'Unknown',
                thumbnail: result.thumbnail || null,
                video: {
                    noWatermark: result.link?.[0] || result.url,
                    watermark: null
                },
                audio: result.music || null
            }
        };

    } catch (error) {
        return { status: false };
    }
}

// Alternative TikTok API method
async function tiktokApiDownload(url) {
    try {
        const apiUrl = `https://api.tiktokdownloader.io/api/v1/tiktok?url=${encodeURIComponent(url)}`;
        const res = await axiosInstance.get(apiUrl);
        
        if (!res.data.success) throw new Error('API request failed');

        return {
            status: true,
            source: 'tiktok-api',
            data: {
                title: res.data.data.title || 'TikTok Video',
                author: res.data.data.author?.nickname || 'Unknown',
                thumbnail: res.data.data.cover || null,
                video: {
                    noWatermark: res.data.data.video?.no_watermark,
                    watermark: res.data.data.video?.watermark
                },
                audio: res.data.data.music || null,
                stats: res.data.data.stats || null
            }
        };

    } catch (error) {
        return { status: false };
    }
}

/**
 * Instagram Downloader
 * @param {string} url - Instagram post/reel URL
 * @returns {Promise<Object>} Media data
 */
export async function instagramDownloader(url) {
    try {
        if (!url.match(/https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/.+/)) {
            throw new Error('Invalid Instagram URL');
        }

        // Using savefrom.net API
        const res = await axiosInstance.get(`https://savefrom.net/api/convert?url=${encodeURIComponent(url)}`);
        
        if (!res.data || !res.data.url) {
            throw new Error('Media not found');
        }

        return {
            status: true,
            data: {
                type: res.data.type || 'video',
                thumbnail: res.data.thumb || null,
                media: Array.isArray(res.data.url) ? res.data.url : [res.data.url],
                title: res.data.meta?.title || 'Instagram Media',
                author: res.data.meta?.source || 'Unknown'
            }
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

/**
 * YouTube Downloader Info
 * @param {string} url - YouTube video URL
 * @returns {Promise<Object>} Video info
 */
export async function youtubeInfo(url) {
    try {
        if (!url.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/)) {
            throw new Error('Invalid YouTube URL');
        }

        // Using y2mate.is API
        const res = await axiosInstance.post('https://y2mate.is/analyze',
            new URLSearchParams({ url: url }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        );

        const data = res.data;
        
        if (!data.success) throw new Error('Failed to fetch video info');

        return {
            status: true,
            data: {
                title: data.title,
                thumbnail: data.thumbnail,
                duration: data.duration,
                author: data.author,
                formats: {
                    mp4: data.formats?.mp4 || [],
                    mp3: data.formats?.mp3 || []
                }
            }
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

/**
 * Facebook Downloader
 * @param {string} url - Facebook video URL
 * @returns {Promise<Object>} Video data
 */
export async function facebookDownloader(url) {
    try {
        if (!url.match(/https?:\/\/(www\.)?(facebook\.com|fb\.watch)\/.+/)) {
            throw new Error('Invalid Facebook URL');
        }

        const res = await axiosInstance.post('https://fdown.net/download.php',
            new URLSearchParams({ URLz: url }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const $ = cheerio.load(res.data);
        
        const title = $('.card-title').text().trim();
        const sdLink = $('a[href*="video"]').attr('href');
        const hdLink = $('a:contains("HD Quality")').attr('href');

        if (!sdLink && !hdLink) throw new Error('Video not found');

        return {
            status: true,
            data: {
                title: title || 'Facebook Video',
                video: {
                    sd: sdLink || null,
                    hd: hdLink || null
                }
            }
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

/**
 * Twitter/X Downloader
 * @param {string} url - Twitter/X post URL
 * @returns {Promise<Object>} Media data
 */
export async function twitterDownloader(url) {
    try {
        if (!url.match(/https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/)) {
            throw new Error('Invalid Twitter/X URL');
        }

        const res = await axiosInstance.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`);
        const $ = cheerio.load(res.data);

        const media = [];
        $('.origin-img, video').each((i, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src) media.push(src);
        });

        if (media.length === 0) throw new Error('No media found');

        return {
            status: true,
            data: {
                author: $('.username').text().trim() || 'Unknown',
                text: $('.text').text().trim() || '',
                media: media,
                thumbnail: $('.thumbnail').attr('src') || null
            }
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

/**
 * Google Search Scraper
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search results
 */
export async function googleSearch(query) {
    try {
        const res = await axiosInstance.get(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`);
        const $ = cheerio.load(res.data);
        
        const results = [];
        
        $('div.g').each((i, el) => {
            if (i >= 10) return; // Limit to 10 results
            
            const title = $(el).find('h3').text().trim();
            const link = $(el).find('a').attr('href');
            const snippet = $(el).find('div.VwiC3b').text().trim();
            
            if (title && link) {
                results.push({
                    title,
                    link: link.startsWith('/url?') ? new URL('https://google.com' + link).searchParams.get('q') : link,
                    snippet
                });
            }
        });

        return {
            status: true,
            query: query,
            total: results.length,
            results: results
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

/**
 * Get HTML content from URL
 * @param {string} url - Target URL
 * @returns {Promise<Object>} HTML content
 */
export async function fetchHTML(url) {
    try {
        const res = await axiosInstance.get(url);
        const $ = cheerio.load(res.data);
        
        // Extract common metadata
        const title = $('title').text().trim();
        const description = $('meta[name="description"]').attr('content') || 
                           $('meta[property="og:description"]').attr('content') || '';
        const image = $('meta[property="og:image"]').attr('content') || '';
        
        return {
            status: true,
            url: url,
            title: title,
            description: description,
            image: image,
            html: res.data.substring(0, 5000) // Limit HTML size
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

/**
 * Pinterest Downloader
 * @param {string} url - Pinterest pin URL
 * @returns {Promise<Object>} Media data
 */
export async function pinterestDownloader(url) {
    try {
        if (!url.match(/https?:\/\/(www\.)?pinterest\.(com|id)\/.+/)) {
            throw new Error('Invalid Pinterest URL');
        }

        const res = await axiosInstance.get(`https://www.expertsphp.com/facebook-video-downloader.php?url=${encodeURIComponent(url)}`);
        const $ = cheerio.load(res.data);
        
        const mediaUrl = $('video source').attr('src') || $('img[alt*="Pinterest"]').attr('src');
        
        if (!mediaUrl) throw new Error('Media not found');

        return {
            status: true,
            data: {
                url: mediaUrl,
                type: mediaUrl.includes('.mp4') ? 'video' : 'image',
                thumbnail: $('meta[property="og:image"]').attr('content') || null
            }
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

/**
 * Spotify Track Info
 * @param {string} url - Spotify track URL
 * @returns {Promise<Object>} Track info
 */
export async function spotifyInfo(url) {
    try {
        if (!url.match(/https?:\/\/(open\.)?spotify\.com\/track\/.+/)) {
            throw new Error('Invalid Spotify URL');
        }

        // Using spotifydown.com API
        const trackId = url.split('/track/')[1]?.split('?')[0];
        
        const res = await axiosInstance.get(`https://api.spotifydown.com/download/${trackId}`, {
            headers: {
                'Origin': 'https://spotifydown.com',
                'Referer': 'https://spotifydown.com/'
            }
        });

        if (!res.data.success) throw new Error('Track not found');

        return {
            status: true,
            data: {
                title: res.data.title,
                artist: res.data.artists,
                album: res.data.album,
                cover: res.data.cover,
                duration: res.data.duration,
                link: res.data.link
            }
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

/**
 * MediaFire Downloader
 * @param {string} url - MediaFire file URL
 * @returns {Promise<Object>} Direct download link
 */
export async function mediafireDownloader(url) {
    try {
        if (!url.match(/https?:\/\/(www\.)?mediafire\.com\/(file|view)\/.+/)) {
            throw new Error('Invalid MediaFire URL');
        }

        const res = await axiosInstance.get(url);
        const $ = cheerio.load(res.data);
        
        const downloadLink = $('a#downloadButton').attr('href');
        const fileName = $('div.dl-btn-label').attr('title') || $('div.filename').text().trim();
        const fileSize = $('div.dl-btn-label').text().match(/\((.*?)\)/)?.[1] || 'Unknown';

        if (!downloadLink) throw new Error('Download link not found');

        return {
            status: true,
            data: {
                filename: fileName,
                size: fileSize,
                mimetype: getMimeType(fileName),
                link: downloadLink
            }
        };

    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

// Helper function
function getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'mp4': 'video/mp4',
        'mp3': 'audio/mpeg',
        'pdf': 'application/pdf',
        'zip': 'application/zip',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Export all functions
export default {
    tiktokDownloader,
    instagramDownloader,
    youtubeInfo,
    facebookDownloader,
    twitterDownloader,
    googleSearch,
    fetchHTML,
    pinterestDownloader,
    spotifyInfo,
    mediafireDownloader
};
      
