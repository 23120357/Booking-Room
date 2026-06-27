'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell, LifeBuoy, ShieldAlert } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';
import { useSocket } from '@/context/SocketContext';
import {
  notificationService,
  type NotificationItem,
} from '@/services/notificationService';

const HOST_NOTIFICATION_TYPES = new Set(['SUPPORT', 'VIOLATION']);

function isHostNotification(notification: NotificationItem) {
  return HOST_NOTIFICATION_TYPES.has(notification.notification_type);
}

type NotificationDetailKey = 'referenceCode' | 'status' | 'reason' | 'adminResponse';

interface NotificationPresentation {
  paragraphs: string[];
  details: Array<{ key: NotificationDetailKey; value: string }>;
}

function parseNotificationContent(notification: NotificationItem): NotificationPresentation {
  let remaining = notification.content.replace(/\r?\n/g, ' ').trim();

  const quotedResponse = remaining.match(
    /\s*Phản hồi từ quản trị viên:\s*["“]([\s\S]*)["”]\s*$/i,
  );
  const plainResponse = quotedResponse
    ? null
    : remaining.match(/\s*Phản hồi từ quản trị viên:\s*([\s\S]*)$/i);
  const adminResponse = (quotedResponse?.[1] || plainResponse?.[1] || '').trim();
  if (quotedResponse || plainResponse) {
    remaining = remaining.slice(0, (quotedResponse || plainResponse)!.index).trim();
  }

  const referenceMatch = remaining.match(/\(Mã:\s*([^)]+)\)/i);
  const referenceCode = referenceMatch?.[1]?.trim() || '';
  if (referenceMatch) remaining = remaining.replace(referenceMatch[0], '');

  const statusMatch = remaining.match(/đã được chuyển sang trạng thái:\s*([^.!?]+)[.!?]?/i);
  const status = statusMatch?.[1]?.trim() || '';
  if (statusMatch) remaining = remaining.replace(statusMatch[0], '');

  const reasonPatterns = [
    /với lý do:\s*["“]([^"”]+)["”]/i,
    /về hành vi:\s*["“]([^"”]+)["”]/i,
    /về lý do:\s*["“]([^"”]+)["”]/i,
  ];
  let reason = '';
  for (const pattern of reasonPatterns) {
    const match = remaining.match(pattern);
    if (!match) continue;
    reason = match[1].trim();
    remaining = remaining.replace(match[0], '');
    break;
  }

  remaining = remaining
    .replace(/^CẢNH BÁO:\s*/i, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.!?])/g, '$1')
    .replace(/([.!?]){2,}/g, '$1')
    .trim();

  const paragraphs = (remaining.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [])
    .map((part) => part.trim())
    .filter(Boolean);

  const details: NotificationPresentation['details'] = [];
  if (referenceCode) details.push({ key: 'referenceCode', value: referenceCode });
  if (status) details.push({ key: 'status', value: status });
  if (reason) details.push({ key: 'reason', value: reason });
  if (adminResponse) details.push({ key: 'adminResponse', value: adminResponse });

  return {
    paragraphs: paragraphs.length > 0 ? paragraphs : [notification.content],
    details,
  };
}

export default function HostNotificationBell() {
  const { t, language } = useTranslation();
  const { socket } = useSocket();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const response = await notificationService.list();
      setNotifications((response.data?.items || []).filter(isHostNotification));
    } catch (err: any) {
      setError(err?.message || t('host.notifications.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadNotifications(true);
    const timer = window.setInterval(() => loadNotifications(false), 60_000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: NotificationItem) => {
      if (!isHostNotification(notification)) return;
      setNotifications((current) => [
        notification,
        ...current.filter((item) => item.notification_id !== notification.notification_id),
      ]);
    };

    socket.on('notification:new', handleNewNotification);
    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket]);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === 'UNREAD').length,
    [notifications],
  );

  const markRead = async (notification: NotificationItem) => {
    if (notification.status === 'READ') return;

    setNotifications((current) =>
      current.map((item) =>
        item.notification_id === notification.notification_id ? { ...item, status: 'READ' } : item,
      ),
    );

    try {
      await notificationService.markRead(notification.notification_id);
    } catch {
      setNotifications((current) =>
        current.map((item) =>
          item.notification_id === notification.notification_id ? { ...item, status: 'UNREAD' } : item,
        ),
      );
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((notification) => notification.status === 'UNREAD');
    if (unread.length === 0) return;

    setNotifications((current) => current.map((item) => ({ ...item, status: 'READ' })));
    const results = await Promise.allSettled(
      unread.map((notification) => notificationService.markRead(notification.notification_id)),
    );
    if (results.some((result) => result.status === 'rejected')) {
      await loadNotifications(false);
    }
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((current) => !current);
          if (!isOpen) loadNotifications(false);
        }}
        aria-label={t('host.listings.notifications')}
        title={t('host.listings.notifications')}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-booking-muted transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-booking-primary/20"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label={t('host.notifications.title')}
          className="absolute right-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="font-bold text-slate-900">{t('host.notifications.title')}</h2>
              <p className="text-xs text-slate-500">
                {t('host.notifications.unreadCount', { count: unreadCount })}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-booking-primary hover:underline"
              >
                {t('host.notifications.markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                {t('host.notifications.loading')}
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  onClick={() => loadNotifications(true)}
                  className="mt-2 text-sm font-semibold text-booking-primary hover:underline"
                >
                  {t('host.notifications.retry')}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500">
                {t('host.notifications.empty')}
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = notification.status === 'UNREAD';
                const Icon = notification.notification_type === 'SUPPORT' ? LifeBuoy : ShieldAlert;
                const presentation = parseNotificationContent(notification);
                return (
                  <button
                    key={notification.notification_id}
                    type="button"
                    onClick={() => markRead(notification)}
                    className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50 ${
                      isUnread ? 'bg-blue-50/60' : 'bg-white'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        notification.notification_type === 'SUPPORT'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start gap-2">
                        <span className={`flex-1 text-sm text-slate-900 ${isUnread ? 'font-bold' : 'font-semibold'}`}>
                          {notification.title}
                        </span>
                        {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                      </span>
                      <span className="mt-1.5 block space-y-1 text-xs leading-5 text-slate-600">
                        {presentation.paragraphs.map((paragraph, index) => (
                          <span key={`${notification.notification_id}-paragraph-${index}`} className="block">
                            {paragraph}
                          </span>
                        ))}
                      </span>
                      {presentation.details.length > 0 && (
                        <span className="mt-2 block space-y-1.5 rounded-lg bg-white/80 p-2.5 ring-1 ring-slate-200/80">
                          {presentation.details.map((detail) => (
                            <span
                              key={detail.key}
                              className="grid grid-cols-[minmax(6.5rem,auto)_1fr] items-start gap-2 text-xs leading-5"
                            >
                              <strong className="font-bold text-slate-700">
                                {t(`host.notifications.${detail.key}`)}:
                              </strong>
                              <span className="min-w-0 whitespace-pre-wrap break-words text-slate-600">
                                {detail.value}
                              </span>
                            </span>
                          ))}
                        </span>
                      )}
                      <span className="mt-1.5 block text-[11px] text-slate-400">
                        {formatDate(notification.created_at)}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>
      )}
    </div>
  );
}
