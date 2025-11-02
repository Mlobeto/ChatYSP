import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGameRooms,
  createGameRoom,
  joinGameRoom,
  deleteGameRoom,
  setFilters,
  clearError,
  selectGameRooms,
  selectGameRoomsLoading,
  selectGameRoomsError,
  selectGameRoomsPagination,
  selectGameRoomsFilters,
} from '../redux/gameRoomsSlice';

const GameRoomsPage = () => {
  const dispatch = useDispatch();
  const gameRooms = useSelector(selectGameRooms);
  const loading = useSelector(selectGameRoomsLoading);
  const error = useSelector(selectGameRoomsError);
  const pagination = useSelector(selectGameRoomsPagination);
  const filters = useSelector(selectGameRoomsFilters);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGameRoom, setNewGameRoom] = useState({
    name: '',
    description: '',
    category: 'bienestar',
    difficulty: 'medium',
    maxPlayers: 6,
    questionCount: 5,
    timePerQuestion: 30000,
    isPrivate: false,
    allowChat: false,
    isGlobal: true,
  });

  useEffect(() => {
    dispatch(fetchGameRooms({ page: 1, limit: 10, ...filters }));
  }, [dispatch, filters]);

  const handleCreateGameRoom = async () => {
    try {
      await dispatch(createGameRoom(newGameRoom)).unwrap();
      setShowCreateModal(false);
      setNewGameRoom({
        name: '',
        description: '',
        category: 'bienestar',
        difficulty: 'medium',
        maxPlayers: 6,
        questionCount: 5,
        timePerQuestion: 30000,
        isPrivate: false,
        allowChat: false,
        isGlobal: true,
      });
    } catch (error) {
      console.error('Error creando GameRoom:', error);
    }
  };

  const handleJoinGameRoom = async (gameRoomId) => {
    try {
      await dispatch(joinGameRoom(gameRoomId)).unwrap();
      alert('Te has unido a la sala exitosamente');
    } catch (error) {
      console.error('Error uniéndose a GameRoom:', error);
    }
  };

  const handleDeleteGameRoom = async (gameRoomId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sala?')) {
      try {
        await dispatch(deleteGameRoom(gameRoomId)).unwrap();
      } catch (error) {
        console.error('Error eliminando GameRoom:', error);
      }
    }
  };

  const handleFilterChange = (filterType, value) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const getCategoryIcon = (category) => {
    const icons = {
      bienestar: '🧘‍♀️',
      coaching: '🌱',
      general: '🧠',
      sports: '⚽',
      science: '🔬',
      history: '📚',
    };
    return icons[category] || '🎮';
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting: 'bg-green-100 text-green-800',
      playing: 'bg-blue-100 text-blue-800',
      finished: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      waiting: 'Esperando',
      playing: 'En juego',
      finished: 'Terminado',
    };
    return texts[status] || status;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Salas de Juego Terapéuticas</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          ➕ Crear Sala
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todas</option>
              <option value="bienestar">🧘‍♀️ Bienestar</option>
              <option value="coaching">🌱 Coaching</option>
              <option value="general">🧠 General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todas</option>
              <option value="easy">Fácil</option>
              <option value="medium">Medio</option>
              <option value="hard">Difícil</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="waiting">Esperando</option>
              <option value="playing">En juego</option>
              <option value="finished">Terminado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => dispatch(fetchGameRooms({ page: 1, limit: 10, ...filters }))}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Lista de GameRooms */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Cargando salas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameRooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getCategoryIcon(room.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                        {getStatusText(room.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{room.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Categoría:</span>
                    <span className="font-medium capitalize">{room.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dificultad:</span>
                    <span className="font-medium capitalize">{room.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jugadores:</span>
                    <span className="font-medium">{room.currentPlayers}/{room.maxPlayers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preguntas:</span>
                    <span className="font-medium">{room.questionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo/pregunta:</span>
                    <span className="font-medium">{room.timePerQuestion / 1000}s</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleJoinGameRoom(room.id)}
                    disabled={room.status !== 'waiting' || room.currentPlayers >= room.maxPlayers}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    {room.status === 'waiting' ? '🚪 Unirse' : '⏳ En progreso'}
                  </button>
                  <button
                    onClick={() => handleDeleteGameRoom(room.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                  >
                    🗑️
                  </button>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Creado por: {room.creator?.username || 'Usuario'} • {new Date(room.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => dispatch(fetchGameRooms({ page: pagination.currentPage - 1, limit: 10, ...filters }))}
              disabled={!pagination.hasPrev}
              className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
            >
              ← Anterior
            </button>
            <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded">
              {pagination.currentPage} de {pagination.totalPages}
            </span>
            <button
              onClick={() => dispatch(fetchGameRooms({ page: pagination.currentPage + 1, limit: 10, ...filters }))}
              disabled={!pagination.hasNext}
              className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Modal de crear GameRoom */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear Nueva Sala Terapéutica</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={newGameRoom.name}
                  onChange={(e) => setNewGameRoom({ ...newGameRoom, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Ej: Sala de Mindfulness"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={newGameRoom.description}
                  onChange={(e) => setNewGameRoom({ ...newGameRoom, description: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                  placeholder="Describe el propósito terapéutico de la sala"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={newGameRoom.category}
                    onChange={(e) => setNewGameRoom({ ...newGameRoom, category: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="bienestar">🧘‍♀️ Bienestar</option>
                    <option value="coaching">🌱 Coaching</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                  <select
                    value={newGameRoom.difficulty}
                    onChange={(e) => setNewGameRoom({ ...newGameRoom, difficulty: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Medio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max. Jugadores</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={newGameRoom.maxPlayers}
                    onChange={(e) => setNewGameRoom({ ...newGameRoom, maxPlayers: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preguntas</label>
                  <input
                    type="number"
                    min="5"
                    max="20"
                    value={newGameRoom.questionCount}
                    onChange={(e) => setNewGameRoom({ ...newGameRoom, questionCount: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo por pregunta (segundos)</label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={newGameRoom.timePerQuestion / 1000}
                  onChange={(e) => setNewGameRoom({ ...newGameRoom, timePerQuestion: parseInt(e.target.value) * 1000 })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGameRoom}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Crear Sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoomsPage;