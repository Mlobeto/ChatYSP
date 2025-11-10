import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  User, 
  Clock, 
  Star, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Search,
  Eye,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import fedeApi from '../../services/fedeApi';

const ConversationMonitor = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: '7d',
    rating: 'all',
    category: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalConversations: 0,
    averageRating: 0,
    averageResponseTime: 0,
    successRate: 0,
    topCategories: []
  });

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [filters]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fedeApi.getConversations({
        ...filters,
        search: searchTerm,
        limit: 50
      });
      setConversations(response.data?.conversations || response.conversations || []);
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fedeApi.getStats();
      // getStats devuelve {success, data: {conversationCount, knowledgeCount, avgRating, recentConversations}}
      // Mapear a la estructura que espera el componente
      const apiStats = response.data || {};
      setStats({
        totalConversations: apiStats.conversationCount || 0,
        averageRating: parseFloat(apiStats.avgRating) || 0,
        averageResponseTime: 0, // No disponible aún
        successRate: 0 // No disponible aún
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleViewConversation = async (conversationId) => {
    try {
      const response = await fedeApi.getConversationDetails(conversationId);
      setSelectedConversation(response.data);
    } catch (error) {
      console.error('Error cargando detalles de conversación:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (wasSuccessful) => {
    return wasSuccessful ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-600" />
    );
  };

  const StatCard = ({ icon: Icon, title, value, change, positive }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Icon className="h-6 w-6 text-blue-600" />
          {change && (
            <div className={`flex items-center ${positive ? 'text-green-600' : 'text-red-600'}`}>
              {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span className="text-sm font-medium">{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.userMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.fedeResponse.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={MessageSquare}
          title="Conversaciones"
          value={stats.totalConversations?.toLocaleString() || '0'}
          change="+12%"
          positive={true}
        />
        <StatCard
          icon={Star}
          title="Rating Promedio"
          value={stats.averageRating?.toFixed(1) || '0.0'}
          change="+0.2"
          positive={true}
        />
        <StatCard
          icon={Clock}
          title="Tiempo Respuesta"
          value={`${stats.averageResponseTime?.toFixed(1) || '0'}s`}
          change="-0.3s"
          positive={true}
        />
        <StatCard
          icon={CheckCircle}
          title="Tasa de Éxito"
          value={`${(stats.successRate * 100)?.toFixed(1) || '0'}%`}
          change="+2.1%"
          positive={true}
        />
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Monitor de Conversaciones</h2>
            <button
              onClick={fetchConversations}
              className="flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </button>
          </div>

          <div className="flex flex-wrap items-center space-x-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1d">Último día</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>

            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las calificaciones</option>
              <option value="5">5 estrellas</option>
              <option value="4">4+ estrellas</option>
              <option value="3">3+ estrellas</option>
              <option value="2">2+ estrellas</option>
              <option value="1">1+ estrella</option>
            </select>

            <button className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de conversaciones */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay conversaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron conversaciones que coincidan con tu búsqueda' : 'No hay conversaciones en el rango de fechas seleccionado'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConversations.map((conversation) => (
                  <tr key={conversation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {conversation.userMessage}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {conversation.fedeResponse.substring(0, 100)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          Usuario #{conversation.userId.substring(0, 8)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {conversation.detectedCategory || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {conversation.userRating ? (
                        <div className="flex items-center">
                          <Star className={`h-4 w-4 mr-1 ${getRatingColor(conversation.userRating)}`} />
                          <span className={`text-sm ${getRatingColor(conversation.userRating)}`}>
                            {conversation.userRating}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sin rating</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(conversation.processingTime / 1000).toFixed(2)}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(conversation.wasSuccessful)}
                        <span className={`ml-2 text-sm ${conversation.wasSuccessful ? 'text-green-600' : 'text-red-600'}`}>
                          {conversation.wasSuccessful ? 'Exitoso' : 'Error'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(conversation.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewConversation(conversation.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalles de conversación */}
      {selectedConversation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de Conversación
                </h3>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Usuario</p>
                    <p className="font-medium">#{selectedConversation.userId.substring(0, 8)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Fecha</p>
                    <p className="font-medium">{formatTime(selectedConversation.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Tiempo de respuesta</p>
                    <p className="font-medium">{(selectedConversation.processingTime / 1000).toFixed(2)}s</p>
                  </div>
                </div>

                {/* Conversación */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Mensaje del Usuario</p>
                    <p className="mt-2 text-gray-900">{selectedConversation.userMessage}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Respuesta de Fede</p>
                    <p className="mt-2 text-gray-900">{selectedConversation.fedeResponse}</p>
                  </div>
                </div>

                {/* Fuentes utilizadas */}
                {selectedConversation.knowledgeSources && selectedConversation.knowledgeSources.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Fuentes Utilizadas</h4>
                    <div className="space-y-2">
                      {selectedConversation.knowledgeSources.map((source, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">{source.title}</p>
                          <p className="text-xs text-gray-600">{source.contentType} - {source.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating y feedback */}
                {selectedConversation.userRating && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-700 font-medium">Calificación del Usuario</p>
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < selectedConversation.userRating ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedConversation.userRating}/5
                      </span>
                    </div>
                    {selectedConversation.userFeedback && (
                      <p className="mt-2 text-sm text-gray-700">{selectedConversation.userFeedback}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationMonitor;