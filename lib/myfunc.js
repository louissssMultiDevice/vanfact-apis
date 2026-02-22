/**
 * VanFact API - Utility Functions
 * Common helper functions used across the API
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==================== STRING UTILITIES ====================

/**
 * Generate random string
 * @param {number} length - Length of string
 * @param {string} chars - Characters to use
 * @returns {string} Random string
 */
export function randomString(length = 10, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate random number
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
export function randomNumber(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert to slug
 * @param {string} str - String to convert
 * @returns {string} Slug string
 */
export function toSlug(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Remove HTML tags
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
}

/**
 * Truncate text
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated string
 */
export function truncate(str, length = 100, suffix = '...') {
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
}

// ==================== DATE/TIME UTILITIES ====================

/**
 * Format date
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');
    
    const replacements = {
        'YYYY': d.getFullYear(),
        'MM': pad(d.getMonth() + 1),
        'DD': pad(d.getDate()),
        'HH': pad(d.getHours()),
        'mm': pad(d.getMinutes()),
        'ss': pad(d.getSeconds())
    };
    
    return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
}

/**
 * Get time ago
 * @param {Date|string} date - Date to compare
 * @returns {string} Time ago string
 */
export function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    return 'Just now';
}

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== CRYPTO/SECURITY ====================

/**
 * Generate MD5 hash
 * @param {string} str - String to hash
 * @returns {string} MD5 hash
 */
export function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Generate SHA256 hash
 * @param {string} str - String to hash
 * @returns {string} SHA256 hash
 */
export function sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
export function uuid() {
    return crypto.randomUUID();
}

/**
 * Encrypt text
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted text
 */
export function encrypt(text, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

/**
 * Decrypt text
 * @param {string} encrypted - Encrypted text
 * @param {string} key - Decryption key
 * @returns {string} Decrypted text
 */
export function decrypt(encrypted, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// ==================== VALIDATION ====================

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
export function isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid
 */
export function isUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate phone number (Indonesia)
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
export function isPhone(phone) {
    return /^(0|\+62|62)[0-9]{9,12}$/.test(phone.replace(/[-\s]/g, ''));
}

// ==================== FILE UTILITIES ====================

/**
 * Check if file exists
 * @param {string} filePath - File path
 * @returns {boolean} Exists
 */
export function fileExists(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
export function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/**
 * Get file extension
 * @param {string} filename - Filename
 * @returns {string} Extension
 */
export function getExt(filename) {
    return path.extname(filename).toLowerCase();
}

/**
 * Get MIME type
 * @param {string} filename - Filename
 * @returns {string} MIME type
 */
export function getMimeType(filename) {
    const ext = getExt(filename).replace('.', '');
    const types = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'pdf': 'application/pdf',
        'json': 'application/json',
        'txt': 'text/plain',
        'html': 'text/html'
    };
    return types[ext] || 'application/octet-stream';
}

// ==================== ARRAY/OBJECT UTILITIES ====================

/**
 * Pick object properties
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to pick
 * @returns {Object} New object
 */
export function pick(obj, keys) {
    return keys.reduce((acc, key) => {
        if (key in obj) acc[key] = obj[key];
        return acc;
    }, {});
}

/**
 * Omit object properties
 * @param {Object} obj - Source object
 * @param {string[]} keys - Keys to omit
 * @returns {Object} New object
 */
export function omit(obj, keys) {
    const acc = { ...obj };
    keys.forEach(key => delete acc[key]);
    return acc;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array by key
 * @param {Array} arr - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
        const group = item[key];
        acc[group] = acc[group] || [];
        acc[group].push(item);
        return acc;
    }, {});
}

/**
 * Shuffle array
 * @param {Array} arr - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Chunk array
 * @param {Array} arr - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Chunked array
 */
export function chunk(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

// ==================== HTTP UTILITIES ====================

/**
 * Parse query string
 * @param {string} query - Query string
 * @returns {Object} Parsed query
 */
export function parseQuery(query) {
    return Object.fromEntries(new URLSearchParams(query));
}

/**
 * Build query string
 * @param {Object} params - Parameters
 * @returns {string} Query string
 */
export function buildQuery(params) {
    return Object.entries(params)
        .filter(([_, v]) => v != null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
}

/**
 * Get client IP from request
 * @param {Object} req - Request object
 * @returns {string} Client IP
 */
export function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0].trim() 
        || req.headers['x-real-ip'] 
        || req.connection.remoteAddress 
        || 'unknown';
}

// ==================== RESPONSE HELPERS ====================

/**
 * Success response
 * @param {Object} res - Response object
 * @param {*} data - Data to send
 * @param {string} message - Success message
 */
export function success(res, data, message = 'Success') {
    return res.status(200).json({
        status: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
}

/**
 * Error response
 * @param {Object} res - Response object
 * @param {string} message - Error message
 * @param {number} code - HTTP status code
 */
export function error(res, message = 'Error', code = 400) {
    return res.status(code).json({
        status: false,
        message,
        code,
        timestamp: new Date().toISOString()
    });
}

// ==================== RATE LIMITING ====================

// Simple in-memory store for rate limiting
const rateLimitStore = new Map();

/**
 * Check rate limit
 * @param {string} key - Unique key (IP + endpoint)
 * @param {number} limit - Max requests
 * @param {number} windowMs - Time window in ms
 * @returns {Object} Rate limit info
 */
export function checkRateLimit(key, limit = 100, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests
    const requests = rateLimitStore.get(key) || [];
    
    // Filter to current window
    const validRequests = requests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (validRequests.length >= limit) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: validRequests[0] + windowMs
        };
    }
    
    // Add current request
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    
    return {
        allowed: true,
        remaining: limit - validRequests.length,
        resetTime: now + windowMs
    };
}

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    const maxAge = 60000 * 10; // 10 minutes
    
    for (const [key, requests] of rateLimitStore.entries()) {
        const validRequests = requests.filter(time => now - time < maxAge);
        if (validRequests.length === 0) {
            rateLimitStore.delete(key);
        } else {
            rateLimitStore.set(key, validRequests);
        }
    }
}, 300000);

// ==================== CACHE ====================

const cache = new Map();

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {*} Cached data or null
 */
export function getCache(key) {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    
    return item.data;
}

/**
 * Set cached data
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} ttl - Time to live in seconds
 */
export function setCache(key, data, ttl = 300) {
    cache.set(key, {
        data,
        expiry: Date.now() + (ttl * 1000)
    });
}

/**
 * Clear cache
 * @param {string} pattern - Key pattern to clear (optional)
 */
export function clearCache(pattern = null) {
    if (!pattern) {
        cache.clear();
        return;
    }
    
    for (const key of cache.keys()) {
        if (key.includes(pattern)) {
            cache.delete(key);
        }
    }
}

// ==================== EXPORT DEFAULT ====================

export default {
    // String
    randomString,
    randomNumber,
    formatNumber,
    capitalize,
    toSlug,
    stripHtml,
    truncate,
    
    // Date/Time
    formatDate,
    timeAgo,
    sleep,
    
    // Crypto
    md5,
    sha256,
    uuid,
    encrypt,
    decrypt,
    
    // Validation
    isEmail,
    isUrl,
    isPhone,
    
    // File
    fileExists,
    ensureDir,
    getExt,
    getMimeType,
    
    // Array/Object
    pick,
    omit,
    deepClone,
    groupBy,
    shuffle,
    chunk,
    
    // HTTP
    parseQuery,
    buildQuery,
    getClientIP,
    
    // Response
    success,
    error,
    
    // Rate Limit
    checkRateLimit,
    
    // Cache
    getCache,
    setCache,
    clearCache
};
