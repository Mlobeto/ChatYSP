import { useState, useEffect } from 'react';
import footerService from '../services/footerService';

const FooterManagement = () => {
  const [footers, setFooters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingFooter, setEditingFooter] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Tipos de footer con sus íconos y colores
  const footerTypes = {
    video_relacionado: { icon: '🎥', label: 'Video Relacionado', color: 'bg-purple-100 text-purple-800' },
    app_descarga: { icon: '📱', label: 'App Descarga', color: 'bg-blue-100 text-blue-800' },
    playlists_youtube: { icon: '📺', label: 'Playlists YouTube', color: 'bg-red-100 text-red-800' },
    membresia_youtube: { icon: '⭐', label: 'Membresía YouTube', color: 'bg-yellow-100 text-yellow-800' },
    llamada_coaching: { icon: '📞', label: 'Llamada Coaching', color: 'bg-green-100 text-green-800' },
    reflexion: { icon: '💭', label: 'Reflexión', color: 'bg-indigo-100 text-indigo-800' },
    libro: { icon: '📚', label: 'Libro', color: 'bg-pink-100 text-pink-800' },
    comunidad: { icon: '🌟', label: 'Comunidad', color: 'bg-orange-100 text-orange-800' },
  };

  useEffect(() => {
    loadFooters();
    loadStats();
  }, []);

  const loadFooters = async () => {
    try {
      setLoading(true);
      const response = await footerService.getAll();
      setFooters(response.footers || []);
      setError(null);
    } catch (err) {
      setError('Error cargando footers');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await footerService.getStats();
      setStats(response);
    } catch (err) {
      // Ignorar error en stats
    }
  };

  const handleEdit = (footer) => {
    setEditingFooter(footer);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingFooter(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este footer?')) return;

    try {
      await footerService.delete(id);
      loadFooters();
      loadStats();
    } catch (err) {
      alert('Error eliminando footer');
    }
  };

  const handleToggleActive = async (footer) => {
    try {
      await footerService.update(footer.id, {
        isActive: !footer.isActive,
      });
      loadFooters();
      loadStats();
    } catch (err) {
      alert('Error actualizando footer');
    }
  };

  const handleSaveFooter = async (footerData) => {
    try {
      if (editingFooter) {
        await footerService.update(editingFooter.id, footerData);
      } else {
        await footerService.create(footerData);
      }
      setShowForm(false);
      setEditingFooter(null);
      loadFooters();
      loadStats();
    } catch (err) {
      alert(err.response?.data?.message || 'Error guardando footer');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Footers</h1>
        <p className="text-gray-600">
          Gestiona los footers que aparecen aleatoriamente en los tips diarios
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleCreate}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          ➕ Crear Nuevo Footer
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          📊 {showStats ? 'Ocultar' : 'Ver'} Estadísticas
        </button>
      </div>

      {/* Estadísticas */}
      {showStats && stats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📊 Estadísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Footers</div>
              <div className="text-2xl font-bold text-blue-600">{stats.stats?.length || 0}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Activos</div>
              <div className="text-2xl font-bold text-green-600">{stats.summary?.activeFooters || 0}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Probabilidad Total</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.summary?.totalProbability || 0}%</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Usos Totales</div>
              <div className="text-2xl font-bold text-purple-600">{stats.summary?.totalUsage || 0}</div>
            </div>
          </div>

          {/* Top 5 más usados */}
          <div>
            <h3 className="font-semibold mb-2">Top 5 Más Usados</h3>
            <div className="space-y-2">
              {stats.stats?.slice(0, 5).map((stat) => (
                <div key={stat.name} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="font-medium">{stat.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{stat.usageCount} usos</span>
                    <span className="text-sm text-purple-600">{stat.probability}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Footers */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Probabilidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {footers.map((footer) => {
                const typeInfo = footerTypes[footer.type] || { icon: '📝', label: footer.type, color: 'bg-gray-100' };
                return (
                  <tr key={footer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
                        <span className="mr-2">{typeInfo.icon}</span>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate" title={footer.template}>
                        {footer.template}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-purple-600">{footer.probability}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{footer.usageCount || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(footer)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          footer.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {footer.isActive ? '✓ Activo' : '✗ Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(footer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(footer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {footers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay footers disponibles. Crea uno nuevo para empezar.
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      {showForm && (
        <FooterForm
          footer={editingFooter}
          footerTypes={footerTypes}
          onSave={handleSaveFooter}
          onCancel={() => {
            setShowForm(false);
            setEditingFooter(null);
          }}
        />
      )}
    </div>
  );
};

// Componente de Formulario
const FooterForm = ({ footer, footerTypes, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    type: footer?.type || 'reflexion',
    name: footer?.name || '',
    template: footer?.template || '',
    urls: footer?.urls || {},
    probability: footer?.probability || 10,
    isActive: footer?.isActive !== undefined ? footer.isActive : true,
    priority: footer?.priority || 0,
    notes: footer?.notes || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      // Error handled in parent
    } finally {
      setSaving(false);
    }
  };

  const handleUrlChange = (key, value) => {
    setFormData({
      ...formData,
      urls: {
        ...formData.urls,
        [key]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {footer ? 'Editar Footer' : 'Crear Nuevo Footer'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Footer
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                {Object.entries(footerTypes).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.icon} {value.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Descriptivo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Video relacionado #1"
                required
              />
            </div>

            {/* Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template del Footer
              </label>
              <textarea
                value={formData.template}
                onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                rows={4}
                placeholder="Usa {frase} para la frase clave, {video_url} y {video_title} para videos..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Placeholders disponibles: {'{frase}'}, {'{video_url}'}, {'{video_title}'}
              </p>
            </div>

            {/* URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URLs (opcional)
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="App iOS"
                  value={formData.urls.app_ios || ''}
                  onChange={(e) => handleUrlChange('app_ios', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <input
                  type="url"
                  placeholder="App Android"
                  value={formData.urls.app_android || ''}
                  onChange={(e) => handleUrlChange('app_android', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
                <input
                  type="url"
                  placeholder="Playlist/Membresía URL"
                  value={formData.urls.main_url || ''}
                  onChange={(e) => handleUrlChange('main_url', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>

            {/* Probabilidad y Prioridad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Probabilidad (0-100%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Estado Activo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Footer activo (se puede usar en tips)
              </label>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                rows={2}
                placeholder="Notas internas sobre cuándo usar este footer..."
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? 'Guardando...' : footer ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FooterManagement;
