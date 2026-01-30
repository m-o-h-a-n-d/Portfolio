import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { Mail, Clock, Check, Trash2, Eye } from 'lucide-react';
import Swal from '../../lib/swal';

const MessagesInbox = () => {
  const { 
    notifications: messages, 
    loading, 
    markAsRead, 
    deleteNotification,
    fetchNotifications 
  } = useNotifications();
  const [selectedMessage, setSelectedMessage] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const targetId = location.state?.selectedMessageId;
    if (!targetId || messages.length === 0) return;
    const target = messages.find((message) => message.id === targetId);
    if (target) {
      setSelectedMessage(target);
      if (!target.read) {
        markAsRead(target.id);
      }
    }
  }, [location.state, messages, markAsRead]);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 60) return 'just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (!result.isConfirmed) return;
    
    try {
      await deleteNotification(id);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Message deleted successfully!',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error deleting message'
      });
    }
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      await markAsRead(message.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="h2 text-white-2">Messages Inbox</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {messages.filter(m => !m.read).length} unread messages
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Messages List */}
        <div 
          className="lg:col-span-2 bg-card border border-border rounded-[20px] overflow-hidden"
          style={{ background: 'var(--bg-gradient-jet)' }}
        >
          <div className="max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => openMessage(message)}
                  className={`p-4 border-b border-border cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id 
                      ? 'bg-primary/10' 
                      : message.read 
                        ? 'hover:bg-onyx/50' 
                        : 'bg-onyx/30 hover:bg-onyx/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Indicator */}
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      message.read ? 'bg-muted' : 'bg-primary'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={`text-sm truncate ${
                          message.read ? 'text-foreground' : 'text-foreground font-semibold'
                        }`}>
                          {message.name}
                        </h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{message.email}</p>
                      <p className="text-sm text-light-gray truncate mt-1">
                        {message.subject || message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div 
          className="lg:col-span-3 bg-card border border-border rounded-[20px] p-6"
          style={{ background: 'var(--bg-gradient-jet)' }}
        >
          {selectedMessage ? (
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="h3 text-white-2 mb-1">{selectedMessage.name}</h3>
                  {selectedMessage.subject && (
                    <p className="text-sm text-muted-foreground">{selectedMessage.subject}</p>
                  )}
                  <a 
                    href={`mailto:${selectedMessage.email}`}
                    className="text-primary text-sm hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 rounded-lg bg-onyx text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                <Clock className="w-4 h-4" />
                <span>{formatRelativeTime(selectedMessage.created_at)}</span>
                {selectedMessage.read && (
                  <span className="flex items-center gap-1 text-green-500 ml-4">
                    <Check className="w-4 h-4" />
                    Read
                  </span>
                )}
              </div>

              {/* Message Content */}
              <div className="bg-onyx/30 rounded-xl p-6">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Reply Button */}
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: Contact from Portfolio`}
                className="form-btn mt-6"
              >
                <Mail className="w-5 h-5" />
                <span>Reply via Email</span>
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Eye className="w-12 h-12 mb-4" />
              <p>Select a message to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesInbox;
