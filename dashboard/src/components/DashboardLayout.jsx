import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectUser, 
  selectIsAuthenticated, 
  logout, 
  verifyToken 
} from '../redux/authSlice';
import { clearError } from '../redux/dashboardSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import { toast } from 'react-hot-toast';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Verificar autenticación al cargar
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(verifyToken());
    }
  }, [dispatch, isAuthenticated, user]);

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearError());
    toast.success('Sesión cerrada correctamente');
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        isMobile={isMobile}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
      />

      {/* Overlay para móvil */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className={`
        flex-1 transition-all duration-300 ease-in-out
        ${!isMobile && sidebarCollapsed ? 'ml-16' : ''}
        ${!isMobile && !sidebarCollapsed ? 'ml-64' : ''}
        ${isMobile ? 'ml-0' : ''}
      `}>
        {/* Header */}
        <Header
          user={user}
          onToggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />

        {/* Contenido de la página */}
        <main className="p-4 sm:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;