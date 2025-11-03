import React, { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  ChatBubbleLeftIcon, 
  PuzzlePieceIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { gameRoomsApi } from '../services/api';

const RoomStatsModal = ({ isOpen, onClose, room, roomType }) => {
  const [stats, setStats] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && room && roomType === 'game') {
      loadGameRoomStats();
    }
  }, [isOpen, room, roomType]);

  const loadGameRoomStats = async () => {
    try {
      setLoading(true);
      const [statsData, membersData] = await Promise.all([
        gameRoomsApi.getStats(room.id),
        gameRoomsApi.getMembers(room.id)
      ]);
      setStats(statsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading game room stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {roomType === 'game' ? (
                <PuzzlePieceIcon className="w-8 h-8 text-purple-500" />
              ) : (
                <ChatBubbleLeftIcon className="w-8 h-8 text-blue-500" />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{room.name}</h3>
                <p className="text-sm text-gray-500">Estadísticas de la sala</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UsersIcon className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Miembros</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {members.length}/{room.maxUsers}
                      </p>
                    </div>
                  </div>
                </div>

                {roomType === 'game' && stats && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <TrophyIcon className="w-8 h-8 text-green-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-900">Partidas</p>
                          <p className="text-2xl font-bold text-green-600">
                            {stats.totalGames || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <ClockIcon className="w-8 h-8 text-purple-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-900">Tiempo promedio</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {stats.averageGameTime ? `${Math.round(stats.averageGameTime / 60000)}m` : '0m'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Detalles de la sala */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Detalles de la sala</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium capitalize">{room.gameType || room.roomType}</p>
                  </div>
                  {roomType === 'game' && (
                    <>
                      <div>
                        <span className="text-gray-500">Categoría:</span>
                        <p className="font-medium capitalize">{room.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Dificultad:</span>
                        <p className="font-medium capitalize">{room.difficulty}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Preguntas:</span>
                        <p className="font-medium">{room.questionCount}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-gray-500">País:</span>
                    <p className="font-medium">{room.country}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <p className="font-medium capitalize">
                      {room.isPrivate ? 'Privada' : 'Pública'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de miembros */}
              {members.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Miembros ({members.length})
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {members.map((member, index) => (
                        <div key={member.id || index} className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {member.username ? member.username.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {member.username || member.name || 'Usuario'}
                              </p>
                              {member.email && (
                                <p className="text-xs text-gray-500">{member.email}</p>
                              )}
                            </div>
                          </div>
                          {member.isHost && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                              Host
                            </span>
                          )}
                          {member.score !== undefined && (
                            <span className="text-sm text-gray-500">
                              {member.score} pts
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Estadísticas adicionales para game rooms */}
              {roomType === 'game' && stats && stats.recentGames && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Partidas recientes</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {stats.recentGames.slice(0, 5).map((game, index) => (
                        <div key={game.id || index} className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Partida #{game.gameNumber || index + 1}
                            </p>
                            <p className="text-xs text-gray-500">
                              {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : 'Fecha no disponible'}
                            </p>
                          </div>
                          <div className="text-right">
                            {game.winner && (
                              <p className="text-sm font-medium text-green-600">
                                Ganador: {game.winner}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {game.duration ? `${Math.round(game.duration / 60000)}m` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomStatsModal;