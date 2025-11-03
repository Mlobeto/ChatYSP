import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  BookOpen, 
  Video, 
  FileText, 
  Trash2, 
  Edit3, 
  Eye, 
  Search,
  Plus,
  Filter,
  Download,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import fedeApi from '../../services/fedeApi';

const KnowledgeBaseManager = () => {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    contentType: 'article',
    category: 'general',
    content: '',
    metadata: {},
    tags: [],
    priority: 1
  });
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      const response = await fedeApi.getKnowledgeBase();
      setKnowledgeItems(response.data || []);
    } catch (error) {
      console.error('Error cargando knowledge base:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadForm(prev => ({
      ...prev,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      contentType: getContentTypeFromFile(file)
    }));
    setShowUploadModal(true);
  };

  const getContentTypeFromFile = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    switch (extension) {
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video';
      case 'pdf':
        return 'book';
      case 'txt':
      case 'md':
        return 'article';
      default:
        return 'article';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title);
      formData.append('contentType', uploadForm.contentType);
      formData.append('category', uploadForm.category);
      formData.append('content', uploadForm.content);
      formData.append('priority', uploadForm.priority);
      formData.append('tags', JSON.stringify(uploadForm.tags));
      formData.append('metadata', JSON.stringify(uploadForm.metadata));

      await fedeApi.uploadKnowledge(formData);
      await fetchKnowledgeBase();
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({
        title: '',
        contentType: 'article',
        category: 'general',
        content: '',
        metadata: {},
        tags: [],
        priority: 1
      });
    } catch (error) {
      console.error('Error subiendo archivo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este contenido?')) return;

    try {
      await fedeApi.deleteKnowledge(id);
      await fetchKnowledgeBase();
    } catch (error) {
      console.error('Error eliminando contenido:', error);
    }
  };

  const getTypeIcon = (contentType) => {
    switch (contentType) {
      case 'video':
        return Video;
      case 'book':
        return BookOpen;
      case 'article':
        return FileText;
      default:
        return FileText;
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600' : 'text-gray-400';
  };

  const filteredItems = knowledgeItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.contentType === filterType;
    return matchesSearch && matchesFilter;
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
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
          <p className="text-sm text-gray-600">
            {knowledgeItems.length} documentos • {knowledgeItems.filter(item => item.isActive).length} activos
          </p>
        </div>
        
        <div className="flex space-x-3">
          <label className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Subir Contenido
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt,.md,.mp4,.avi,.mov"
            />
          </label>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos los tipos</option>
          <option value="video">Videos</option>
          <option value="book">Libros</option>
          <option value="article">Artículos</option>
          <option value="methodology">Metodología</option>
        </select>
      </div>

      {/* Lista de contenido */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contenido</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Comienza subiendo contenido para entrenar a Fede'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contenido
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const TypeIcon = getTypeIcon(item.contentType);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TypeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-1">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.contentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.priority >= 8 ? 'bg-red-100 text-red-800' :
                          item.priority >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}/10
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          <span className={`text-sm ${getStatusColor(item.isActive)}`}>
                            {item.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.usageCount || 0} veces
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Subir Contenido a Knowledge Base
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Contenido</label>
                  <select
                    value={uploadForm.contentType}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, contentType: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="video">Video</option>
                    <option value="book">Libro</option>
                    <option value="article">Artículo</option>
                    <option value="methodology">Metodología</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ruptura_pareja">Ruptura de Pareja</option>
                    <option value="metodologia_7_pasos">Metodología 7 Pasos</option>
                    <option value="autoestima">Autoestima</option>
                    <option value="comunicacion">Comunicación</option>
                    <option value="emociones">Emociones</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridad (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={uploadForm.priority}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción/Contenido</label>
                  <textarea
                    value={uploadForm.content}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción o contenido del documento..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadForm.title}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Subiendo...' : 'Subir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseManager;