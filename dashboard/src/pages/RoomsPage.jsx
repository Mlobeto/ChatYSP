import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ChatBubbleLeftIcon, 
  PuzzlePieceIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { roomsApi, gameRoomsApi } from '../services/api';
import CreateRoomModal from '../components/CreateRoomModal';
import RoomStatsModal from '../components/RoomStatsModal';

const RoomsPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatRooms, setChatRooms] = useState([]);
  const [gameRooms, setGameRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Cargar salas de chat
  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await roomsApi.getAll();
      setChatRooms(Array.isArray(rooms) ? rooms : []);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar salas de juego
  const loadGameRooms = async () => {
    try {
      setLoading(true);
      const rooms = await gameRoomsApi.getAll();
      setGameRooms(Array.isArray(rooms) ? rooms : []);
    } catch (error) {
      console.error('Error loading game rooms:', error);
      setGameRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadChatRooms();
    loadGameRooms();
  }, []);

  // Crear sala
  const handleCreateRoom = async (formData) => {
    try {
      if (activeTab === 'chat') {
        await roomsApi.create(formData);
        await loadChatRooms();
      } else {
        await gameRoomsApi.create(formData);
        await loadGameRooms();
      }
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // Editar sala
  const handleEditRoom = async (formData) => {
    try {
      if (activeTab === 'chat') {
        await roomsApi.update(editingRoom.id, formData);
        await loadChatRooms();
      } else {
        await gameRoomsApi.update(editingRoom.id, formData);
        await loadGameRooms();
      }
      setEditingRoom(null);
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  };

  // Eliminar sala
  const handleDeleteRoom = async (roomId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sala?')) return;

    try {
      if (activeTab === 'chat') {
        await roomsApi.delete(roomId);
        await loadChatRooms();
      } else {
        await gameRoomsApi.delete(roomId);
        await loadGameRooms();
      }
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

          // Ver estadísticas de sala
  const handleViewStats = (room) => {
    setSelectedRoom(room);
    setShowStatsModal(true);
  };

  // Unirse a sala
  const handleJoinRoom = async (roomId) => {
    try {
      if (activeTab === 'chat') {
        await roomsApi.join(roomId);
      } else {
        await gameRoomsApi.join(roomId);
      }
      // Recargar datos
      if (activeTab === 'chat') {
        await loadChatRooms();
      } else {
        await loadGameRooms();
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  // Componente para mostrar una sala
  const RoomCard = ({ room, type }) => {
    const isGameRoom = type === 'game';
    
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isGameRoom ? (
              <PuzzlePieceIcon className="w-5 h-5 text-purple-500" />
            ) : (
              <ChatBubbleLeftIcon className="w-5 h-5 text-blue-500" />
            )}
            <h3 className="font-semibold text-gray-900">{room.name}</h3>
            {room.isPrivate ? (
              <LockClosedIcon className="w-4 h-4 text-gray-400" />
            ) : (
              <GlobeAltIcon className="w-4 h-4 text-green-500" />
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleViewStats(room)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="Ver estadísticas"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setEditingRoom(room);
                setShowCreateModal(true);
              }}
              className="p-1 text-gray-600 hover:text-gray-800"
              title="Editar sala"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteRoom(room.id)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Eliminar sala"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {room.description && (
          <p className="text-gray-600 text-sm mb-3">{room.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <UsersIcon className="w-4 h-4" />
              <span>
                {room.currentUsers || room.memberCount || 0}/{room.maxUsers}
              </span>
            </span>
            
            {isGameRoom && (
              <>
                <span className="capitalize">{room.category}</span>
                <span className="capitalize">{room.difficulty}</span>
                <span>{room.questionCount} preguntas</span>
              </>
            )}
          </div>
          
          <span className="text-xs text-gray-400">
            {room.country}
          </span>
        </div>

        {isGameRoom && room.status && (
          <div className="mt-2">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              room.status === 'waiting' 
                ? 'bg-yellow-100 text-yellow-800'
                : room.status === 'playing'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {room.status === 'waiting' ? 'Esperando' : 
               room.status === 'playing' ? 'En juego' : 
               room.status}
            </span>
          </div>
        )}
      </div>
    );
  };

  const currentRooms = activeTab === 'chat' ? chatRooms : gameRooms;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Salas</h1>
          <p className="text-gray-600">
            Administra salas de chat y salas de juego
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingRoom(null);
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Crear {activeTab === 'chat' ? 'Sala de Chat' : 'Sala de Juego'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'chat'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>Salas de Chat ({chatRooms.length})</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('game')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'game'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <PuzzlePieceIcon className="w-4 h-4" />
              <span>Salas de Juego ({gameRooms.length})</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Rooms Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(!currentRooms || !Array.isArray(currentRooms) || currentRooms.length === 0) ? (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                {activeTab === 'chat' ? (
                  <ChatBubbleLeftIcon className="w-full h-full" />
                ) : (
                  <PuzzlePieceIcon className="w-full h-full" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay {activeTab === 'chat' ? 'salas de chat' : 'salas de juego'}
              </h3>
              <p className="text-gray-500 mb-4">
                Crea la primera {activeTab === 'chat' ? 'sala de chat' : 'sala de juego'} para comenzar
              </p>
              <button
                onClick={() => {
                  setEditingRoom(null);
                  setShowCreateModal(true);
                }}
                className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Crear {activeTab === 'chat' ? 'Sala de Chat' : 'Sala de Juego'}</span>
              </button>
            </div>
          ) : (
            currentRooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                type={activeTab}
              />
            ))
          )}
        </div>
      )}

      {/* Create/Edit Room Modal */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingRoom(null);
        }}
        onSubmit={editingRoom ? handleEditRoom : handleCreateRoom}
        roomType={activeTab}
        editingRoom={editingRoom}
      />

      {/* Room Stats Modal */}
      <RoomStatsModal
        isOpen={showStatsModal}
        onClose={() => {
          setShowStatsModal(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
        roomType={activeTab}
      />
    </div>
  );
};

export default RoomsPage;