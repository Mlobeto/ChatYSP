import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaSort,
  FaBolt,
  FaGamepad,
  FaComments,
  FaBrain,
  FaRandom,
  FaChartBar
} from 'react-icons/fa';
import { 
  loadTips, 
  deleteTip, 
  getTipsStats,
  getRandomTips,
  setFilters, 
  resetFilters,
  clearError,
  clearSuccessMessage,
  selectAllTips,
  selectTipsStats,
  selectTipsFilters,
  selectTipsPagination,
  selectTipsLoading,
  selectTipsError,
  selectTipsSuccessMessage,
  selectCategories,
  selectDifficulties,
} from '../redux/tipsSlice';
import CreateTipModal from '../components/CreateTipModal';
import EditTipModal from '../components/EditTipModal';

const TipsPage = () => {
  const dispatch = useDispatch();
  const tips = useSelector(selectAllTips);
  const stats = useSelector(selectTipsStats);
  const filters = useSelector(selectTipsFilters);
  const pagination = useSelector(selectTipsPagination);
  const isLoading = useSelector(selectTipsLoading);
  const error = useSelector(selectTipsError);
  const successMessage = useSelector(selectTipsSuccessMessage);
  const categories = useSelector(selectCategories);
  const difficulties = useSelector(selectDifficulties);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(loadTips());
    dispatch(getTipsStats());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
    }
  }, [successMessage, dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(loadTips({ [key]: value }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    dispatch(loadTips());
  };

  const handleEdit = (tip) => {
    setSelectedTip(tip);
    setShowEditModal(true);
  };

  const handleDelete = async (tipId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este tip?')) {
      await dispatch(deleteTip(tipId));
      dispatch(loadTips());
    }
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedTip(null);
    dispatch(loadTips());
  };

  const getCategoryIcon = (category) => {
    const icons = {
      chat: FaComments,
      game: FaGamepad,
      general: FaBolt,
      ai: FaBrain,
    };
    return icons[category] || FaBolt;
  };

  const getCategoryColor = (category) => {
    const colors = {
      chat: 'bg-blue-100 text-blue-800',
      game: 'bg-green-100 text-green-800',
      general: 'bg-purple-100 text-purple-800',
      ai: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tips Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Gestiona los tips de la aplicación</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors w-full sm:w-auto justify-center sm:justify-start"
        >
          <FaPlus className="w-4 h-4" />
          <span>Crear Tip</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
              <FaChartBar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Tips</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div 
                className="p-2 sm:p-3 rounded-full" 
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {React.createElement(getCategoryIcon(category.id), { className: "w-4 h-4 sm:w-5 sm:h-5" })}
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">{category.name}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stats.byCategory?.[category.id] || 0}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar tips..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">Todas las dificultades</option>
              {difficulties.map((difficulty) => (
                <option key={difficulty.id} value={difficulty.id}>
                  {difficulty.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="created_at-desc">Más recientes</option>
              <option value="created_at-asc">Más antiguos</option>
              <option value="title-asc">Título A-Z</option>
              <option value="title-desc">Título Z-A</option>
              <option value="category-asc">Categoría</option>
            </select>

            <button
              onClick={handleResetFilters}
              className="text-gray-600 hover:text-gray-800 flex items-center justify-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <FaFilter className="w-4 h-4" />
              <span>Limpiar filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="text-sm text-green-700">{successMessage}</div>
        </div>
      )}

      {/* Tips List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        ) : tips.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FaBolt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tips</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer tip.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <FaPlus className="mr-2 w-4 h-4" />
                Crear Tip
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dificultad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tips.map((tip) => (
                    <tr key={tip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {tip.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {tip.content}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                          {React.createElement(getCategoryIcon(tip.category), { className: "mr-1 w-3 h-3" })}
                          {categories.find(c => c.id === tip.category)?.name || tip.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
                          {difficulties.find(d => d.id === tip.difficulty)?.name || tip.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {tip.tags?.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {tip.tags?.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{tip.tags.length - 2} más
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tip.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(tip)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tip.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="p-4 space-y-4">
                {tips.map((tip) => (
                  <div key={tip.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {tip.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {tip.content}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-3 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(tip)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tip.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tip.category)}`}>
                        {React.createElement(getCategoryIcon(tip.category), { className: "mr-1 w-3 h-3" })}
                        {categories.find(c => c.id === tip.category)?.name || tip.category}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tip.difficulty)}`}>
                        {difficulties.find(d => d.id === tip.difficulty)?.name || tip.difficulty}
                      </span>
                    </div>

                    {tip.tags && tip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tip.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {tip.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{tip.tags.length - 3} más
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Creado: {new Date(tip.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTipModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
        />
      )}

      {showEditModal && selectedTip && (
        <EditTipModal
          isOpen={showEditModal}
          onClose={handleModalClose}
          tip={selectedTip}
        />
      )}
    </div>
  );
};

export default TipsPage;