import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchGameRooms,
  createGameRoom,
  joinGameRoom,
  fetchGameRoomInvitations,
  selectGameRooms,
  selectGameLoading,
  selectGameError,
  selectGameRoomInvitations,
  selectTherapeuticCategories,
  clearError,
} from '../redux/gameSlice';

const GameRoomsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const gameRooms = useSelector(selectGameRooms);
  const loading = useSelector(selectGameLoading);
  const error = useSelector(selectGameError);
  const invitations = useSelector(selectGameRoomInvitations);
  const therapeuticCategories = useSelector(selectTherapeuticCategories);

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
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
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchGameRooms()).unwrap(),
        dispatch(fetchGameRoomInvitations()).unwrap(),
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleJoinGameRoom = async (gameRoomId, roomName) => {
    try {
      await dispatch(joinGameRoom(gameRoomId)).unwrap();
      Alert.alert(
        'Éxito',
        `Te has unido a "${roomName}" exitosamente`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('GameRoom', { gameRoomId }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error || 'No se pudo unir a la sala');
    }
  };

  const handleCreateGameRoom = async () => {
    if (!newGameRoom.name.trim()) {
      Alert.alert('Error', 'El nombre de la sala es obligatorio');
      return;
    }

    try {
      const result = await dispatch(createGameRoom(newGameRoom)).unwrap();
      setShowCreateModal(false);
      resetNewGameRoom();
      Alert.alert(
        'Sala Creada',
        `La sala "${newGameRoom.name}" ha sido creada exitosamente`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('GameRoom', { gameRoomId: result.gameRoom.id }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error || 'No se pudo crear la sala');
    }
  };

  const resetNewGameRoom = () => {
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
  };

  const getCategoryIcon = (category) => {
    const icons = {
      bienestar: '🧘‍♀️',
      coaching: '🌱',
      general: '🧠',
    };
    return icons[category] || '🎮';
  };

  const getStatusColor = (status) => {
    const colors = {
      waiting: '#10B981', // green
      playing: '#3B82F6', // blue
      finished: '#6B7280', // gray
    };
    return colors[status] || '#6B7280';
  };

  const getStatusText = (status) => {
    const texts = {
      waiting: 'Esperando',
      playing: 'En juego',
      finished: 'Terminado',
    };
    return texts[status] || status;
  };

  const filteredGameRooms = gameRooms.filter(room => 
    selectedCategory === 'all' || room.category === selectedCategory
  );

  const renderGameRoom = ({ item: room }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.roomTitleContainer}>
          <Text style={styles.categoryIcon}>{getCategoryIcon(room.category)}</Text>
          <View style={styles.roomInfo}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(room.status) }]}>
              <Text style={styles.statusText}>{getStatusText(room.status)}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.roomDescription}>{room.description}</Text>

      <View style={styles.roomDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Categoría:</Text>
          <Text style={styles.detailValue}>{room.category}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dificultad:</Text>
          <Text style={styles.detailValue}>{room.difficulty}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Jugadores:</Text>
          <Text style={styles.detailValue}>{room.currentPlayers}/{room.maxPlayers}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Preguntas:</Text>
          <Text style={styles.detailValue}>{room.questionCount}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.joinButton,
          (room.status !== 'waiting' || room.currentPlayers >= room.maxPlayers) && styles.disabledButton
        ]}
        onPress={() => handleJoinGameRoom(room.id, room.name)}
        disabled={room.status !== 'waiting' || room.currentPlayers >= room.maxPlayers}
      >
        <Text style={styles.joinButtonText}>
          {room.status === 'waiting' ? '🚪 Unirse a la Sala' : '⏳ En Progreso'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.roomMeta}>
        Creado por: {room.creator?.username || 'Usuario'} • {new Date(room.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const renderCategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
      <TouchableOpacity
        style={[styles.categoryButton, selectedCategory === 'all' && styles.activeCategoryButton]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text style={[styles.categoryButtonText, selectedCategory === 'all' && styles.activeCategoryButtonText]}>
          Todas
        </Text>
      </TouchableOpacity>
      
      {therapeuticCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryButton, selectedCategory === category.id && styles.activeCategoryButton]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[styles.categoryButtonText, selectedCategory === category.id && styles.activeCategoryButtonText]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Salas Terapéuticas</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Invitaciones pendientes */}
      {invitations.length > 0 && (
        <View style={styles.invitationsContainer}>
          <Text style={styles.invitationsTitle}>🎯 Invitaciones Pendientes ({invitations.length})</Text>
        </View>
      )}

      {/* Filtros de categoría */}
      {renderCategoryFilter()}

      {/* Lista de GameRooms */}
      <FlatList
        data={filteredGameRooms}
        renderItem={renderGameRoom}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de crear GameRoom */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Sala Terapéutica</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de la Sala</Text>
              <TextInput
                style={styles.textInput}
                value={newGameRoom.name}
                onChangeText={(text) => setNewGameRoom({ ...newGameRoom, name: text })}
                placeholder="Ej: Sala de Mindfulness"
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newGameRoom.description}
                onChangeText={(text) => setNewGameRoom({ ...newGameRoom, description: text })}
                placeholder="Describe el propósito terapéutico de la sala"
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Categoría</Text>
                <View style={styles.pickerContainer}>
                  {therapeuticCategories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.pickerOption,
                        newGameRoom.category === category.id && styles.selectedPickerOption
                      ]}
                      onPress={() => setNewGameRoom({ ...newGameRoom, category: category.id })}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text style={styles.pickerOptionText}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Dificultad</Text>
                <View style={styles.pickerContainer}>
                  {['easy', 'medium', 'hard'].map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.pickerOption,
                        newGameRoom.difficulty === difficulty && styles.selectedPickerOption
                      ]}
                      onPress={() => setNewGameRoom({ ...newGameRoom, difficulty })}
                    >
                      <Text style={styles.pickerOptionText}>
                        {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Max. Jugadores</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGameRoom.maxPlayers.toString()}
                  onChangeText={(text) => setNewGameRoom({ ...newGameRoom, maxPlayers: parseInt(text) || 6 })}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Preguntas</Text>
                <TextInput
                  style={styles.textInput}
                  value={newGameRoom.questionCount.toString()}
                  onChangeText={(text) => setNewGameRoom({ ...newGameRoom, questionCount: parseInt(text) || 5 })}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateGameRoom}
            >
              <Text style={styles.submitButtonText}>Crear Sala</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  invitationsContainer: {
    backgroundColor: '#fef3c7',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  invitationsTitle: {
    color: '#92400e',
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeCategoryButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  categoryButtonText: {
    color: '#64748b',
    fontWeight: '500',
    marginLeft: 4,
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  categoryIcon: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomHeader: {
    marginBottom: 12,
  },
  roomTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  roomDescription: {
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  roomDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    color: '#64748b',
    fontSize: 14,
  },
  detailValue: {
    color: '#1a202c',
    fontSize: 14,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  roomMeta: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedPickerOption: {
    backgroundColor: '#eff6ff',
  },
  pickerOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default GameRoomsScreen;