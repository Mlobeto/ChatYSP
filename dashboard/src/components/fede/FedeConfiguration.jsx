import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  User,
  MessageSquare,
  Brain,
  Shield,
  Clock,
  Zap
} from 'lucide-react';
import fedeApi from '../../services/fedeApi';

const FedeConfiguration = () => {
  const [config, setConfig] = useState({
    personality: {
      name: 'Fede',
      style: 'profesional_empático',
      formality: 'tuteo',
      empathy_level: 8,
      expertise_areas: [
        'ruptura_pareja',
        'coaching_ontologico',
        'metodologia_7_pasos'
      ]
    },
    behavior: {
      max_response_length: 500,
      use_examples: true,
      ask_clarifying_questions: true,
      remember_context: true,
      suggest_next_steps: true
    },
    safety: {
      filter_inappropriate: true,
      require_coaching_scope: true,
      escalate_crisis: true,
      max_conversation_length: 50
    },
    performance: {
      response_timeout: 30,
      max_knowledge_sources: 5,
      confidence_threshold: 0.7,
      fallback_enabled: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personality');
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchConfiguration();
  }, []);

  const fetchConfiguration = async () => {
    try {
      setLoading(true);
      const response = await fedeApi.getConfiguration();
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await fedeApi.updateConfiguration(config);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) return;

    try {
      setTesting(true);
      const response = await fedeApi.testMessage(testMessage);
      setTestResponse(response);
    } catch (error) {
      console.error('Error probando mensaje:', error);
      setTestResponse({
        success: false,
        error: 'Error al probar el mensaje'
      });
    } finally {
      setTesting(false);
    }
  };

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const sections = [
    { id: 'personality', label: 'Personalidad', icon: User },
    { id: 'behavior', label: 'Comportamiento', icon: MessageSquare },
    { id: 'safety', label: 'Seguridad', icon: Shield },
    { id: 'performance', label: 'Rendimiento', icon: Zap }
  ];

  const renderPersonalitySection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Personalidad</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Asistente
          </label>
          <input
            type="text"
            value={config.personality.name}
            onChange={(e) => updateConfig('personality', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estilo de Comunicación
          </label>
          <select
            value={config.personality.style}
            onChange={(e) => updateConfig('personality', 'style', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="profesional_empático">Profesional Empático</option>
            <option value="casual_amigable">Casual Amigable</option>
            <option value="formal_directivo">Formal Directivo</option>
            <option value="mentoreo_sabio">Mentoreo Sabio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nivel de Formalidad
          </label>
          <select
            value={config.personality.formality}
            onChange={(e) => updateConfig('personality', 'formality', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="tuteo">Tuteo (Tú)</option>
            <option value="usted">Formal (Usted)</option>
            <option value="adaptativo">Adaptativo</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nivel de Empatía: {config.personality.empathy_level}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.personality.empathy_level}
            onChange={(e) => updateConfig('personality', 'empathy_level', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Directo</span>
            <span>Muy Empático</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Áreas de Expertise
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { value: 'ruptura_pareja', label: 'Ruptura de Pareja' },
            { value: 'coaching_ontologico', label: 'Coaching Ontológico' },
            { value: 'metodologia_7_pasos', label: 'Metodología 7 Pasos' },
            { value: 'autoestima', label: 'Autoestima' },
            { value: 'comunicacion', label: 'Comunicación' },
            { value: 'emociones', label: 'Gestión Emocional' }
          ].map(area => (
            <label key={area.value} className="flex items-center">
              <input
                type="checkbox"
                checked={config.personality.expertise_areas.includes(area.value)}
                onChange={(e) => {
                  const newAreas = e.target.checked
                    ? [...config.personality.expertise_areas, area.value]
                    : config.personality.expertise_areas.filter(a => a !== area.value);
                  updateConfig('personality', 'expertise_areas', newAreas);
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{area.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBehaviorSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Comportamiento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Longitud máxima de respuesta (caracteres)
          </label>
          <input
            type="number"
            min="100"
            max="1000"
            value={config.behavior.max_response_length}
            onChange={(e) => updateConfig('behavior', 'max_response_length', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-4">
          {[
            { key: 'use_examples', label: 'Usar ejemplos en respuestas' },
            { key: 'ask_clarifying_questions', label: 'Hacer preguntas de clarificación' },
            { key: 'remember_context', label: 'Recordar contexto de conversación' },
            { key: 'suggest_next_steps', label: 'Sugerir próximos pasos' }
          ].map(option => (
            <label key={option.key} className="flex items-center">
              <input
                type="checkbox"
                checked={config.behavior[option.key]}
                onChange={(e) => updateConfig('behavior', option.key, e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSafetySection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Seguridad</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de mensajes por conversación
          </label>
          <input
            type="number"
            min="10"
            max="100"
            value={config.safety.max_conversation_length}
            onChange={(e) => updateConfig('safety', 'max_conversation_length', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-4">
          {[
            { key: 'filter_inappropriate', label: 'Filtrar contenido inapropiado' },
            { key: 'require_coaching_scope', label: 'Mantener alcance de coaching' },
            { key: 'escalate_crisis', label: 'Escalar situaciones de crisis' }
          ].map(option => (
            <label key={option.key} className="flex items-center">
              <input
                type="checkbox"
                checked={config.safety[option.key]}
                onChange={(e) => updateConfig('safety', option.key, e.target.checked)}
                className="mr-3"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerformanceSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Configuración de Rendimiento</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout de respuesta (segundos)
          </label>
          <input
            type="number"
            min="10"
            max="60"
            value={config.performance.response_timeout}
            onChange={(e) => updateConfig('performance', 'response_timeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de fuentes de conocimiento
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={config.performance.max_knowledge_sources}
            onChange={(e) => updateConfig('performance', 'max_knowledge_sources', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Umbral de confianza: {config.performance.confidence_threshold}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={config.performance.confidence_threshold}
            onChange={(e) => updateConfig('performance', 'confidence_threshold', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Permisivo</span>
            <span>Estricto</span>
          </div>
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.performance.fallback_enabled}
              onChange={(e) => updateConfig('performance', 'fallback_enabled', e.target.checked)}
              className="mr-3"
            />
            <span className="text-sm text-gray-700">Habilitar respuestas de fallback</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderTestSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Probar Configuración</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensaje de prueba
          </label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Escribe un mensaje para probar cómo respondería Fede con la configuración actual..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleTest}
          disabled={testing || !testMessage.trim()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {testing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4 mr-2" />
          )}
          {testing ? 'Probando...' : 'Probar Respuesta'}
        </button>

        {testResponse && (
          <div className={`p-4 rounded-lg ${testResponse.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center mb-2">
              {testResponse.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={`font-medium ${testResponse.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResponse.success ? 'Respuesta generada' : 'Error en la prueba'}
              </span>
            </div>
            <div className={`text-sm ${testResponse.success ? 'text-green-700' : 'text-red-700'}`}>
              {testResponse.success ? testResponse.message : testResponse.error}
            </div>
            {testResponse.success && testResponse.processingTime && (
              <div className="text-xs text-green-600 mt-2">
                Tiempo de respuesta: {testResponse.processingTime}ms
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'personality':
        return renderPersonalitySection();
      case 'behavior':
        return renderBehaviorSection();
      case 'safety':
        return renderSafetySection();
      case 'performance':
        return renderPerformanceSection();
      case 'test':
        return renderTestSection();
      default:
        return renderPersonalitySection();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Configuración de Fede</h2>
          <p className="text-sm text-gray-600">Personaliza el comportamiento y personalidad de tu asistente IA</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {[...sections, { id: 'test', label: 'Probar', icon: Brain }].map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`group inline-flex items-center py-2 px-4 border-b-2 font-medium text-sm ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FedeConfiguration;