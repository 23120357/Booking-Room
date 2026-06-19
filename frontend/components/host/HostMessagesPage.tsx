'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import HostSidebar from '@/components/host/HostSidebar';
import { conversations, type Conversation, type ChatMessage } from '@/data/hostMessages';

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({
  initial,
  bg,
  size = 'md',
  isOnline,
}: {
  initial: string;
  bg: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
}) {
  const dim = size === 'sm' ? 'h-8 w-8 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-10 w-10 text-sm';
  const dotSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5';

  return (
    <div className="relative shrink-0">
      <span
        className={`flex ${dim} items-center justify-center rounded-full font-bold text-white`}
        style={{ background: bg }}
      >
        {initial}
      </span>
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize} rounded-full border-2 border-[#FAF8FF]`}
          style={{ background: isOnline ? '#006A61' : '#C3C6D7' }}
        />
      )}
    </div>
  );
}

// ─── Conversation List Item ───────────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-4 rounded-r-lg px-4 py-4 text-left transition ${
        isActive
          ? 'border-l-4 border-[#004AC6] bg-[rgba(37,99,235,0.05)]'
          : 'border-l-4 border-transparent hover:bg-[rgba(0,0,0,0.03)]'
      }`}
    >
      <Avatar initial={conv.tenantInitial} bg={conv.tenantAvatarBg} size="md" isOnline={conv.isOnline} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-base font-bold leading-6 text-[#191B23]">
            {conv.tenantName}
          </span>
          <span className="shrink-0 text-[11px] leading-4 text-[#737686]">
            {conv.lastMessageTime}
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm leading-[21px] text-[#434655]">
          {conv.lastMessage}
        </p>
        <p className={`mt-0.5 truncate text-[11px] leading-4 ${isActive ? 'font-semibold text-[#004AC6]' : 'text-[#434655]'}`}>
          {conv.roomTitle}
        </p>
      </div>
    </button>
  );
}

// ─── Message Read/Sent Status ─────────────────────────────────────────────────

function MessageStatusLabel({ status }: { status?: ChatMessage['status'] }) {
  if (!status) return null;

  const isRead = status === 'read';
  return (
    <span className="flex items-center gap-1">
      {/* double-tick icon */}
      <svg
        className={`h-3 w-3 ${isRead ? 'text-[#004AC6]' : 'text-[#737686]'}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l4 4L20 5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l4 4L20 5" opacity="0.5" />
      </svg>
      <span
        className={`text-[10px] font-bold uppercase tracking-[-0.5px] ${
          isRead ? 'text-[#004AC6]' : 'text-[#737686]'
        }`}
      >
        {isRead ? 'ĐÃ XEM' : 'ĐÃ CHUYỂN'}
      </span>
    </span>
  );
}

// ─── Single Message Bubble ────────────────────────────────────────────────────

