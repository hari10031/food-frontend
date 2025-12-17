import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { IoSend, IoClose, IoChatbubbleEllipses } from 'react-icons/io5';
import { serverUrl } from '../App';

const ChatWindow = ({ orderId, shopOrderId, onClose, recipientName }) => {
    const [chat, setChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const userData = useSelector(state => state.user.userData);
    const user = userData?.user;
    const { socket } = useSocket();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch or create chat
    useEffect(() => {
        const fetchChat = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(
                    `${serverUrl}api/chat/order/${orderId}/${shopOrderId}`,
                    { withCredentials: true }
                );
                if (response.data.success) {
                    setChat(response.data.chat);
                    setMessages(response.data.chat.messages || []);
                } else {
                    setError(response.data.message || 'Failed to load chat');
                }
            } catch (error) {
                console.error('Error fetching chat:', error);
                setError(error.response?.data?.message || 'Failed to load chat');
            } finally {
                setLoading(false);
            }
        };

        if (orderId && shopOrderId) {
            fetchChat();
        } else {
            setLoading(false);
            setError('Missing order information');
        }
    }, [orderId, shopOrderId]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !chat) return;

        // Join the chat room
        socket.emit('join-chat', chat._id);

        const handleNewMessage = (data) => {
            // Ignore messages sent by current user (they're added from API response)
            if (data.senderId === user?._id?.toString()) {
                return;
            }

            if (data.chatId === chat._id.toString() || data.chatId === chat._id) {
                // Check if message already exists to avoid duplicates
                setMessages(prev => {
                    const msgId = data.message._id?.toString();
                    const exists = prev.some(m => m._id?.toString() === msgId);
                    if (exists) return prev;
                    return [...prev, data.message];
                });
            }
        };

        const handleTyping = (data) => {
            if (data.userId !== user?._id) {
                setIsTyping(data.isTyping);
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('user-typing', handleTyping);

        return () => {
            socket.emit('leave-chat', chat._id);
            socket.off('new_message', handleNewMessage);
            socket.off('user-typing', handleTyping);
        };
    }, [socket, chat, user]);

    // Scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read
    useEffect(() => {
        const markRead = async () => {
            if (chat && messages.length > 0) {
                try {
                    await axios.put(
                        `${serverUrl}api/chat/${chat._id}/read`,
                        {},
                        { withCredentials: true }
                    );
                } catch (error) {
                    // Silent fail
                }
            }
        };
        markRead();
    }, [chat, messages]);

    const handleTyping = () => {
        if (socket && chat) {
            socket.emit('typing', { chatId: chat._id, userId: user?._id, isTyping: true });

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { chatId: chat._id, userId: user?._id, isTyping: false });
            }, 2000);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat) return;

        try {
            setSending(true);
            const response = await axios.post(
                `${serverUrl}api/chat/${chat._id}/message`,
                { content: newMessage },
                { withCredentials: true }
            );

            if (response.data.success) {
                setMessages(prev => [...prev, response.data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl flex items-center justify-center z-[9999]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col z-[9999]">
                <div className="bg-orange-500 text-white p-3 rounded-t-lg flex justify-between items-center">
                    <span className="font-semibold">Chat</span>
                    <button onClick={onClose} className="hover:bg-orange-600 rounded p-1">
                        <IoClose size={20} />
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-gray-500">
                    <p>{error || 'Chat not available'}</p>
                    {error && (
                        <button
                            onClick={onClose}
                            className="mt-3 text-orange-500 hover:underline text-sm"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 h-[450px] bg-white rounded-lg shadow-xl flex flex-col z-[9999]">
            {/* Header */}
            <div className="bg-orange-500 text-white p-3 rounded-t-lg flex justify-between items-center">
                <div>
                    <span className="font-semibold">{recipientName || 'Chat'}</span>
                    {isTyping && <span className="text-xs ml-2">typing...</span>}
                </div>
                <button onClick={onClose} className="hover:bg-orange-600 rounded p-1">
                    <IoClose size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">
                        Start a conversation
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isOwnMessage = msg.sender === user?._id ||
                            (msg.sender?._id && msg.sender._id === user?._id);
                        return (
                            <div
                                key={msg._id || index}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] px-3 py-2 rounded-lg ${isOwnMessage
                                        ? 'bg-orange-500 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none shadow'
                                        }`}
                                >
                                    <p className="text-sm break-words">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-orange-100' : 'text-gray-400'
                                        }`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 border-t bg-white rounded-b-lg">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <IoSend size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

// Chat Button Component to open chat window
export const ChatButton = ({ orderId, shopOrderId, recipientName, unreadCount = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="relative bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
                title="Chat with delivery boy"
            >
                <IoChatbubbleEllipses size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <ChatWindow
                    orderId={orderId}
                    shopOrderId={shopOrderId}
                    onClose={() => setIsOpen(false)}
                    recipientName={recipientName}
                />
            )}
        </>
    );
};

export default ChatWindow;
