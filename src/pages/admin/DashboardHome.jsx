import { useState, useEffect, useMemo } from 'react';
import { apiGet } from '../../api/request';
import { DASHBOARD_ENDPOINTS } from '../../api/endpoints';
import { useNotifications } from '../../context/NotificationContext';
import { Users, FileText, Briefcase, MessageSquare, TrendingUp, Eye, Wrench } from 'lucide-react';

const DashboardHome = () => {
  const { notifications, unreadCount, fetchNotifications, loading: notificationsLoading } = useNotifications();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [portfolioItems, setPortfolioItems] = useState([]);

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [portfolioRes, messagesRes, servicesRes] = await Promise.allSettled([
          apiGet(DASHBOARD_ENDPOINTS.portfolio.list),
          apiGet(DASHBOARD_ENDPOINTS.contactUs.list),
          apiGet(DASHBOARD_ENDPOINTS.services.list)
        ]);

        const getValue = (res) => (res?.status === 'fulfilled' ? res.value : null);
        const portfolioValue = getValue(portfolioRes);
        const messagesValue = getValue(messagesRes);

        const extractList = (res) => {
          if (Array.isArray(res?.data)) return res.data;
          if (Array.isArray(res?.data?.data)) return res.data.data;
          if (Array.isArray(res?.data?.projects)) return res.data.projects;
          if (Array.isArray(res?.data?.portfolios)) return res.data.portfolios;
          if (Array.isArray(res)) return res;
          return [];
        };

        const extractCount = (res, keys = []) => {
          const data = res?.data ?? res;
          if (!data || typeof data !== 'object') return null;
          for (const key of keys) {
            if (typeof data?.[key] === 'number') return data[key];
          }
          return null;
        };

        const items = extractList(portfolioValue);
        setPortfolioItems(items);

        const portfolioCount =
          extractCount(portfolioValue, ['count', 'total', 'total_projects', 'projects_count']) ??
          items.length;

        const messagesCount =
          extractCount(messagesValue, ['count', 'total', 'total_messages', 'messages_count']) ??
          notifications.length;

        const servicesValue = getValue(servicesRes);
        const servicesCount =
          extractCount(servicesValue, ['count', 'total', 'total_services', 'services_count']) ??
          extractList(servicesValue).length;

        await fetchNotifications();

        setStats({
          totalProjects: portfolioCount,
          totalMessages: messagesCount,
          unreadMessages: unreadCount,
          totalServices: servicesCount
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    setStats((prev) =>
      prev
        ? { ...prev, totalMessages: prev.totalMessages ?? notifications.length, unreadMessages: unreadCount }
        : prev
    );
  }, [notifications.length, unreadCount]);

  const recentActivity = useMemo(() => {
    const messageItems = notifications.map((message) => ({
      type: 'message',
      text: `New message from ${message.name || 'Visitor'}`,
      time: formatRelativeTime(message.created_at),
      date: message.created_at
    }));

    const projectItems = portfolioItems
      .filter((item) => item?.updated_at || item?.updatedAt)
      .map((item) => ({
        type: 'project',
        text: `Portfolio project "${item.title || item.name || 'Untitled'}" updated`,
        time: formatRelativeTime(item.updated_at || item.updatedAt),
        date: item.updated_at || item.updatedAt
      }));

    return [...messageItems, ...projectItems]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);
  }, [notifications, portfolioItems]);

  const statCards = [
    { label: 'Portfolio Projects', value: stats?.totalProjects || 0, icon: Briefcase, color: 'text-primary' },
    { label: 'Total Messages', value: stats?.totalMessages || 0, icon: MessageSquare, color: 'text-vegas-gold' },
    { label: 'Unread Messages', value: stats?.unreadMessages || 0, icon: MessageSquare, color: 'text-destructive' },
    { label: 'Total Services', value: stats?.totalServices || 0, icon: Wrench, color: 'text-green-500' },
  ];

  if (loading || notificationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-card border border-border rounded-[20px] p-6" style={{ background: 'var(--bg-gradient-jet)' }}>
        <h1 className="h2 text-white-2 mb-2">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's an overview of your portfolio performance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-card border border-border rounded-[20px] p-5 transition-all hover:shadow-portfolio-2"
              style={{ background: 'var(--bg-gradient-jet)' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-semibold text-white-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-onyx ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div 
        className="bg-card border border-border rounded-[20px] p-6"
        style={{ background: 'var(--bg-gradient-jet)' }}
      >
        <h2 className="h3 text-white-2 mb-4">Recent Activity</h2>
        <ul className="space-y-4">
          {recentActivity.length === 0 && (
            <li className="text-muted-foreground text-sm">No recent activity yet</li>
          )}
          {recentActivity.map((activity, index) => (
            <li 
              key={index}
              className="flex items-center gap-4 p-4 bg-onyx/30 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {activity.type === 'message' && <MessageSquare className="w-5 h-5" />}
                {activity.type === 'project' && <Briefcase className="w-5 h-5" />}
                {activity.type === 'view' && <TrendingUp className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-foreground text-sm">{activity.text}</p>
                <p className="text-muted-foreground text-xs">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Actions */}
      <div 
        className="bg-card border border-border rounded-[20px] p-6"
        style={{ background: 'var(--bg-gradient-jet)' }}
      >
        <h2 className="h3 text-white-2 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a 
            href="/admin/profile" 
            className="flex flex-col items-center gap-2 p-4 bg-onyx/30 rounded-xl hover:bg-onyx/50 transition-colors"
          >
            <Users className="w-6 h-6 text-primary" />
            <span className="text-sm text-foreground">Edit Profile</span>
          </a>
          <a 
            href="/admin/portfolio" 
            className="flex flex-col items-center gap-2 p-4 bg-onyx/30 rounded-xl hover:bg-onyx/50 transition-colors"
          >
            <Briefcase className="w-6 h-6 text-primary" />
            <span className="text-sm text-foreground">Add Project</span>
          </a>
          <a 
            href="/admin/resume" 
            className="flex flex-col items-center gap-2 p-4 bg-onyx/30 rounded-xl hover:bg-onyx/50 transition-colors"
          >
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-sm text-foreground">Update Resume</span>
          </a>
          <a 
            href="/admin/messages" 
            className="flex flex-col items-center gap-2 p-4 bg-onyx/30 rounded-xl hover:bg-onyx/50 transition-colors"
          >
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="text-sm text-foreground">View Messages</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
