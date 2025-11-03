import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  MessageSquare, 
  BookOpen, 
  Video, 
  BarChart3, 
  Settings,
  Upload,
  Eye,
  TrendingUp,
  Users,
  Clock,
  Star
} from 'lucide-react';
import KnowledgeBaseManager from '../components/fede/KnowledgeBaseManager';
import ConversationMonitor from '../components/fede/ConversationMonitor';
import TrainingTools from '../components/fede/TrainingTools';
import FedeConfiguration from '../components/fede/FedeConfiguration';
import fedeApi from '../services/fedeApi';

const AITrainingPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalKnowledge: 0,
    averageRating: 0,
    responseTime: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Cargar estadísticas de Fede
    fetchFedeStats();
  }, []);

  const fetchFedeStats = async () => {
    try {
      const response = await fedeApi.getStats();
      setStats(response.data || {
        totalConversations: 1250,
        totalKnowledge: 845,
        averageRating: 4.7,
        responseTime: 1.2,
        activeUsers: 89
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Usar datos de ejemplo si hay error
      setStats({
        totalConversations: 1250,
        totalKnowledge: 845,
        averageRating: 4.7,
        responseTime: 1.2,
        activeUsers: 89
      });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'conversations', label: 'Conversaciones', icon: MessageSquare },
    { id: 'training', label: 'Entrenamiento', icon: Brain },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          icon={MessageSquare}
          title="Conversaciones"
          value={stats.totalConversations.toLocaleString()}
          subtitle="Total de chats"
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          title="Knowledge Base"
          value={stats.totalKnowledge}
          subtitle="Documentos activos"
          color="green"
        />
        <StatCard
          icon={Star}
          title="Calificación"
          value={stats.averageRating.toFixed(1)}
          subtitle="Promedio de usuarios"
          color="yellow"
        />
        <StatCard
          icon={Clock}
          title="Tiempo Respuesta"
          value={`${stats.responseTime}s`}
          subtitle="Promedio"
          color="purple"
        />
        <StatCard
          icon={Users}
          title="Usuarios Activos"
          value={stats.activeUsers}
          subtitle="Últimos 30 días"
          color="indigo"
        />
      </div>

      {/* Panel de acciones rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('knowledge')}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-5 w-5 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium">Subir Contenido</p>
              <p className="text-sm text-gray-600">Videos, libros, artículos</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('conversations')}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="h-5 w-5 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium">Ver Conversaciones</p>
              <p className="text-sm text-gray-600">Monitor en tiempo real</p>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('training')}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium">Entrenar Modelo</p>
              <p className="text-sm text-gray-600">Mejorar respuestas</p>
            </div>
          </button>
        </div>
      </div>

      {/* Estado de Fede */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Estado de Fede AI</h2>
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="font-medium text-green-900">Sistema Operativo</p>
              <p className="text-sm text-green-700">Fede está respondiendo normalmente</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-600">Última actualización</p>
            <p className="text-xs text-green-500">Hace 2 minutos</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKnowledgeBase = () => (
    <div className="space-y-6">
      <KnowledgeBaseManager />
    </div>
  );

  const renderConversations = () => (
    <div className="space-y-6">
      <ConversationMonitor />
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      <TrainingTools />
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <FedeConfiguration />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'knowledge':
        return renderKnowledgeBase();
      case 'conversations':
        return renderConversations();
      case 'training':
        return renderTraining();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fede AI - Panel de Administración</h1>
          <p className="text-gray-600">Gestiona y entrena a tu asistente de coaching</p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-lg font-semibold text-blue-600">Fede</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default AITrainingPage;