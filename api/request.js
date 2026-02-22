import { success, error, getClientIP, checkRateLimit, uuid, formatDate } from '../lib/myfunc.js';
import fs from 'fs/promises';
import path from 'path';

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'requests.json');
const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    } catch (err) {
        // Directory already exists
    }
}

// Read requests
async function readRequests() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(REQUESTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

// Save requests
async function saveRequests(requests) {
    await ensureDataDir();
    await fs.writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

// Read notifications
async function readNotifications() {
    try {
        await ensureDataDir();
        const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

// Save notifications
async function saveNotifications(notifications) {
    await ensureDataDir();
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
}

// POST - Create new request
async function createRequest(req, res) {
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(`request:${clientIP}`, 5, 3600000); // 5 per hour
    
    if (!rateLimit.allowed) {
        return error(res, 'Rate limit exceeded. Max 5 requests per hour.', 429);
    }

    const { name, feature, code, description, contact } = req.body || req.query;

    if (!name || !feature) {
        return error(res, 'Name and feature are required', 400);
    }

    const requests = await readRequests();
    
    const newRequest = {
        id: uuid(),
        name: name.trim(),
        feature: feature.trim(),
        code: code?.trim() || null,
        description: description?.trim() || null,
        contact: contact?.trim() || null,
        status: 'pending', // pending, approved, rejected, in_progress, completed
        ip: clientIP,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        adminNotes: null,
        adminReply: null
    };

    requests.unshift(newRequest);
    await saveRequests(requests);

    // Create notification for admin
    const notifications = await readNotifications();
    notifications.unshift({
        id: uuid(),
        type: 'new_request',
        title: 'New Feature Request',
        message: `${name} requested: ${feature}`,
        requestId: newRequest.id,
        read: false,
        createdAt: new Date().toISOString()
    });
    await saveNotifications(notifications);

    return success(res, {
        id: newRequest.id,
        message: 'Request submitted successfully. We will review it soon!'
    }, 'Request created');
}

// GET - List all requests (admin only with secret key)
async function listRequests(req, res) {
    const { admin_key, status, page = 1, limit = 20 } = req.query;

    if (admin_key !== process.env.ADMIN_KEY) {
        return error(res, 'Unauthorized', 401);
    }

    let requests = await readRequests();

    // Filter by status
    if (status) {
        requests = requests.filter(r => r.status === status);
    }

    // Pagination
    const start = (page - 1) * limit;
    const paginated = requests.slice(start, start + parseInt(limit));

    return success(res, {
        total: requests.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(requests.length / limit),
        requests: paginated
    }, 'Requests retrieved');
}

// GET - Single request
async function getRequest(req, res) {
    const { id, admin_key } = req.query;

    if (!id) {
        return error(res, 'Request ID required', 400);
    }

    const requests = await readRequests();
    const request = requests.find(r => r.id === id);

    if (!request) {
        return error(res, 'Request not found', 404);
    }

    // Only admin or same IP can view
    const clientIP = getClientIP(req);
    if (admin_key !== process.env.ADMIN_KEY && request.ip !== clientIP) {
        return error(res, 'Unauthorized', 401);
    }

    return success(res, request, 'Request retrieved');
}

// PUT - Update request status (admin only)
async function updateRequest(req, res) {
    const { admin_key, id, status, adminNotes, adminReply } = req.body || req.query;

    if (admin_key !== process.env.ADMIN_KEY) {
        return error(res, 'Unauthorized', 401);
    }

    if (!id || !status) {
        return error(res, 'ID and status required', 400);
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
        return error(res, 'Invalid status', 400);
    }

    const requests = await readRequests();
    const index = requests.findIndex(r => r.id === id);

    if (index === -1) {
        return error(res, 'Request not found', 404);
    }

    requests[index].status = status;
    requests[index].updatedAt = new Date().toISOString();
    if (adminNotes) requests[index].adminNotes = adminNotes;
    if (adminReply) requests[index].adminReply = adminReply;

    await saveRequests(requests);

    // Create notification for status change
    const notifications = await readNotifications();
    notifications.unshift({
        id: uuid(),
        type: 'status_update',
        title: 'Request Status Updated',
        message: `Your request "${requests[index].feature}" is now ${status}`,
        requestId: id,
        read: false,
        createdAt: new Date().toISOString()
    });
    await saveNotifications(notifications);

    return success(res, requests[index], 'Request updated');
}

// DELETE - Delete request (admin only)
async function deleteRequest(req, res) {
    const { admin_key, id } = req.body || req.query;

    if (admin_key !== process.env.ADMIN_KEY) {
        return error(res, 'Unauthorized', 401);
    }

    let requests = await readRequests();
    const initialLength = requests.length;
    requests = requests.filter(r => r.id !== id);

    if (requests.length === initialLength) {
        return error(res, 'Request not found', 404);
    }

    await saveRequests(requests);
    return success(res, { deleted: true }, 'Request deleted');
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'POST':
                return await createRequest(req, res);
            case 'GET':
                if (req.query.id) {
                    return await getRequest(req, res);
                }
                return await listRequests(req, res);
            case 'PUT':
                return await updateRequest(req, res);
            case 'DELETE':
                return await deleteRequest(req, res);
            default:
                return error(res, 'Method not allowed', 405);
        }
    } catch (err) {
        console.error('Request API Error:', err);
        return error(res, 'Internal server error', 500);
    }
}
