import { ApiService, ApiResponse } from './apiService';

export interface Notification {
    id: number;
    recipientNic: string;
    recipientType: 'STUDENT' | 'LECTURER' | 'ADMIN';
    type: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
    title: string;
    message: string;
    actionUrl?: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
    priority: number;
    relatedEntityId?: number;
    relatedEntityType?: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    unreadCount: number;
}

/**
 * Notification Service
 * Manages in-app notifications for all user types
 */
export class NotificationService extends ApiService {
    private readonly ENDPOINTS = {
        BASE: '/api/notifications',
        UNREAD: '/api/notifications/unread',
        UNREAD_COUNT: '/api/notifications/unread/count',
        READ: (id: number) => `/api/notifications/${id}/read`,
        READ_ALL: '/api/notifications/read-all',
        DELETE: (id: number) => `/api/notifications/${id}`
    };

    /**
     * Get all notifications for the current user
     */
    async getAllNotifications(): Promise<Notification[]> {
        try {
            const response: ApiResponse<Notification[]> = await this.get(this.ENDPOINTS.BASE);
            return response.data || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    /**
     * Get unread notifications for the current user
     */
    async getUnreadNotifications(): Promise<NotificationResponse> {
        try {
            const response: ApiResponse<NotificationResponse> = await this.get(this.ENDPOINTS.UNREAD);
            return response.data || { notifications: [], unreadCount: 0 };
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            throw error;
        }
    }

    /**
     * Get unread count (lightweight for badge)
     */
    async getUnreadCount(): Promise<number> {
        try {
            const response: ApiResponse<{ count: number }> = await this.get(this.ENDPOINTS.UNREAD_COUNT);
            return response.data?.count || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(id: number): Promise<void> {
        try {
            await this.put(this.ENDPOINTS.READ(id), {});
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        try {
            await this.put(this.ENDPOINTS.READ_ALL, {});
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(id: number): Promise<void> {
        try {
            await this.delete(this.ENDPOINTS.DELETE(id));
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    /**
     * Poll for new notifications
     * Returns true if there are new notifications since last check
     */
    async checkForNew(lastCount: number): Promise<boolean> {
        try {
            const currentCount = await this.getUnreadCount();
            return currentCount > lastCount;
        } catch (error) {
            return false;
        }
    }
}

export const notificationService = new NotificationService();
