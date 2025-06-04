import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  PieChart,
  Bot,
  Target,
  BookOpen,
  TrendingUp,
  DollarSign,
  Settings,
  HelpCircle,
  BarChart3,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and summary'
    },
    {
      name: 'Portfolio',
      href: '/portfolio',
      icon: PieChart,
      description: 'View your investments'
    },
    {
      name: 'AI Advisor',
      href: '/advisor',
      icon: Bot,
      description: 'Get personalized advice'
    },
    {
      name: 'Goals',
      href: '/goals',
      icon: Target,
      description: 'Financial objectives'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Performance metrics'
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: Wallet,
      description: 'Transaction history'
    },
    {
      name: 'Education',
      href: '/education',
      icon: BookOpen,
      description: 'Learn about investing'
    }
  ];

  const bottomNavigationItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account settings'
    },
    {
      name: 'Help',
      href: '/help',
      icon: HelpCircle,
      description: 'Get support'
    }
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  };

  // Helper function to get role display name
  const getRoleDisplayName = () => {
    if (!user?.role) return 'Basic';
    switch (user.role) {
      case 'admin': return 'Admin';
      case 'advisor': return 'Advisor';
      case 'user': return 'Basic';
      default: return 'Basic';
    }
  };

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
      {/* Portfolio Summary */}
      {!isCollapsed && (
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Portfolio Value</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              $0
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600">+5.2%</span>
              <span className="text-gray-500 ml-1">this month</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mx-auto mb-1">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xs text-gray-600">Cash</div>
              <div className="text-sm font-semibold">$0</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-xs text-gray-600">Gain/Loss</div>
              <div className="text-sm font-semibold text-green-600">+$2,450</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          {bottomNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
                }`} />
                {!isCollapsed && (
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.name}</div>
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {getUserDisplayName()}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {getRoleDisplayName()} Member
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;