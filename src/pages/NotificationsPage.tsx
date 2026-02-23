import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Check, Trash2, RefreshCw, Filter } from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'all' | 'unread';
type FilterType = 'ALL' | 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await notificationService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    setMarkingId(id);
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) handleMarkAsRead(notification.id);
    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  const getBackPath = () => {
    if (!user) return '/dashboard';
    const role = (user as any).role || (user as any).userType || '';
    if (role === 'STUDENT') return '/dashboard';
    if (role === 'LECTURER' || role === 'INSTRUCTOR') return '/dashboard';
    if (role === 'ADMIN') return '/dashboard';
    return '/dashboard';
  };

  // Filter pipeline
  const displayed = notifications
    .filter(n => activeTab === 'all' || !n.isRead)
    .filter(n => filterType === 'ALL' || n.type === filterType);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return '🎉';
      case 'INFO':    return 'ℹ️';
      case 'WARNING': return '⚠️';
      case 'ERROR':   return '❌';
      default:        return '📢';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-green-100 text-green-700';
      case 'INFO':    return 'bg-blue-100 text-blue-700';
      case 'WARNING': return 'bg-yellow-100 text-yellow-700';
      case 'ERROR':   return 'bg-red-100 text-red-700';
      default:        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityBorder = (priority: number) => {
    if (priority >= 8) return 'border-l-red-500';
    if (priority >= 6) return 'border-l-yellow-500';
    return 'border-l-emerald-500';
  };

  const formatDateTime = (dt: any): string => {
    if (!dt) return '—';
    if (Array.isArray(dt)) {
      const [y, mo, d, h, mi, s] = dt as number[];
      return new Date(y, mo - 1, d, h, mi, s).toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    const date = new Date(dt);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(getBackPath())}
            className="flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-3 rounded-xl">
                <Bell size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-emerald-100 text-sm mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadNotifications(true)}
                disabled={refreshing}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all text-sm border border-white/20"
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all text-sm border border-white/20"
                >
                  <Check size={15} />
                  {markingAll ? 'Marking...' : 'Mark all read'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs + Filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          {/* Tabs */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {notifications.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'unread'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === 'unread' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as FilterType)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-700"
            >
              <option value="ALL">All types</option>
              <option value="INFO">ℹ️ Info</option>
              <option value="SUCCESS">🎉 Success</option>
              <option value="WARNING">⚠️ Warning</option>
              <option value="ERROR">❌ Error</option>
            </select>
          </div>
        </div>

        {/* Notification list */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading notifications...</p>
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
            <Bell size={52} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-600 font-semibold text-lg">
              {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === 'unread'
                ? "You're all caught up! Switch to 'All' to see your history."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${getPriorityBorder(notification.priority)} transition-all hover:shadow-md ${
                  !notification.isRead ? 'ring-1 ring-emerald-100' : ''
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-2xl flex-shrink-0 mt-0.5">
                      {getTypeIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold text-gray-900 text-sm ${!notification.isRead ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeBadge(notification.type)}`}>
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full inline-block" title="Unread" />
                          )}
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">
                        {notification.message}
                      </p>

                      {notification.actionUrl && (
                        <button
                          onClick={() => handleNotificationClick(notification)}
                          className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 font-medium underline underline-offset-2"
                        >
                          View details →
                        </button>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markingId === notification.id}
                            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Check size={13} />
                            {markingId === notification.id ? 'Marking...' : 'Mark as read'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          disabled={deletingId === notification.id}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          {deletingId === notification.id ? 'Deleting...' : 'Delete'}
                        </button>
                        {notification.readAt && (
                          <span className="text-xs text-gray-400 ml-auto">
                            Read {formatDateTime(notification.readAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayed.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-6">
            Showing {displayed.length} of {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
