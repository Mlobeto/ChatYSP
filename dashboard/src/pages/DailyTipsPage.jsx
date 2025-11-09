import { useState, useEffect, useRef } from 'react';
import { 
  FaWhatsapp, 
  FaSync, 
  FaPaperPlane, 
  FaRobot,
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaHistory,
  FaUpload,
  FaFileAlt,
  FaCopy
} from 'react-icons/fa';
import { 
  generateDailyTip,
  getTodayTip,
  regenerateTodayTip,
  resendTodayTip,
  getTipsHistory,
  getTipsStats,
  checkDailyTipsHealth,
  uploadMultipleTips
} from '../services/dailyTipApi';

const DailyTipsPage = () => {
  const [todayTip, setTodayTip] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // today, history, stats, upload
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [tipData, historyData, statsData, healthData] = await Promise.all([
        getTodayTip().catch(() => null),
        getTipsHistory(30).catch(() => []),
        getTipsStats().catch(() => null),
        checkDailyTipsHealth().catch(() => null),
      ]);
      
      setTodayTip(tipData?.data || tipData);
      setHistory(historyData?.data || historyData);
      setStats(statsData?.data || statsData);
      setHealth(healthData?.data || healthData);
    } catch {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTip = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await generateDailyTip();
      setTodayTip(result.data?.tipLog || result.tipLog);
      setSuccess('✅ Tip generado y enviado exitosamente!');
      await loadInitialData(); // Refresh all data
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar el tip');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTip = async () => {
    if (!window.confirm('¿Estás seguro de regenerar el tip de hoy? Se generará uno nuevo con IA.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await regenerateTodayTip();
      setTodayTip(result.data?.tipLog || result.tipLog);
      setSuccess('✅ Tip regenerado exitosamente!');
      await loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al regenerar el tip');
    } finally {
      setLoading(false);
    }
  };

  const handleResendTip = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await resendTodayTip();
      setSuccess('✅ Tip reenviado por email!');
      await loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al reenviar el tip');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text, platform) => {
    if (window.navigator && window.navigator.clipboard) {
      window.navigator.clipboard.writeText(text).then(() => {
        setSuccess(`✅ Formato de ${platform} copiado al portapapeles!`);
        setTimeout(() => setSuccess(null), 3000);
      }).catch(() => {
        setError('Error al copiar al portapapeles');
      });
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress({
      total: files.length,
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors: 0
    });

    try {
      const result = await uploadMultipleTips(files);
      
      setUploadProgress({
        total: result.data.total,
        processed: result.data.total,
        inserted: result.data.inserted,
        skipped: result.data.skipped,
        errors: result.data.errors
      });

      setSuccess(
        `✅ Carga completada: ${result.data.inserted} tips creados, ${result.data.skipped} omitidos, ${result.data.errors} errores`
      );

      // Recargar datos
      await loadInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los archivos');
      setUploadProgress(null);
    } finally {
      setLoading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'No enviado';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <FaWhatsapp className="text-green-500" />
          Tips Diarios Automáticos
        </h1>
        <p className="text-gray-600">
          Gestiona los tips diarios que se envían automáticamente por WhatsApp de lunes a viernes
        </p>
      </div>

      {/* Health Status */}
      {health && (
        <div className={`mb-6 p-4 rounded-lg ${health.healthy ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-3">
            {health.healthy ? (
              <FaCheckCircle className="text-green-500 text-xl" />
            ) : (
              <FaExclamationCircle className="text-yellow-500 text-xl" />
            )}
            <div>
              <p className="font-semibold">
                {health.healthy ? 'Sistema funcionando correctamente' : 'Sistema listo (notificaciones por email)'}
              </p>
              <p className="text-sm text-gray-600">
                Scheduler: {health.scheduler?.isRunning ? '✅ Activo' : '❌ Inactivo'} | 
                Email: {health.email?.configured ? '✅ Configurado' : '⚠️ No configurado'} |
                Base de datos: {health.database === 'ready' ? '✅ OK' : '❌ Error'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                💡 Los tips se generan automáticamente y se envían a tu email. Cópialos y pégalos en WhatsApp/Telegram.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('today')}
            className={`pb-2 px-4 font-semibold ${
              activeTab === 'today'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaCalendarAlt className="inline mr-2" />
            Tip de Hoy
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2 px-4 font-semibold ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaUpload className="inline mr-2" />
            Cargar Tips
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 font-semibold ${
              activeTab === 'history'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaHistory className="inline mr-2" />
            Historial
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 font-semibold ${
              activeTab === 'stats'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaChartLine className="inline mr-2" />
            Estadísticas
          </button>
        </div>
      </div>

      {/* Today Tab */}
      {activeTab === 'today' && (
        <div>
          {/* Loading Overlay */}
          {loading && (
            <div className="mb-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
              <div className="flex items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-blue-700">
                    🤖 Generando tip con Inteligencia Artificial...
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Esto puede tomar unos segundos. Por favor espera.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-6 flex gap-3 flex-wrap">
            <button
              onClick={handleGenerateTip}
              disabled={loading || todayTip}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generando...
                </>
              ) : (
                <>
                  <FaRobot />
                  Generar Tip de Hoy
                </>
              )}
            </button>
            
            {todayTip && (
              <>
                <button
                  onClick={handleRegenerateTip}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Regenerando...
                    </>
                  ) : (
                    <>
                      <FaSync />
                      Regenerar
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleResendTip}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  <FaPaperPlane />
                  Reenviar por WhatsApp
                </button>
              </>
            )}
          </div>

          {/* Today's Tip Card */}
          {todayTip ? (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{todayTip.title}</h2>
                <p className="text-sm text-gray-500">{formatDate(todayTip.date)}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* WhatsApp Format */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FaWhatsapp className="text-green-500" />
                      Formato WhatsApp
                    </h3>
                    <button
                      onClick={() => handleCopyToClipboard(todayTip.whatsappFormat, 'WhatsApp')}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FaCopy /> Copiar
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm font-mono border border-gray-200">
                    {todayTip.whatsappFormat}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <FaClock className="text-gray-400" />
                    <span className="text-gray-600">
                      Email enviado: {formatTime(todayTip.whatsappSentAt)}
                    </span>
                    {todayTip.sentToWhatsApp && (
                      <FaCheckCircle className="text-green-500" />
                    )}
                  </div>
                </div>

                {/* Telegram Format */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FaPaperPlane className="text-blue-500" />
                      Formato Telegram
                    </h3>
                    <button
                      onClick={() => handleCopyToClipboard(todayTip.telegramFormat, 'Telegram')}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <FaCopy /> Copiar
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm font-mono border border-gray-200">
                    {todayTip.telegramFormat}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm font-mono border border-gray-200">
                    {todayTip.telegramFormat}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <FaClock className="text-gray-400" />
                    <span className="text-gray-600">
                      Email enviado: {formatTime(todayTip.telegramSentAt)}
                    </span>
                    {todayTip.sentToTelegram && (
                      <FaCheckCircle className="text-blue-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Generated Content */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-2">Contenido Generado</h3>
                <div className="bg-blue-50 p-4 rounded-lg text-gray-700">
                  {todayTip.generatedContent}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Basado en Tip ID: {todayTip.baseTipId}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FaRobot className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hay tip generado para hoy</p>
              <p className="text-gray-400 text-sm">
                Haz click en &ldquo;Generar Tip de Hoy&rdquo; para crear uno nuevo
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUpload className="text-blue-500" />
              Carga Masiva de Tips
            </h2>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Sube múltiples archivos TXT con tips. Los archivos deben tener el formato:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-mono text-sm text-gray-700">
                  Tip🦁del dia: [Título del tip]<br />
                  Contenido del tip aquí...
                </p>
                <p className="text-sm text-gray-500 mt-2">ó</p>
                <p className="font-mono text-sm text-gray-700">
                  Historia🦁del dia: [Título de la historia]<br />
                  Contenido de la historia aquí...
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-700 text-sm">
                  <strong>Nota:</strong> Puedes seleccionar hasta 200 archivos .txt a la vez. Los tips duplicados serán omitidos automáticamente.
                </p>
              </div>
            </div>

            {/* File Input */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">
                Seleccionar archivos TXT
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                multiple
                onChange={handleFileUpload}
                disabled={loading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Progreso de carga:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <FaFileAlt className="text-gray-400 text-2xl mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-800">{uploadProgress.total}</p>
                    <p className="text-sm text-gray-600">Total archivos</p>
                  </div>
                  <div className="text-center">
                    <FaCheckCircle className="text-green-500 text-2xl mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-600">{uploadProgress.inserted}</p>
                    <p className="text-sm text-gray-600">Tips creados</p>
                  </div>
                  <div className="text-center">
                    <FaExclamationCircle className="text-yellow-500 text-2xl mx-auto mb-1" />
                    <p className="text-2xl font-bold text-yellow-600">{uploadProgress.skipped}</p>
                    <p className="text-sm text-gray-600">Omitidos</p>
                  </div>
                  <div className="text-center">
                    <FaExclamationCircle className="text-red-500 text-2xl mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{uploadProgress.errors}</p>
                    <p className="text-sm text-gray-600">Errores</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!uploadProgress && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">Arrastra archivos aquí o haz click en &ldquo;Seleccionar archivos&rdquo;</p>
                <p className="text-gray-400 text-sm">Archivos soportados: .txt</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telegram
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((tip) => (
                  <tr key={tip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(tip.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tip.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tip.sentToWhatsApp ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <FaCheckCircle /> {formatTime(tip.whatsappSentAt)}
                        </span>
                      ) : (
                        <span className="text-gray-400">No enviado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tip.sentToTelegram ? (
                        <span className="flex items-center gap-1 text-blue-600">
                          <FaCheckCircle /> {formatTime(tip.telegramSentAt)}
                        </span>
                      ) : (
                        <span className="text-gray-400">No enviado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No hay historial de tips
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Enviados</h3>
              <FaPaperPlane className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.totalSent}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Este Mes</h3>
              <FaCalendarAlt className="text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.sentThisMonth}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Esta Semana</h3>
              <FaChartLine className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.sentThisWeek}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Tips Únicos</h3>
              <FaRobot className="text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800">{stats.uniqueTipsUsed}</p>
            <p className="text-xs text-gray-500 mt-1">de {stats.totalAvailable} disponibles</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTipsPage;
