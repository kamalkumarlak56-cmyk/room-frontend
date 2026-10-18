// client/src/components/owner/OwnerChatsView.jsx
import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge, Button, Card, Input } from '../ui/shadcn';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Home,
  IndianRupee,
  Loader2,
  Search,
} from 'lucide-react';

export default function OwnerChatsView({
  conversations = [],
  setConversations = () => {},
  loading = false,
  onRefresh = () => {},
}) {
  const { user } = useAuth();
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesContainerRef = useRef(null);
  const activeConvIdRef = useRef(null);

  const scrollToBottom = (behavior = 'auto') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  };

  const handleSelectConv = (conv) => {
    activeConvIdRef.current = conv._id;
    setActiveConv(conv);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Set default active conversation or update currently selected one
  useEffect(() => {
    if (!activeConvIdRef.current && conversations.length > 0) {
      activeConvIdRef.current = conversations[0]._id;
      setActiveConv(conversations[0]);
    } else if (activeConvIdRef.current && conversations.length > 0) {
      const updated = conversations.find((c) => c._id === activeConvIdRef.current);
      if (updated) setActiveConv(updated);
    }
  }, [conversations]);

  // Fetch messages for active conversation
  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const { data } = await API.get(`/chat/conversations/${convId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching conversation messages', err);
    }
  };

  useEffect(() => {
    if (!activeConv?._id) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchMessages(activeConv._id);
    const interval = setInterval(() => fetchMessages(activeConv._id), 3000);
    return () => clearInterval(interval);
  }, [activeConv?._id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      scrollToBottom('auto');
    });
  }, [messages.length, activeConv?._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    const msgText = text.trim();
    setText('');
    setSending(true);

    try {
      const otherParticipantId = activeConv.otherParticipant?._id;
      const { data: newMsg } = await API.post('/chat/messages', {
        conversationId: activeConv._id,
        receiverId: otherParticipantId,
        text: msgText,
        roomId: activeConv.room?._id,
      });

      setMessages((prev) => [...prev, newMsg]);
      onRefresh();
      requestAnimationFrame(() => scrollToBottom('smooth'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Filter conversations by user name or room
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherName = c.otherParticipant?.name?.toLowerCase() || '';
    const roomTitle = c.room?.title?.toLowerCase() || '';
    return otherName.includes(q) || roomTitle.includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-[#e2dbcf] dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Direct Tenant Messaging
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Chat directly with prospective tenants and current occupants. User profiles and usernames are displayed with every message.
          </p>
        </div>
      </div>

      {/* Main Chat Box */}
      <Card className="h-[calc(100vh-220px)] min-h-[550px] grid grid-cols-1 md:grid-cols-12 overflow-hidden border border-[#e2dbcf] dark:border-neutral-800 bg-white dark:bg-[#0f1013] shadow-2xl">
        {/* Left Side: Conversations List */}
        <div className="md:col-span-5 lg:col-span-4 border-r border-[#e2dbcf] dark:border-neutral-800 flex flex-col bg-[#fdfbf7] dark:bg-[#0b0c0f] overflow-hidden">
          {/* Search Header */}
          <div className="p-3 border-b border-[#e2dbcf] dark:border-neutral-800 bg-white dark:bg-[#0b0c0f]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              <Input
                placeholder="Search tenant or room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-[#f8f5ee] dark:bg-neutral-900 border-[#e2dbcf] dark:border-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider mt-2.5 px-1">
              <span>Tenant Chats</span>
              <span>({filteredConversations.length})</span>
            </div>
          </div>

          {/* List of Chats */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#e2dbcf]/70 dark:divide-neutral-800/60">
            {loading ? (
              <div className="p-8 text-center text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-500 dark:text-sky-400" /> Loading chats...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs space-y-2">
                <MessageSquare className="w-8 h-8 text-neutral-400 dark:text-neutral-700 mx-auto" />
                <p className="font-semibold text-neutral-700 dark:text-neutral-400">No tenant chats yet.</p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-500">
                  When users inquire about your rooms, their chats will appear here with profile photos and usernames.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = conv.otherParticipant;
                const isSelected = activeConv?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    type="button"
                    onClick={() => handleSelectConv(conv)}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#ede5da] dark:bg-[#f5efe6] text-neutral-950 border-l-4 border-l-sky-500 shadow-xs'
                        : 'hover:bg-[#f4efe6] dark:hover:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {/* Small User Profile Pic */}
                    <Avatar
                      src={other?.profilePic}
                      name={other?.name || 'User'}
                      size="md"
                      className="border border-[#e2dbcf] dark:border-neutral-700 flex-shrink-0 mt-0.5"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs font-black truncate ${
                            isSelected ? 'text-neutral-950' : 'text-neutral-900 dark:text-white'
                          }`}
                        >
                          {other?.name || 'User'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                            {conv.unreadCount} new
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            isSelected
                              ? 'bg-neutral-900 text-white'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          }`}
                        >
                          {other?.role === 'landlord' ? 'Owner' : 'Tenant'}
                        </span>
                        {conv.room?.title && (
                          <span
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-neutral-700' : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            • {conv.room.title}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-xs truncate mt-1 ${
                          isSelected ? 'text-neutral-700 font-medium' : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {conv.lastMessage || 'Direct inquiry started...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-white dark:bg-[#121316] h-full overflow-hidden">
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500 space-y-2">
              <MessageSquare className="w-12 h-12 text-neutral-400 dark:text-neutral-700" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-400">
                Select a conversation on the left to read messages
              </p>
            </div>
          ) : (
            <>
              {/* Active Chat Header */}
              <div className="p-3.5 px-5 border-b border-[#e2dbcf] dark:border-neutral-800 bg-[#faf7f2] dark:bg-[#16171d] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* User Profile Pic */}
                  <Avatar
                    src={activeConv.otherParticipant?.profilePic}
                    name={activeConv.otherParticipant?.name || 'User'}
                    size="md"
                    className="border-2 border-emerald-500/50 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm truncate">
                        {activeConv.otherParticipant?.name || 'Tenant'}
                      </h3>
                      <Badge variant="success" className="text-[9px] py-0 px-1.5">
                        {activeConv.otherParticipant?.role === 'landlord' ? 'Owner' : 'Tenant'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      {activeConv.otherParticipant?.phone && (
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                          <Phone className="w-3 h-3" /> {activeConv.otherParticipant.phone}
                        </span>
                      )}
                      {activeConv.otherParticipant?.email && (
                        <span className="flex items-center gap-1 truncate text-neutral-600 dark:text-neutral-400">
                          <Mail className="w-3 h-3 text-neutral-400 dark:text-neutral-500" /> {activeConv.otherParticipant.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room Reference Pill */}
                {activeConv.room && (
                  <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-neutral-900 border border-[#e2dbcf] dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs flex-shrink-0 shadow-xs">
                    <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-bold text-neutral-900 dark:text-white truncate max-w-[150px]">
                        {activeConv.room.title}
                      </p>
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center">
                        {activeConv.room.roomType || '1RK'} • <IndianRupee className="w-2.5 h-2.5 ml-0.5" />
                        {activeConv.room.rent}/mo
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Thread */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#fbf9f5] dark:bg-gradient-to-b dark:from-[#0e0f13] dark:to-[#121316]"
              >
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-neutral-500 text-xs">
                    Start the conversation with {activeConv.otherParticipant?.name || 'this user'}.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const currentUserId = String(user?._id || user?.id || '').trim();
                    const rawSenderId =
                      typeof msg.sender === 'object' && msg.sender !== null
                        ? msg.sender._id || msg.sender.id || ''
                        : msg.sender || '';
                    const senderId = String(rawSenderId).trim();
                    const isMine = Boolean(currentUserId && senderId && senderId === currentUserId);

                    const senderProfilePic =
                      msg.sender?.profilePic ||
                      (isMine ? user?.profilePic : activeConv.otherParticipant?.profilePic);
                    const senderName =
                      msg.sender?.name ||
                      (isMine ? user?.name || 'You (Owner)' : activeConv.otherParticipant?.name || 'Tenant');

                    return (
                      <div
                        key={msg._id}
                        className={`flex w-full ${
                          isMine ? 'justify-end' : 'justify-start items-start gap-2.5'
                        }`}
                      >
                        {/* USER'S SMALL PROFILE PIC WITH EVERY INCOMING CHAT */}
                        {!isMine && (
                          <Avatar
                            src={senderProfilePic}
                            name={senderName}
                            size="sm"
                            className="mt-1 flex-shrink-0 border border-[#e2dbcf] dark:border-neutral-700"
                          />
                        )}

                        <div
                          className={`flex flex-col ${
                            isMine ? 'items-end' : 'items-start'
                          } max-w-[85%] sm:max-w-[70%]`}
                        >
                          {/* USERNAME WITH EVERY CHAT (CRITICAL REQUIREMENT) */}
                          {!isMine && (
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <span className="text-xs font-bold text-neutral-900 dark:text-[#f5efe6] truncate">
                                {senderName}
                              </span>
                              <span className="text-[9px] uppercase font-bold px-1 rounded bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30">
                                Tenant
                              </span>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs transition-all ${
                              isMine
                                ? 'bg-neutral-900 text-white dark:bg-[#f5efe6] dark:text-neutral-950 font-medium rounded-br-xs'
                                : 'bg-white dark:bg-neutral-850 border border-[#e2dbcf] dark:border-neutral-750 text-neutral-900 dark:text-white rounded-bl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words leading-relaxed font-normal">
                              {msg.text}
                            </p>
                            <div
                              className={`flex items-center gap-1 mt-1 text-[10px] ${
                                isMine
                                  ? 'justify-end text-neutral-400 dark:text-neutral-600'
                                  : 'justify-start text-neutral-500 dark:text-neutral-400'
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Owner's avatar on sent messages */}
                        {isMine && (
                          <Avatar
                            src={user?.profilePic}
                            name={user?.name || 'Owner'}
                            size="sm"
                            className="mt-1 flex-shrink-0 border border-[#e2dbcf] dark:border-neutral-700"
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer Form */}
              <form
                onSubmit={handleSend}
                className="p-3 border-t border-[#e2dbcf] dark:border-neutral-800 bg-[#faf7f2] dark:bg-[#141519] flex items-center gap-2"
              >
                <Input
                  placeholder={`Reply to ${activeConv.otherParticipant?.name || 'tenant'}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 bg-white dark:bg-neutral-900 border-[#e2dbcf] dark:border-neutral-700 text-xs sm:text-sm text-neutral-900 dark:text-white"
                />
                <Button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-[#f5efe6] dark:hover:bg-white dark:text-neutral-950 font-black cursor-pointer text-xs sm:text-sm"
                >
                  <Send className="w-4 h-4 mr-1" />
                  <span>Send</span>
                </Button>
              </form>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
