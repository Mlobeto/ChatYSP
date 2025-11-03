import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import DashboardHome from '../pages/DashboardHome';
import UsersPage from '../pages/UsersPage';
import TipsPage from '../pages/TipsPage';
import VideosPage from '../pages/VideosPage';
import RoomsPage from '../pages/RoomsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import AITrainingPage from '../pages/AITrainingPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

// Configuración de rutas
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'tips',
        element: <TipsPage />,
      },
      {
        path: 'videos',
        element: <VideosPage />,
      },
      {
        path: 'rooms',
        element: <RoomsPage />,
      },
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      {
        path: 'ai-training',
        element: <AITrainingPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;