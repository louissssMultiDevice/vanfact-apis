import { success, error, getClientIP, uuid } from '../lib/myfunc.js';
import fs from 'fs/promises';
import path from 'path';

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'data', 'notifications.json');
const USER_READ_FILE = path.join(process.cwd(), 'data', 'user_read.json');

async function readNotifications() {
    try {
        const data = await fs.readFile(NOTIFICATIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveNotifications(notifications) {
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
}

async function readUserRead() {
    try {
        const data = await fs.readFile(USER_READ_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveUserRead(userRead) {
    await fs.writeFile(USER_READ_FILE, JSON.stringify(userRead, null, 2));
}

// GET - Get notifications (public for users, all for admin)
async function getNotifications(req, res) {
    const { admin_key, page = 1, limit = 20 } = req.query;

    let notifications = await readNotifications();
    const userRead = await readUserRead();
    const clientIP = getClientIP(req);

    if (admin_key === process.env.ADMIN_KEY) {
        // Admin sees all
        const start = (page - 1) * limit;
        const paginated = notifications.slice(start, start + parseInt(limit));
        
        return success(res, {
            total: notifications.length,
            unread: notifications.filter(n => !n.read).length,
            page: parseInt(page),
            limit: parseInt(limit),
            notifications: paginated
        }, 'Notifications retrieved');
    }

    // Public users see only global notifications + their relevant ones
    const userLastRead = userRead[clientIP] || 0;
    
    // Filter to show last 10 notifications or unread ones
    const relevantNotifications = notifications
        .filter(n => n.type === 'global' || n.ip === clientIP)
        .slice(0, 10)
        .map(n => ({
            ...n,
            isNew: new Date(n.createdAt).getTime() > userLastRead
        }));

    return success(res, {
        notifications: relevantNotifications,
        unreadCount: relevantNotifications.filter(n => n.isNew).length
    }, 'Notifications retrieved');
}

// POST - Create notification (admin only)
async function createNotification(req, res) {
    const { admin_key, title, message, type = 'global', targetIp } = req.body || req.query;

    if (admin_key !== process.env.ADMIN_KEY) {
        return error(res, 'Unauthorized', 401);
    }

    if (!title || !message) {
        return error(res, 'Title and message required', 400);
    }

    const notifications = await readNotifications();
    
    const newNotification = {
        id: uuid(),
        type, // global, specific, broadcast
        title: title.trim(),
        message: message.trim(),
        targetIp: targetIp || null,
        read: false,
        createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotification);
    await saveNotifications(notifications);

    return success(res, newNotification, 'Notification created');
}

// PUT - Mark as read
async function markAsRead(req, res) {
    const { id, all } = req.body || req.query;
    const clientIP = getClientIP(req);
    const userRead = await readUserRead();

    if (all === 'true') {
        userRead[clientIP] = Date.now();
        await saveUserRead(userRead);
        return success(res, { marked: true }, 'All notifications marked as read');
    }

    if (!id) {
        return error(res, 'Notification ID required', 400);
    }

    const notifications = await readNotifications();
    const index = notifications.findIndex(n => n.id === id);

    if (index === -1) {
        return error(res, 'Notification not found', 404);
    }

    notifications[index].read = true;
    await saveNotifications(notifications);

    return success(res, { marked: true }, 'Notification marked as read');
}

// DELETE - Delete notification (admin only)
async function deleteNotification(req, res) {
    const { admin_key, id } = req.body || req.query;

    if (admin_key !== process.env.ADMIN_KEY) {
        return error(res, 'Unauthorized', 401);
    }

    let notifications = await readNotifications();
    const initialLength = notifications.length;
    notifications = notifications.filter(n => n.id !== id);

    if (notifications.length === initialLength) {
        return error(res, 'Notification not found', 404);
    }

    await saveNotifications(notifications);
    return success(res, { deleted: true }, 'Notification deleted');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET':
                return await getNotifications(req, res);
            case 'POST':
                return await createNotification(req, res);
            case 'PUT':
                return await markAsRead(req, res);
            case 'DELETE':
                return await deleteNotification(req, res);
            default:
                return error(res, 'Method not allowed', 405);
        }
    } catch (err) {
        console.error('Notifications API Error:', err);
        return error(res, 'Internal server error', 500);
    }
}
