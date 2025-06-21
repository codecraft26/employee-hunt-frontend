// components/AdminNavigation.tsx
import React, { memo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Target, MapPin, Vote, Users, CheckCircle, Building2, ChevronDown, Menu, Image as ImageIcon, UserCog } from 'lucide-react';

interface AdminNavigationProps {
  pendingApprovals?: number;
}

// Static navigation items
const NAVIGATION_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, href: '/admin' },
  { id: 'quizzes', label: 'Quizzes', icon: Target, href: '/admin/quizzes' },
  { id: 'treasure-hunts', label: 'Treasure Hunts', icon: MapPin, href: '/admin/treasure-hunts' },
  { id: 'polls', label: 'Polls & Voting', icon: Vote, href: '/admin/polls' },
  { id: 'teams', label: 'Teams', icon: Users, href: '/admin/teams' },
  { id: 'categories', label: 'Categories', icon: Building2, href: '/admin/categories' },
  { id: 'photo-wall', label: 'Photo Wall', icon: ImageIcon, href: '/admin?tab=photo-wall' },
  { id: 'user-management', label: 'User Management', icon: UserCog, href: '/admin?tab=user-management' },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle, href: '/admin/approveUser' },
];

const AdminNavigation: React.FC<AdminNavigationProps> = memo(({
  pendingApprovals = 0
}) => {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [visibleItems, setVisibleItems] = useState<typeof NAVIGATION_ITEMS>([]);
  const [hiddenItems, setHiddenItems] = useState<typeof NAVIGATION_ITEMS>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive navigation visibility logic
  useEffect(() => {
    const updateNavigationVisibility = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const navElements = container.querySelectorAll('[data-nav]');
      
      let visibleCount = 0;
      let totalWidth = 0;
      const mobileBreakpoint = 768; // md breakpoint

      if (window.innerWidth < mobileBreakpoint) {
        // On mobile, show only first 3 items + dropdown
        setVisibleItems(NAVIGATION_ITEMS.slice(0, 3));
        setHiddenItems(NAVIGATION_ITEMS.slice(3));
      } else {
        // On tablet, calculate based on available space
        const availableWidth = containerWidth - 120; // Account for dropdown button
        
        for (let i = 0; i < navElements.length; i++) {
          const navElement = navElements[i] as HTMLElement;
          const navWidth = navElement.offsetWidth + 32; // 32px for spacing
          
          if (totalWidth + navWidth <= availableWidth) {
            totalWidth += navWidth;
            visibleCount++;
          } else {
            break;
          }
        }
        
        setVisibleItems(NAVIGATION_ITEMS.slice(0, visibleCount));
        setHiddenItems(NAVIGATION_ITEMS.slice(visibleCount));
      }
    };

    updateNavigationVisibility();
    window.addEventListener('resize', updateNavigationVisibility);
    return () => window.removeEventListener('resize', updateNavigationVisibility);
  }, []);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const handleItemClick = () => {
    setShowMobileMenu(false);
  };

  return (
    <div className="lg:hidden bg-white border-b sticky top-16 z-30">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          {/* Tablet Navigation */}
          <div className="hidden md:flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div ref={containerRef} className="flex items-center space-x-1">
              {visibleItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  data-nav={item.id}
                  onClick={handleItemClick}
                  className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors rounded-t-lg ${
                    isActive(item.href)
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === 'approvals' && pendingApprovals > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingApprovals}
                    </span>
                  )}
                </Link>
              ))}
              
              {/* Dropdown for hidden items */}
              {hiddenItems.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="flex items-center space-x-2 py-4 px-3 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    <span>More</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showMobileMenu && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {hiddenItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={handleItemClick}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                            isActive(item.href) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          {item.id === 'approvals' && pendingApprovals > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                              {pendingApprovals}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-1">
                {visibleItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleItemClick}
                    className={`flex items-center space-x-1 py-2 px-2 border-b-2 font-medium text-xs whitespace-nowrap transition-colors ${
                      isActive(item.href)
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{item.label}</span>
                    {item.id === 'approvals' && pendingApprovals > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {pendingApprovals}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Menu Button */}
              {hiddenItems.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Menu className="h-5 w-5" />
                  </button>
                  
                  {showMobileMenu && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      {hiddenItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={handleItemClick}
                          className={`w-full flex items-center space-x-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                            isActive(item.href) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700'
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                          {item.id === 'approvals' && pendingApprovals > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-auto">
                              {pendingApprovals}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside to close dropdown */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
});

AdminNavigation.displayName = 'AdminNavigation';

export default AdminNavigation;