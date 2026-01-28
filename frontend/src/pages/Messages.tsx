/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Messages.tsx

import { useState, useRef, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

// 1. IMPORT TYPES
import type {
  ConversationSummary,
  ConversationMessagesResponse,
  Message
} from '@/types/chat';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TopBar } from '@/components/dashboard/TopBar';
import { SidePanel } from '@/components/dashboard/SidePanel';
import { useAuthContext } from '@/contexts/AuthContext';
import {
  MessageCircle, ArrowLeft, Search, Send, Phone, Video,
  Smile, Paperclip, Info, Check, CheckCheck, Users, Heart
} from 'lucide-react';

// Assuming these imports are correct for your Vite project structure
import { useConversations, useConversationMessages } from '@/hooks/useAPI';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAuth } from '@/hooks/useAuth';
import { HeartBeatLoader } from '@/components/HeartBeatLoader';
import { API } from '@/services/api';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}

// Utility to parse URL search parameters from useLocation
const useViteSearchParams = () => {
  const location = useLocation();
  return new URLSearchParams(location.search);
};

// Custom Image Component
const OptimizedImage = ({ src, alt, width, height, className }: OptimizedImageProps) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    loading="lazy"
  />
);

const MessagesContent = () => {
  const searchParams = useViteSearchParams();
  const didAutoSelect = useRef(false);
  const profileIdParam = searchParams.get('profileId');
  const profileNameParam = searchParams.get('profileName');

  const [selectedChat, setSelectedChat] = useState<string | null>(
    profileIdParam || null
  );
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastRefetchedMatchId = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  const { user: authUser } = useAuth();
  const { user: layoutUser } = useAuthContext();
  const [showSidePanel, setShowSidePanel] = useState(false);
  const layoutName = layoutUser?.name || authUser?.name || 'User';
  const layoutImage = layoutUser?.profilePhoto1 || authUser?.profilePhoto1 || undefined;
  const currentUserId = authUser?.id;

  // Use a local state for messages to allow real-time updates without immediate refetch
  const [localMessagesData, setLocalMessagesData] = useState<ConversationMessagesResponse | null>(null);
  const lastReadMatchId = useRef<string | null>(null);

  // Fetch messages for selected conversation, and update local state
  const effectiveMatchId = selectedChat && selectedChat !== profileIdParam ? selectedChat : '';
  const {
    data: fetchedMessages,
    loading: conversationLoading,
    refetch: refetchMessages
  } = useConversationMessages(
    effectiveMatchId, profileIdParam || ''
  ) as { data: ConversationMessagesResponse | null, loading: boolean, refetch: () => void };

  // Sync fetched messages with local state
  useEffect(() => {
    setLocalMessagesData(fetchedMessages);
    if (fetchedMessages?.match?.id && lastReadMatchId.current !== fetchedMessages.match.id) {
      lastReadMatchId.current = fetchedMessages.match.id;
      refetch();
    }
  }, [fetchedMessages]);

  // Fetch raw conversations data from backend
  const {
    data: rawConversations, loading, error, refetch
  } = useConversations() as { data: ConversationSummary[] | null, loading: boolean, error: any, refetch: () => void };

  const webSocketService = useWebSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const realConversations: ConversationSummary[] = Array.isArray(rawConversations) ? rawConversations : [];

  const dedupedConversations = useMemo(() => {
    const map = new Map<string, ConversationSummary>();
    for (const conv of realConversations) {
      const otherId = conv.otherUser?.id;
      const key = otherId ? String(otherId) : String(conv.id);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, conv);
        continue;
      }
      const existingTime = existing.lastMessage?.createdAt
        ? new Date(existing.lastMessage.createdAt).getTime()
        : 0;
      const nextTime = conv.lastMessage?.createdAt
        ? new Date(conv.lastMessage.createdAt).getTime()
        : 0;
      map.set(key, nextTime >= existingTime ? conv : existing);
    }
    return Array.from(map.values());
  }, [realConversations]);

  const [localConversations, setLocalConversations] = useState<ConversationSummary[]>([]);

  useEffect(() => {
    setLocalConversations(dedupedConversations);
  }, [dedupedConversations]);

  const currentConversation: ConversationSummary | null = useMemo(() => {
    const found = localConversations.find(conv => conv.id === selectedChat);
    if (found) return found;

    // Handle virtual conversation case (new chat from profileIdParam)
    if (profileIdParam && profileNameParam && selectedChat === profileIdParam) {
      return {
        id: profileIdParam,
        otherUser: {
          id: profileIdParam,
          name: profileNameParam,
          profilePhoto1: '/default-avatar.png'
        },
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
      } as ConversationSummary;
    }

    return null;
  }, [selectedChat, localConversations, profileIdParam, profileNameParam]);

  // 1. Join/Leave WebSocket Room
  useEffect(() => {
    if (webSocketService && effectiveMatchId) {
      webSocketService.joinMatch(effectiveMatchId);

      return () => {
        webSocketService.leaveMatch(effectiveMatchId);
      };
    }
  }, [effectiveMatchId, webSocketService]);

  // 2. Real-time Message Listener (with optimistic message replacement logic)
  const handleNewMessage = useCallback((message: Message) => {
    const matchId = message.matchId;

    setLocalMessagesData(prev => {
      if (!prev) return null;

      // Only proceed if the message belongs to the current chat
      if (prev.match.id === matchId) {
        // Find if an optimistic message with the same content exists
        const tempIndex = prev.messages.findIndex(m => 
            m.content === message.content && 
            m.senderId === message.senderId &&
            m.id.startsWith('temp-')
        );

        let newMessages = [...prev.messages];

        if (tempIndex !== -1) {
          // Replace the optimistic (temporary) message with the real message
          newMessages[tempIndex] = message;
        } else if (!newMessages.some(m => m.id === message.id)) {
          // Add the real message only if it's not already in the list
          newMessages = [...newMessages, message];
        } else {
          // Message already exists
          return prev; 
        }

        return {
          ...prev,
          messages: newMessages,
        };
      }
      
      // If this message is for a new chat (virtual match) that just became real...
      if (
        matchId &&
        !localConversations.find(conv => conv.id === matchId) &&
        lastRefetchedMatchId.current !== matchId
      ) {
        refetch(); // Refetch conversation list to include the new match
        lastRefetchedMatchId.current = matchId;
      }
      
      return prev;
    });

    setLocalConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.id !== matchId) return conv;
        return {
          ...conv,
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
          },
          unreadCount:
            message.senderId !== currentUserId
              ? (conv.unreadCount || 0) + 1
              : conv.unreadCount,
          updatedAt: message.createdAt,
        };
      });
      return updated.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });

    setTimeout(scrollToBottom, 50);
  }, [localConversations, refetch, selectedChat, currentUserId]);


  useEffect(() => {
    if (webSocketService) {
      webSocketService.onNewMessage(handleNewMessage);
      // Remove listener on cleanup
      return () => {
        webSocketService.off('newMessage', handleNewMessage);
      };
    }
  }, [webSocketService, handleNewMessage]);

  useEffect(() => {
    if (!webSocketService) return;
    const handleTyping = (payload: { userId: string; isTyping: boolean }) => {
      setTypingStatus(prev => ({
        ...prev,
        [payload.userId]: payload.isTyping
      }));
    };
    webSocketService.onTyping(handleTyping);
    return () => {
      webSocketService.off('userTyping', handleTyping);
    };
  }, [webSocketService]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (localMessagesData) {
      scrollToBottom();
    }
  }, [localMessagesData?.messages.length]);


  const handleSendMessage = async () => {
    // --- DEBUGGING START ---
    console.log('handleSendMessage called.');
    // --- DEBUGGING END ---

    if (newMessage.trim() && currentConversation && webSocketService && currentUserId) {
        // --- DEBUGGING START ---
        console.log('All conditions passed. Attempting to send message...');
        // --- DEBUGGING END ---
      
      try {
        const actualMatchId = currentConversation.id;
        const messageContent = newMessage.trim();

        if (profileIdParam && currentConversation.id === profileIdParam) {
          console.warn('Cannot send message: no mutual match exists for this user yet.');
          return;
        }

        // --- OPTIMISTIC MESSAGE UPDATE ---
        const tempMessage: Message = {
          id: `temp-${Date.now()}-${Math.random()}`,
          senderId: currentUserId,
          receiverId: currentConversation.otherUser.id,
          content: messageContent,
          createdAt: new Date().toISOString(),
          isRead: false,
          matchId: actualMatchId,
          type: 'TEXT',
        };

        setLocalMessagesData(prev => {
          if (!prev) {
            return {
              match: { id: actualMatchId },
              messages: [tempMessage],
            } as ConversationMessagesResponse;
          }
          return {
            ...prev,
            messages: [...prev.messages, tempMessage],
          };
        });
        // --- END OPTIMISTIC UPDATE ---

        setLocalConversations(prev => {
          const updated = prev.map(conv => {
            if (conv.id !== actualMatchId) return conv;
            return {
              ...conv,
              lastMessage: {
                content: messageContent,
                createdAt: tempMessage.createdAt,
              },
              updatedAt: tempMessage.createdAt,
            };
          });
          return updated.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });

        // Notify other user in real-time (and persist via server)
        webSocketService.sendMessage(
          currentConversation.otherUser.id,
          messageContent,
          actualMatchId
        );

        // 2. Cleanup and scroll
        setNewMessage('');
        // Stop typing indicator after sending
        webSocketService.sendTyping(currentConversation.otherUser.id, false);
        setTimeout(scrollToBottom, 50);

        // 3. Handle conversation list refetch if a new match was created
        if (actualMatchId !== currentConversation.id) {
          refetchMessages(); // Fetch the match details + existing messages (if any)
          refetch(); // Refetch conversation list
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    } else {
        // --- DEBUGGING START ---
        console.warn('handleSendMessage conditions failed:', {
            message: newMessage.trim().length > 0, // Is the message not empty?
            conversation: !!currentConversation, // Is a conversation selected?
            socket: !!webSocketService, // Is the WebSocket service initialized?
            user: !!currentUserId // Is the current user ID available?
        });
        // --- DEBUGGING END ---
    }
  };

  const handleTypingChange = (value: string) => {
    setNewMessage(value);
    if (!currentConversation || !webSocketService || !currentConversation.otherUser?.id) return;
    const receiverId = currentConversation.otherUser.id;
    webSocketService.sendTyping(receiverId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      webSocketService.sendTyping(receiverId, false);
    }, 1200);
  };

  const handleSelectChat = (id: string) => {
    setSelectedChat(id);
    setLocalConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  // Auto select logic
  useEffect(() => {
    if (localConversations.length === 0) return;

    if (profileIdParam && !didAutoSelect.current) {
      const found = localConversations.find(
        conv => conv.otherUser?.id === profileIdParam
      );
      if (found && selectedChat !== found.id) {
        setSelectedChat(found.id);
        didAutoSelect.current = true;
      } else if (!found && selectedChat === profileIdParam) {
        didAutoSelect.current = true;
      }
    } else if (!selectedChat && !didAutoSelect.current) {
      setSelectedChat(localConversations[0]?.id);
      didAutoSelect.current = true;
    }
  }, [localConversations, profileIdParam, selectedChat]);

  useEffect(() => {
    if (!selectedChat || !localMessagesData?.messages?.length) return;
    if (localMessagesData.match?.id !== selectedChat) return;
    const unreadIds = localMessagesData.messages
      .filter(m => !m.isRead && m.senderId !== currentUserId)
      .map(m => m.id);
    if (unreadIds.length === 0) return;
    unreadIds.forEach(id => {
      API.Message.markMessageAsRead(id).catch(() => null);
    });
  }, [selectedChat, localMessagesData, currentUserId]);


  // Show loading state
  if (loading) {
    return <HeartBeatLoader message="Loading your conversations..." />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">Failed to load conversations: {error.toString()}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show no conversations state
  if (localConversations.length === 0 && !profileIdParam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <MessageCircle className="w-20 h-20 text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Conversations Yet</h2>
          <p className="text-gray-400 mb-4">Start matching with people to begin new conversations!</p>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            Find Matches
          </Link>
        </div>
      </div>
    );
  }

  const filteredConversations = localConversations.filter(conv => {
    const matchedUser = conv.otherUser;
    return matchedUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });


  if (!currentConversation && selectedChat) {
    return <HeartBeatLoader message="Initializing chat..." />;
  }

  const mainContent = (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row overflow-hidden max-w-full">
        {/* Conversations List */}
        <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-shrink-0 bg-gradient-to-b from-gray-900/60 to-gray-900/30 backdrop-blur-xl border-r border-gray-700/50 overflow-hidden min-w-0 flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-700/50">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 min-w-0">
            {filteredConversations.map((conversation) => {
              const matchedUser = conversation.otherUser;
              return (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectChat(conversation.id)}
                  className={`w-full p-4 rounded-2xl transition-all duration-300 hover:bg-white/10 min-w-0 text-left ${
                    selectedChat === conversation.id
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30'
                      : 'hover:bg-white/5'
                    }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <OptimizedImage
                        src={matchedUser?.profilePhoto1 || '/default-avatar.png'}
                        alt={matchedUser?.name || 'User'}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-full ring-2 ring-pink-500/30"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-gray-900"></div>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{conversation.unreadCount}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white truncate hover:text-pink-300 transition-colors cursor-pointer">{matchedUser?.name}</h3>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {conversation.lastMessage ? new Date(conversation.lastMessage.createdAt).toLocaleDateString() : 'New'}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${
                        conversation.unreadCount > 0 ? 'text-white font-medium' : 'text-gray-400'
                        }`}>
                        {conversation.lastMessage?.content || 'Start a conversation...'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat && currentConversation ? (
          <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0 overflow-hidden`}>
            {/* Chat Header */}
            <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>

                  <div className="relative">
                    <OptimizedImage
                      src={currentConversation.otherUser.profilePhoto1 || '/default-avatar.png'}
                      alt={currentConversation.otherUser.name || 'User'}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded-full ring-2 ring-pink-500/30"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-gray-900"></div>
                  </div>

                  <div>
                    <h3>{currentConversation.otherUser.name}</h3>
                    <p className="text-xs text-gray-400">
                      {typingStatus[currentConversation.otherUser.id] ? 'Typing…' : 'Active now'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl transition-all duration-300 hover:scale-105 group">
                    <Phone className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl transition-all duration-300 hover:scale-105 group">
                    <Video className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  </button>
                  <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl transition-all duration-300 hover:scale-105 group">
                    <Info className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-w-0">
              {conversationLoading && !localMessagesData ? (
                <div className="flex justify-center items-center h-full">
                  <HeartBeatLoader message="Loading messages..." />
                </div>
              ) : (
                localMessagesData?.messages && localMessagesData.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.senderId === currentUserId
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md'
                        : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-bl-md'
                      }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 ${
                        message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                        }`}>
                        <span className={`text-xs ${
                          message.senderId === currentUserId ? 'text-white/70' : 'text-gray-400'
                          }`}>
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.senderId === currentUserId && (
                          <div className="ml-2">
                            {message.isRead ? (
                              <CheckCheck className="w-3 h-3 text-white/70" />
                            ) : (
                              <Check className="w-3 h-3 text-white/50" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-gray-900/80 backdrop-blur-xl border-t border-gray-700/50 p-4 flex-shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <button className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 hover:border-white/30 rounded-2xl transition-all duration-300 hover:scale-105 group flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                </button>

                <div className="flex-1 relative min-w-0">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => handleTypingChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-all duration-300 min-w-0"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/10 rounded-xl transition-all duration-300">
                    <Smile className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                </div>

                {/* The disabled check should prevent running handleSendMessage when the socket is unavailable */}
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !webSocketService?.connected} 
                  className={`p-3 rounded-2xl transition-all duration-300 hover:scale-105 flex-shrink-0 ${
                    newMessage.trim() && webSocketService?.connected
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white shadow-lg shadow-pink-500/25'
                      : 'bg-white/10 text-gray-400 cursor-not-allowed'
                    }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-8 max-w-md">
                <MessageCircle className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Conversation</h3>
                <p className="text-gray-400">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          </div>
        )}
      </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white overflow-x-hidden pb-20 no-horizontal-scroll dashboard-main">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        <div className="w-80 flex-shrink-0">
          <SidePanel userName={layoutName} userImage={layoutImage} user={layoutUser} onClose={() => setShowSidePanel(false)} />
        </div>
        <div className="flex-1 flex flex-col min-h-screen">
          <TopBar
            userName={layoutName}
            userImage={layoutImage}
            user={layoutUser}
            showFilters={false}
            showSidePanel={showSidePanel}
            onToggleFilters={() => {}}
            onToggleSidePanel={() => setShowSidePanel(false)}
            title="Messages"
          />
          <div className="flex-1 overflow-y-auto">{mainContent}</div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen">
        <TopBar
          userName={layoutName}
          userImage={layoutImage}
          user={layoutUser}
          showFilters={false}
          showSidePanel={showSidePanel}
          onToggleFilters={() => {}}
          onToggleSidePanel={() => setShowSidePanel(true)}
          title="Messages"
        />
        <div className="flex-1">{mainContent}</div>
      </div>

      {showSidePanel && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowSidePanel(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw]">
            <SidePanel
              userName={layoutName}
              userImage={layoutImage}
              user={layoutUser}
              onClose={() => setShowSidePanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const MessagesPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white">Loading messages...</div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
};

// Final component for export, wrapped in the protective component
export default function ProtectedMessages() {
  return (
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  );
}
