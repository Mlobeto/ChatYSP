import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  CogIcon,
  ChartBarIcon,
  BeakerIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { FaWhatsapp } from 'react-icons/fa';

const Sidebar = ({ collapsed, mobileMenuOpen, isMobile, onToggle, onLogout }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
    },
    {
      name: 'Usuarios',
      href: '/users',
      icon: UsersIcon,
    },
    {
      name: 'Tips',
      href: '/tips',
      icon: LightBulbIcon,
    },
    {
      name: 'Tips Diarios',
      href: '/daily-tips',
      icon: FaWhatsapp,
    },
    {
      name: 'Salas',
      href: '/rooms',
      icon: ChatBubbleLeftRightIcon,
    },
    {
      name: 'Analíticas',
      href: '/analytics',
      icon: ChartBarIcon,
    },
    {
      name: 'IA Training',
      href: '/ai-training',
      icon: BeakerIcon,
    },
    {
      name: 'Footers',
      href: '/footers',
      icon: DocumentTextIcon,
    },
    {
      name: 'Configuración',
      href: '/settings',
      icon: CogIcon,
    },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const sidebarClasses = `
    fixed top-0 left-0 z-50 h-full bg-white shadow-lg transition-all duration-300 ease-in-out
    ${isMobile ? 'w-64' : collapsed ? 'w-16' : 'w-64'}
    ${isMobile && !mobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
  `;

  return (
    <div className={sidebarClasses}>
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {(!collapsed || isMobile) && (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">ChatYSP</span>
          </div>
        )}
        
        {isMobile && (
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
        
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${active
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                ${collapsed && !isMobile ? 'justify-center' : ''}
              `}
              title={collapsed && !isMobile ? item.name : ''}
            >
              <Icon className={`
                flex-shrink-0 w-5 h-5
                ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                ${collapsed && !isMobile ? '' : 'mr-3'}
              `} />
              {(!collapsed || isMobile) && (
                <span className="truncate">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={onLogout}
          className={`
            group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 
            rounded-md hover:bg-red-50 hover:text-red-600 transition-colors
            ${collapsed && !isMobile ? 'justify-center' : ''}
          `}
          title={collapsed && !isMobile ? 'Cerrar Sesión' : ''}
        >
          <ArrowLeftOnRectangleIcon className={`
            flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-red-500
            ${collapsed && !isMobile ? '' : 'mr-3'}
          `} />
          {(!collapsed || isMobile) && (
            <span className="truncate">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;