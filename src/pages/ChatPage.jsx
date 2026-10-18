// client/src/pages/ChatPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Avatar, Badge, Button, Card, Input } from '../components/ui/shadcn';
import {
  MessageSquare,
  Send,
  Home,
  Phone,
  IndianRupee,
  Loader2,
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialConvId = searchParams.get('conversationId');

  useEffect(() => {
    if (user?.role === 'owner') {
      navigate('/owner/chats', { replace: true });
    }
  }, [user, navigate]);

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef(null);
  const activeConvIdRef = useRef(initialConvId || null);

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

  const fetchConversations = async () => {
    try {
      const { data } = await API.get('/chat/conversations');
      setConversations(data);

      const targetId = activeConvIdRef.current || initialConvId;

      if (!targetId && data.length > 0) {
        activeConvIdRef.current = data[0]._id;
        setActiveConv(data[0]);
      } else if (targetId && data.length > 0) {
        const currentSelected = data.find((c) => c._id === targetId);
        if (currentSelected) {
          setActiveConv(currentSelected);
        }
      }
    } catch (err) {
      console.error('Error loading conversations', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const { data } = await API.get(`/chat/conversations/${convId}/messages`);
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeConv?._id) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    fetchMessages(activeConv._id);
    const interval = setInterval(() => fetchMessages(activeConv._id), 2500);
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
      const { data: newMsg } = await API.post('/chat/messages', {
        conversationId: activeConv._id,
        receiverId: activeConv.otherParticipant?._id,
        text: msgText,
        roomId: activeConv.room?._id,
      });
      setMessages((prev) => [...prev, newMsg]);
      fetchConversations();
      requestAnimationFrame(() => scrollToBottom('smooth'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 h-[calc(100vh-72px)] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-neutral-800 dark:text-[#d8cdbf]" />
            Inbuilt Direct Chat (User ↔ Landlord)
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Communicate directly with landlords and tenants with zero middleman or broker.
          </p>
        </div>
      </div>

      <Card className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#121316] shadow-xl">
        {/* Left Sidebar: Conversations */}
        <div className="md:col-span-4 border-r border-neutral-200 dark:border-neutral-800 flex flex-col bg-neutral-50/70 dark:bg-[#0f1013] overflow-y-auto">
          <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Active Conversations ({conversations.length})
          </div>

          {loadingConvs ? (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-800 dark:text-[#d8cdbf]" /> Loading chats...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">No conversations yet.</p>
              <p className="text-xs text-neutral-500">
                Click &quot;Chat Landlord&quot; on any room card on the Home page to start chatting!
              </p>
              <Link to="/">
                <Button variant="secondary" size="sm">
                  Explore Rooms
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200/70 dark:divide-neutral-800/80">
              {conversations.map((conv) => {
                const other = conv.otherParticipant;
                const isSelected = activeConv?._id === conv._id;
                return (
                  <button
                    key={conv._id}
                    type="button"
                    onClick={() => handleSelectConv(conv)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#f5efe6] dark:bg-[#f5efe6]/10 border-l-4 border-l-neutral-900 dark:border-l-[#d8cdbf]'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <Avatar
                      src={other?.profilePic}
                      name={other?.name || 'User'}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                          {other?.name || 'User'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-emerald-700 dark:text-[#d8cdbf] capitalize font-semibold">
                        {other?.role === 'landlord' ? 'owner' : other?.role}
                        {conv.room?.title ? ` • ${conv.room.title}` : ''}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate mt-1">
                        {conv.lastMessage || 'Start chatting...'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Active Chat Thread */}
        <div className="md:col-span-8 flex flex-col bg-white dark:bg-[#121316] h-full overflow-hidden">
          {!activeConv ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8 text-center bg-neutral-50/50 dark:bg-transparent">
              <MessageSquare className="w-12 h-12 text-neutral-400 dark:text-neutral-700 mb-2" />
              <p className="text-sm text-neutral-700 dark:text-neutral-400">
                Select a conversation on the left to view messages
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-[#141519] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={activeConv.otherParticipant?.profilePic}
                    name={activeConv.otherParticipant?.name || 'User'}
                    size="md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                        {activeConv.otherParticipant?.name || 'Participant'}
                      </h3>
                      <Badge variant="default" className="capitalize text-[10px]">
                        {activeConv.otherParticipant?.role === 'landlord'
                          ? 'owner'
                          : activeConv.otherParticipant?.role}
                      </Badge>
                    </div>
                    {activeConv.otherParticipant?.phone && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
                        <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {activeConv.otherParticipant.phone}
                      </p>
                    )}
                  </div>
                </div>

                {activeConv.room && (
                  <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-[#0f1013] border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-xl text-xs shadow-xs">
                    <Home className="w-4 h-4 text-neutral-600 dark:text-[#d8cdbf]" />
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white truncate max-w-[180px]">
                        {activeConv.room.title}
                      </p>
                      <p className="text-[11px] text-neutral-600 dark:text-[#d8cdbf] flex items-center font-medium">
                        {activeConv.room.roomType || '1RK'} • <IndianRupee className="w-3 h-3" />
                        {activeConv.room.rent}/mo
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages List */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-neutral-100/40 dark:bg-[#0d0e12]"
              >
                {messages.map((msg) => {
                  const currentUserId = String(user?._id || user?.id || '').trim();
                  const rawSenderId =
                    typeof msg.sender === 'object' && msg.sender !== null
                      ? msg.sender._id || msg.sender.id || ''
                      : msg.sender || '';
                  const senderId = String(rawSenderId).trim();
                  const isMine = Boolean(currentUserId && senderId && senderId === currentUserId);

                  return (
                    <div
                      key={msg._id}
                      className={`flex w-full ${isMine ? 'justify-end' : 'justify-start items-end gap-2.5'}`}
                    >
                      {/* Received message from the other side: Avatar on the LEFT */}
                      {!isMine && (
                        <Avatar
                          src={msg.sender?.profilePic || activeConv.otherParticipant?.profilePic}
                          name={msg.sender?.name || activeConv.otherParticipant?.name || 'Landlord'}
                          size="sm"
                          className="mb-1 flex-shrink-0"
                        />
                      )}

                      <div
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}
                      >
                        {/* Received message from the other side: Sender Name & Role Label */}
                        {!isMine && (
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                              {msg.sender?.name || activeConv.otherParticipant?.name || 'Landlord'}
                            </span>
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              {(msg.sender?.role === 'landlord' ? 'owner' : msg.sender?.role) ||
                                (activeConv.otherParticipant?.role === 'landlord'
                                  ? 'owner'
                                  : activeConv.otherParticipant?.role) ||
                                'owner'}
                            </span>
                          </div>
                        )}

                        {/* Message Bubble:
                            - isMine: RIGHT side with rounded-br-xs
                            - !isMine: LEFT side with rounded-bl-xs
                        */}
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all border ${
                            isMine
                              ? 'chat-bubble-sent rounded-br-xs'
                              : 'chat-bubble-received rounded-bl-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed font-normal">
                            {msg.text}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-[10px] font-medium ${
                              isMine
                                ? 'justify-end text-neutral-400 dark:text-neutral-500'
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
                    </div>
                  );
                })}
              </div>

              {/* Message Composer */}
              <form
                onSubmit={handleSend}
                className="p-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141519] flex items-center gap-2"
              >
                <Input
                  placeholder={`Message ${activeConv.otherParticipant?.name || 'Landlord'}...`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 bg-neutral-50 dark:bg-[#18191e] border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                />
                <Button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-[#f5efe6] dark:hover:bg-[#eae2d5] dark:text-neutral-950 font-bold cursor-pointer"
                >
                  <Send className="w-4 h-4 mr-1" /> Send
                </Button>
              </form>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
