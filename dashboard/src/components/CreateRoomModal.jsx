import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CreateRoomModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  roomType = 'chat', // 'chat' o 'game'
  editingRoom = null 
}) => {
  const [formData, setFormData] = useState({
    name: editingRoom?.name || '',
    description: editingRoom?.description || '',
    roomType: editingRoom?.roomType || (roomType === 'chat' ? 'public' : 'trivia'),
    maxUsers: editingRoom?.maxUsers || (roomType === 'chat' ? 50 : 8),
    password: '',
    isPrivate: editingRoom?.isPrivate || false,
    country: editingRoom?.country || 'AR',
    // Campos específicos para game rooms
    gameType: editingRoom?.gameType || 'trivia',
    category: editingRoom?.category || 'general',
    difficulty: editingRoom?.difficulty || 'medium',
    questionCount: editingRoom?.questionCount || 10,
    timePerQuestion: editingRoom?.timePerQuestion || 30000,
    allowChat: editingRoom?.allowChat || false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filtrar campos según el tipo de sala
      let dataToSubmit;
      
      if (roomType === 'chat') {
        // Campos para Room (chat rooms)
        dataToSubmit = {
          name: formData.name,
          description: formData.description,
          roomType: formData.roomType,
          maxUsers: parseInt(formData.maxUsers),
          isPrivate: formData.isPrivate,
          country: formData.country,
        };
        // Solo incluir password si la sala es privada
        if (formData.isPrivate && formData.password) {
          dataToSubmit.password = formData.password;
        }
      } else {
        // Campos para GameRoom
        dataToSubmit = {
          name: formData.name,
          description: formData.description,
          gameType: formData.gameType,
          category: formData.category,
          difficulty: formData.difficulty,
          maxPlayers: parseInt(formData.maxUsers), // Renombrar a maxPlayers
          questionCount: parseInt(formData.questionCount),
          timePerQuestion: parseInt(formData.timePerQuestion),
          isPrivate: formData.isPrivate,
          allowChat: formData.allowChat,
        };
      }

      await onSubmit(dataToSubmit);
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        roomType: roomType === 'chat' ? 'public' : 'trivia',
        maxUsers: roomType === 'chat' ? 50 : 8,
        password: '',
        isPrivate: false,
        country: 'AR',
        gameType: 'trivia',
        category: 'general',
        difficulty: 'medium',
        questionCount: 10,
        timePerQuestion: 30000,
        allowChat: false,
      });
    } catch (error) {
      console.error('Error submitting room:', error);
      alert(`Error: ${error.response?.data?.message || error.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingRoom ? 'Editar' : 'Crear'} {roomType === 'chat' ? 'Sala de Chat' : 'Sala de Juego'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre de la sala *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder={`Nombre de la ${roomType === 'chat' ? 'sala' : 'sala de juego'}`}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Descripción opcional de la sala"
              />
            </div>

            {/* Tipo de sala / juego */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {roomType === 'chat' ? 'Tipo de sala' : 'Tipo de juego'}
              </label>
              <select
                name={roomType === 'chat' ? 'roomType' : 'gameType'}
                value={roomType === 'chat' ? formData.roomType : formData.gameType}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {roomType === 'chat' ? (
                  <>
                    <option value="public">Pública</option>
                    <option value="private">Privada</option>
                    <option value="game">Juego</option>
                  </>
                ) : (
                  <>
                    <option value="trivia">Trivia</option>
                    <option value="quiz">Quiz</option>
                    <option value="challenge">Desafío</option>
                  </>
                )}
              </select>
            </div>

            {/* Campos específicos para game rooms */}
            {roomType === 'game' && (
              <>
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="general">General</option>
                    <option value="coaching">Coaching</option>
                    <option value="bienestar">Bienestar</option>
                    <option value="tecnologia">Tecnología</option>
                  </select>
                </div>

                {/* Dificultad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Dificultad
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Medio</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>

                {/* Número de preguntas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de preguntas
                  </label>
                  <input
                    type="number"
                    name="questionCount"
                    value={formData.questionCount}
                    onChange={handleChange}
                    min="5"
                    max="50"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {/* Tiempo por pregunta */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tiempo por pregunta (segundos)
                  </label>
                  <input
                    type="number"
                    name="timePerQuestion"
                    value={formData.timePerQuestion / 1000}
                    onChange={(e) => handleChange({
                      target: {
                        name: 'timePerQuestion',
                        value: parseInt(e.target.value) * 1000
                      }
                    })}
                    min="10"
                    max="300"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>

                {/* Permitir chat */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="allowChat"
                    checked={formData.allowChat}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Permitir chat durante el juego
                  </label>
                </div>
              </>
            )}

            {/* Máximo de usuarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Máximo de {roomType === 'chat' ? 'usuarios' : 'jugadores'}
              </label>
              <input
                type="number"
                name="maxUsers"
                value={formData.maxUsers}
                onChange={handleChange}
                min="2"
                max={roomType === 'chat' ? "500" : "20"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                País
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="AR">Argentina</option>
                <option value="PE">Perú</option>
                <option value="MX">México</option>
                <option value="CO">Colombia</option>
                <option value="ES">España</option>
              </select>
            </div>

            {/* Sala privada */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPrivate"
                checked={formData.isPrivate}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Sala privada
              </label>
            </div>

            {/* Contraseña (solo si es privada) */}
            {formData.isPrivate && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Contraseña para la sala privada"
                />
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : (editingRoom ? 'Actualizar' : 'Crear')} Sala
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;