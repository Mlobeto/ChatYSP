import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Upload, 
  Download, 
  Play, 
  Pause, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Settings,
  Clock,
  BarChart3
} from 'lucide-react';
import fedeApi from '../../services/fedeApi';

const TrainingTools = () => {
  const [trainingData, setTrainingData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);

  const [trainingConfig, setTrainingConfig] = useState({
    epochs: 3,
    learning_rate: 0.001,
    batch_size: 4,
    validation_split: 0.2,
    fine_tune_model: 'gpt-3.5-turbo',
    use_conversation_history: true,
    include_knowledge_base: true
  });

  const [evaluationMetrics, setEvaluationMetrics] = useState(null);
  const [modelVersions, setModelVersions] = useState([]);

  useEffect(() => {
    fetchTrainingStatus();
    fetchModelVersions();
    fetchEvaluationMetrics();
  }, []);

  const fetchTrainingStatus = async () => {
    try {
      const response = await fedeApi.getTrainingStatus();
      setTrainingStatus(response.data);
      if (response.data?.progress) {
        setTrainingProgress(response.data.progress);
      }
      if (response.data?.logs) {
        setTrainingLogs(response.data.logs);
      }
    } catch (error) {
      console.error('Error obteniendo estado de entrenamiento:', error);
    }
  };

  const fetchModelVersions = async () => {
    try {
      const response = await fedeApi.getModelVersions();
      setModelVersions(response.data || []);
    } catch (error) {
      console.error('Error obteniendo versiones del modelo:', error);
    }
  };

  const fetchEvaluationMetrics = async () => {
    try {
      const response = await fedeApi.getEvaluationMetrics();
      setEvaluationMetrics(response.data);
    } catch (error) {
      console.error('Error obteniendo métricas de evaluación:', error);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadTrainingData = async () => {
    if (selectedFiles.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      await fedeApi.uploadTrainingData(formData);
      setSelectedFiles([]);
      fetchTrainingStatus();
      alert('Archivos de entrenamiento subidos exitosamente');
    } catch (error) {
      console.error('Error subiendo archivos:', error);
      alert('Error subiendo archivos de entrenamiento');
    } finally {
      setLoading(false);
    }
  };

  const startTraining = async () => {
    setLoading(true);
    try {
      await fedeApi.startTraining(trainingConfig);
      fetchTrainingStatus();
      // Iniciar polling para seguimiento del progreso
      const progressInterval = setInterval(() => {
        fetchTrainingStatus();
      }, 5000);

      // Limpiar intervalo cuando termine el entrenamiento
      setTimeout(() => {
        clearInterval(progressInterval);
      }, 300000); // 5 minutos máximo
    } catch (error) {
      console.error('Error iniciando entrenamiento:', error);
      alert('Error iniciando entrenamiento');
    } finally {
      setLoading(false);
    }
  };

  const stopTraining = async () => {
    try {
      await fedeApi.stopTraining();
      fetchTrainingStatus();
    } catch (error) {
      console.error('Error deteniendo entrenamiento:', error);
      alert('Error deteniendo entrenamiento');
    }
  };

  const deployModel = async (versionId) => {
    try {
      await fedeApi.deployModel(versionId);
      fetchModelVersions();
      alert('Modelo desplegado exitosamente');
    } catch (error) {
      console.error('Error desplegando modelo:', error);
      alert('Error desplegando modelo');
    }
  };

  const exportTrainingData = async () => {
    try {
      const response = await fedeApi.exportTrainingData();
      // Crear y descargar archivo
      const blob = new Blob([response.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fede-training-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando datos:', error);
      alert('Error exportando datos de entrenamiento');
    }
  };

  const renderUploadTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Datos de Entrenamiento</h3>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="training-files" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Seleccionar archivos de entrenamiento
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  JSON, CSV, TXT (máximo 10MB por archivo)
                </span>
              </label>
              <input
                id="training-files"
                type="file"
                multiple
                accept=".json,.csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-2">Archivos seleccionados:</h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={uploadTrainingData}
              disabled={loading}
              className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Subiendo...' : 'Subir Archivos'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrainingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Entrenamiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modelo Base
            </label>
            <select
              value={trainingConfig.fine_tune_model}
              onChange={(e) => setTrainingConfig(prev => ({...prev, fine_tune_model: e.target.value}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Épocas de Entrenamiento
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={trainingConfig.epochs}
              onChange={(e) => setTrainingConfig(prev => ({...prev, epochs: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Aprendizaje
            </label>
            <select
              value={trainingConfig.learning_rate}
              onChange={(e) => setTrainingConfig(prev => ({...prev, learning_rate: parseFloat(e.target.value)}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={0.0001}>0.0001 (Lento)</option>
              <option value={0.001}>0.001 (Normal)</option>
              <option value={0.01}>0.01 (Rápido)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño de Lote
            </label>
            <select
              value={trainingConfig.batch_size}
              onChange={(e) => setTrainingConfig(prev => ({...prev, batch_size: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
              <option value={8}>8</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={trainingConfig.use_conversation_history}
              onChange={(e) => setTrainingConfig(prev => ({...prev, use_conversation_history: e.target.checked}))}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Usar historial de conversaciones</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={trainingConfig.include_knowledge_base}
              onChange={(e) => setTrainingConfig(prev => ({...prev, include_knowledge_base: e.target.checked}))}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Incluir base de conocimiento</span>
          </label>
        </div>
      </div>

      {/* Training Status */}
      {trainingStatus && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Estado del Entrenamiento</h4>
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              trainingStatus.status === 'running' ? 'bg-green-500 animate-pulse' :
              trainingStatus.status === 'completed' ? 'bg-blue-500' :
              trainingStatus.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-medium">
              {trainingStatus.status === 'running' ? 'En progreso' :
               trainingStatus.status === 'completed' ? 'Completado' :
               trainingStatus.status === 'error' ? 'Error' : 'Inactivo'}
            </span>
          </div>
          
          {trainingStatus.status === 'running' && (
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Progreso</span>
                <span>{trainingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Training Controls */}
      <div className="flex space-x-4">
        <button
          onClick={startTraining}
          disabled={loading || trainingStatus?.status === 'running'}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <Play className="h-4 w-4 mr-2" />
          Iniciar Entrenamiento
        </button>

        {trainingStatus?.status === 'running' && (
          <button
            onClick={stopTraining}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Pause className="h-4 w-4 mr-2" />
            Detener Entrenamiento
          </button>
        )}

        <button
          onClick={exportTrainingData}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Datos
        </button>
      </div>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas de Evaluación</h3>
      
      {evaluationMetrics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">Precisión</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-2">
              {(evaluationMetrics.accuracy * 100).toFixed(1)}%
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-900">Tiempo Respuesta</span>
            </div>
            <div className="text-2xl font-bold text-green-900 mt-2">
              {evaluationMetrics.avg_response_time}ms
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-900">Satisfacción</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 mt-2">
              {(evaluationMetrics.satisfaction_score * 10).toFixed(1)}/10
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay métricas disponibles</p>
        </div>
      )}
    </div>
  );

  const renderModelsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Versiones del Modelo</h3>
      
      <div className="space-y-4">
        {modelVersions.map((version) => (
          <div key={version.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">
                  Versión {version.version}
                  {version.is_active && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activa
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Creada: {new Date(version.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Precisión: {(version.accuracy * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="flex space-x-2">
                {!version.is_active && (
                  <button
                    onClick={() => deployModel(version.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Desplegar
                  </button>
                )}
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'upload', label: 'Subir Datos', icon: Upload },
    { id: 'training', label: 'Entrenamiento', icon: Settings },
    { id: 'metrics', label: 'Métricas', icon: BarChart3 },
    { id: 'models', label: 'Modelos', icon: Brain }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Herramientas de Entrenamiento</h2>
        <p className="text-sm text-gray-600">Entrena y mejora las capacidades de Fede</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-2 px-4 border-b-2 font-medium text-sm ${
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
        <div className="p-6">
          {activeTab === 'upload' && renderUploadTab()}
          {activeTab === 'training' && renderTrainingTab()}
          {activeTab === 'metrics' && renderMetricsTab()}
          {activeTab === 'models' && renderModelsTab()}
        </div>
      </div>

      {/* Training Logs */}
      {trainingLogs.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Logs de Entrenamiento</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-60 overflow-y-auto">
            {trainingLogs.map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingTools;