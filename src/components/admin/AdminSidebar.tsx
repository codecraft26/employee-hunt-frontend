import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Target, 
  MapPin, 
  Vote, 
  Users, 
  CheckCircle, 
  Building2, 
  Image as ImageIcon,
  UserCog,
  Activity
} from 'lucide-react';

interface AdminSidebarProps {
  pendingApprovals?: number;
}

// Static navigation items
const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, href: '/admin' },
  { id: 'quizzes', label: 'Quizzes', icon: Target, href: '/admin/quizzes' },
  { id: 'treasure-hunts', label: 'Treasure Hunts', icon: MapPin, href: '/admin/treasure-hunts' },
  { id: 'polls', label: 'Polls & Voting', icon: Vote, href: '/admin/polls' },
  { id: 'teams', label: 'Teams', icon: Users, href: '/admin/teams' },
  { id: 'categories', label: 'Categories', icon: Building2, href: '/admin/categories' },
  { id: 'activities', label: 'Activities', icon: Activity, href: '/admin?tab=activities' },
  { id: 'photo-wall', label: 'Photo Wall', icon: ImageIcon, href: '/admin?tab=photo-wall' },
  { id: 'user-management', label: 'User Management', icon: UserCog, href: '/admin?tab=user-management' },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle, href: '/admin/approveUser' },
];

const AdminSidebar: React.FC<AdminSidebarProps> = memo(({
  pendingApprovals = 0
}) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40">
      {/* Sidebar */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
        {/* Logo/Brand */}
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {SIDEBAR_ITEMS.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${
                        isActive(item.href)
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon 
                        className={`h-6 w-6 shrink-0 ${
                          isActive(item.href) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                        }`} 
                        aria-hidden="true" 
                      />
                      <span className="truncate">{item.label}</span>
                      {item.id === 'approvals' && pendingApprovals > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {pendingApprovals}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
});

AdminSidebar.displayName = 'AdminSidebar';

export default AdminSidebar; 