function MessageBubble({
  msg,
  conv,
}: {
  msg: ChatMessage;
  conv: Conversation;
}) {
  const isHost = msg.senderId === 'host';

  if (isHost) {
    return (
      <div className="flex flex-col items-end">
        <div
          className="max-w-[504px] rounded-[20px_20px_4px_20px] bg-[#004AC6] px-4 py-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
        >
          <p className="text-base leading-6 text-white">{msg.content}</p>
        </div>
        <div className="mt-1 flex items-center gap-1 pr-1">
          <span className="text-[11px] leading-4 text-[#737686]">{msg.timestamp}</span>
          <MessageStatusLabel status={msg.status} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-4">
      <Avatar initial={conv.tenantInitial} bg={conv.tenantAvatarBg} size="sm" />
      <div className="flex flex-col">
        <div className="max-w-[451px] rounded-[20px_20px_20px_4px] bg-[#E7E7F3] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <p className="text-base leading-6 text-[#191B23]">{msg.content}</p>
        </div>
        <span className="mt-1 pl-1 text-[11px] leading-4 text-[#737686]">{msg.timestamp}</span>
      </div>
    </div>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

function QuickAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="text-[11px] font-bold uppercase tracking-[0.55px] text-[#737686] hover:text-[#004AC6] transition"
    >
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HostMessagesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [activeConvId, setActiveConvId] = useState(conversations[0].id);
  const [search, setSearch] = useState('');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? conversations[0];

  const filteredConvs = conversations.filter((c) =>
    c.tenantName.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN')) ||
    c.roomTitle.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN'))
  );

  // Scroll to bottom when conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    // TODO: call API POST /messages { conversationId, content: inputText }
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex min-h-screen bg-[#FAF8FF]">
      <HostSidebar user={user} onLogout={handleLogout} activePage="messages" />

      {/* Page container */}
      <div className="flex flex-1 flex-col lg:ml-[272px]">

        {/* ── Top Nav Bar ────────────────────────────────────────────── */}
        <header className="flex h-16 items-center justify-end gap-4 border-b border-[rgba(195,198,215,0.3)] bg-[#FAF8FF] px-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <button type="button" aria-label="Thông báo" className="flex h-8 w-8 items-center justify-center rounded-full text-[#004AC6] hover:bg-[#EEF3FF]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a3 3 0 0 0 6 0" />
            </svg>
          </button>
          <button type="button" aria-label="Trợ giúp" className="flex h-9 w-9 items-center justify-center rounded-full text-[#004AC6] hover:bg-[#EEF3FF]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.1 9a3 3 0 1 1 4.8 2.4c-.9.6-1.4 1.1-1.4 2.1v.3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 17h.01" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </button>
        </header>

        {/* ── Two-panel chat layout ─────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Conversation List (Left Panel) ────────────────────── */}
          <aside className="flex w-96 shrink-0 flex-col border-r border-[rgba(195,198,215,0.3)] bg-[#FAF8FF]">
            {/* Header & search */}
            <div className="flex flex-col gap-4 px-6 pb-6 pt-[23px]">
              <h1 className="text-2xl font-semibold leading-8 text-[#191B23]">Tin nhắn</h1>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-2 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#737686]"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4z" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm hội thoại..."
                  className="h-[39px] w-full rounded-lg border border-[#C3C6D7] bg-[#F3F3FE] pl-9 pr-4 text-sm text-[#191B23] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#004AC6]/20"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              <div className="flex flex-col gap-1">
                {filteredConvs.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={conv.id === activeConvId}
                    onClick={() => setActiveConvId(conv.id)}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main Chat Window (Right Panel) ────────────────────── */}
          <div className="relative flex flex-1 flex-col bg-white">

            {/* Chat header */}
            <div className="absolute inset-x-0 top-0 z-10 flex h-[73px] items-center justify-between border-b border-[rgba(195,198,215,0.3)] bg-[rgba(250,248,255,0.8)] px-6 backdrop-blur-md">
              {/* Left: tenant info */}
              <div className="flex items-center gap-4">
                <Avatar
                  initial={activeConv.tenantInitial}
                  bg={activeConv.tenantAvatarBg}
                  size="md"
                  isOnline={activeConv.isOnline}
                />
                <div>
                  <p className="text-base leading-5 text-[#191B23]">{activeConv.tenantName}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeConv.isOnline ? '#006A61' : '#C3C6D7' }} />
                    <span className="text-xs leading-[18px]" style={{ color: activeConv.isOnline ? '#006A61' : '#737686' }}>
                      {activeConv.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: room info + action buttons */}
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[13px] font-bold leading-5 text-[#004AC6]">{activeConv.roomTitle}</p>
                  <p className="text-[11px] leading-4 text-[#434655]">Hợp đồng: {activeConv.contractCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Gọi điện" className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[#434655] transition hover:bg-[#F3F3FE]">
                    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                    </svg>
                  </button>
                  <button type="button" aria-label="Video call" className="flex h-9 w-9 items-center justify-center rounded-full text-[#434655] transition hover:bg-[#F3F3FE]">
                    <svg className="h-5 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
                    </svg>
                  </button>
                  <button type="button" aria-label="Thêm" className="flex h-8 w-5 items-center justify-center rounded-full text-[#434655] transition hover:bg-[#F3F3FE]">
                    <svg className="h-4 w-1" fill="currentColor" viewBox="0 0 4 16">
                      <circle cx="2" cy="2" r="1.5" />
                      <circle cx="2" cy="8" r="1.5" />
                      <circle cx="2" cy="14" r="1.5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages scrollable area */}
            <div className="absolute inset-x-0 bottom-[131px] top-[73px] overflow-y-auto px-6 py-6">
              {/* Date divider */}
              <div className="mb-6 flex justify-center">
                <span className="rounded-full bg-[#EDEDF9] px-4 py-1 text-[11px] font-bold uppercase tracking-[1.1px] text-[#737686]">
                  {activeConv.dateDivider}
                </span>
              </div>

              {/* Messages */}
              <div className="flex flex-col gap-6">
                {activeConv.messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} conv={activeConv} />
                ))}
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Chat input area */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-[rgba(195,198,215,0.3)] bg-[#FAF8FF] px-6 pb-4 pt-4">
              <div className="flex items-end gap-4">
                {/* Input box */}
                <div className="flex flex-1 items-end rounded-xl border border-[rgba(195,198,215,0.5)] bg-[#F3F3FE] p-2">
                  {/* Attach */}
                  <button type="button" aria-label="Đính kèm" className="flex h-9 w-9 shrink-0 items-center justify-center text-[#737686] hover:text-[#434655]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  {/* Image */}
                  <button type="button" aria-label="Hình ảnh" className="flex h-[34px] w-[34px] shrink-0 items-center justify-center text-[#737686] hover:text-[#434655]">
                    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
                    </svg>
                  </button>
                  {/* Textarea */}
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent px-3 py-2 text-base leading-6 text-[#191B23] placeholder:text-[#6B7280] focus:outline-none"
                    style={{ maxHeight: '128px' }}
                  />
                  {/* Emoji */}
                  <button type="button" aria-label="Emoji" className="flex h-9 w-9 shrink-0 items-center justify-center text-[#737686] hover:text-[#434655]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 14s1.5 2 4 2 4-2 4-2" />
                      <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                      <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Send button */}
                <button
                  type="button"
                  onClick={handleSend}
                  aria-label="Gửi"
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#004AC6] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] transition hover:bg-[#003fa3]"
                >
                  <svg className="h-4 w-[19px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" strokeWidth="0" />
                  </svg>
                </button>
              </div>

              {/* Quick actions */}
              <div className="flex items-center gap-4 px-1">
                <QuickAction label="PHẢN HỒI NHANH" />
                <QuickAction label="GỬI YÊU CẦU THANH TOÁN" />
                <QuickAction label="CHIA SẺ VỊ TRÍ" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
