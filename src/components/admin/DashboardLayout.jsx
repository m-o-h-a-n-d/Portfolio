import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useProfile, useSettings } from '../../context/DataContext';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Home,
  ChevronRight,
  Settings,
  Newspaper,
  Users,
  Award,
  Trash2,
  CheckCircle2,
  Clock,
  Mail
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const profile = useProfile();
  const settings = useSettings();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    deleteNotification, 
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
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

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/profile', icon: User, label: 'Profile' },
    { path: '/admin/resume', icon: FileText, label: 'Resume Content' },
    { path: '/admin/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/admin/services', icon: LayoutDashboard, label: 'Services' },
    { path: '/admin/blogs', icon: Newspaper, label: 'Blogs' },
    { path: '/admin/team', icon: Users, label: 'team' },
    { path: '/admin/certificates', icon: Award, label: 'Certificates' },
    { path: '/admin/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/admin/settings', icon: Settings, label: 'Settings & CV' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean).slice(1);
    const labelMap = {
      profile: 'Profile',
      resume: 'Resume Content',
      portfolio: 'Portfolio',
      services: 'Services',
      blogs: 'Blogs',
      team: 'Team',
      certificates: 'Certificates',
      messages: 'Messages',
      settings: 'Settings & CV'
    };
    const actionMap = { add: 'Add', edit: 'Edit' };
    const crumbs = [];
    if (parts.length > 0) {
      const section = labelMap[parts[0]] || parts[0];
      crumbs.push({ label: section, path: `/admin/${parts[0]}` });
      if (parts[1]) {
        const action = actionMap[parts[1]] || parts[1];
        const label = parts[1] === 'edit' && parts[2] ? 'Edit' : action;
        crumbs.push({ label, path: location.pathname });
      }
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  // Real-time notifications are handled in NotificationContext

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'var(--bg-gradient-jet)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            {settings?.logo ? (
              <img 
                src={settings.logo} 
                alt="Logo" 
                className="w-8 h-8 rounded-lg object-contain" 
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  {settings?.company?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            <span className="text-white-2 font-semibold truncate max-w-[140px]">
              {settings?.company?.split(' ')[0] || 'Admin'}
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      active 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-onyx'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.label === 'Messages' && unreadCount > 0 && (
                      <span className="ml-auto bg-destructive text-white-1 text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-onyx transition-all mb-2"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium text-sm">View Portfolio</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <Link to="/admin" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-foreground">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="text-muted-foreground hover:text-foreground">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className={`relative p-2 rounded-lg transition-colors ${
                  notifOpen ? 'bg-onyx text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-onyx'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white-1 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-card">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div 
                    className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right"
                    style={{ background: 'var(--bg-gradient-jet)' }}
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <h4 className="font-semibold text-white-2">Notifications</h4>
                      <div className="flex gap-2" />
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 mx-auto text-muted-foreground mb-2 opacity-20" />
                          <p className="text-muted-foreground text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              markAsRead(notif.id);
                              setNotifOpen(false);
                              navigate('/admin/messages', { state: { selectedMessageId: notif.id } });
                            }}
                            className={`p-4 border-b border-border/50 flex gap-3 group transition-colors cursor-pointer ${
                              notif.read ? 'opacity-70 hover:bg-onyx/30' : 'bg-primary/5 hover:bg-primary/10'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                              notif.read ? 'bg-onyx text-muted-foreground' : 'bg-primary/20 text-primary'
                            }`}>
                              <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-sm truncate ${notif.read ? 'text-foreground' : 'text-white-2 font-semibold'}`}>
                                  {notif.name}
                                </p>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notif.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                {notif.subject || notif.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatRelativeTime(notif.created_at)}
                                </span>
                                {!notif.read && (
                                  <span className="text-[10px] text-primary font-medium">
                                    Marked as read
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <Link 
                      to="/admin/messages" 
                      onClick={() => setNotifOpen(false)}
                      className="block p-3 text-center text-sm text-muted-foreground hover:text-primary hover:bg-onyx transition-colors border-t border-border"
                    >
                      View All Messages
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              {profile?.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover border border-border" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">
                    {profile?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <span className="hidden md:block text-sm text-foreground font-medium">
                {profile?.name?.split(' ')[0] || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
