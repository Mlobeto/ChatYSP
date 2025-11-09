import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

const TipsUploader = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.txt')) {
        setError('Solo se permiten archivos de texto (.txt)');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande (máximo 5MB)');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tips/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data);
        setFile(null);
        if (onUploadComplete) {
          onUploadComplete(data.data);
        }
      } else {
        setError(data.message || 'Error subiendo archivo');
      }
    } catch (err) {
      setError('Error de conexión al servidor');
      console.error('Error uploading tips:', err);
    } finally {
      setUploading(false);
    }
  };

  const resetUploader = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <Upload className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Cargar Tips desde Archivo TXT
        </h3>
      </div>

      {/* Formato esperado */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">
          📝 Formato esperado del archivo:
        </p>
        <pre className="text-xs text-blue-700 bg-white p-3 rounded overflow-x-auto">
{`---
TITLE: Título del tip
CATEGORY: game|chat|general|ai
DIFFICULTY: beginner|intermediate|advanced
TAGS: tag1, tag2, tag3
CONTENT:
Contenido del tip en múltiples líneas...
---`}
        </pre>
      </div>

      {/* Selector de archivo */}
      {!result && (
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileText className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {file ? file.name : 'Haz clic para seleccionar un archivo .txt'}
              </p>
              {file && (
                <p className="text-xs text-gray-400 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
            <input
              id="file-upload"
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                ¡Tips cargados exitosamente!
              </p>
            </div>
            <button
              onClick={resetUploader}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div className="text-center p-2 bg-white rounded">
              <p className="text-2xl font-bold text-green-600">{result.inserted}</p>
              <p className="text-xs text-gray-600">Insertados</p>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <p className="text-2xl font-bold text-yellow-600">{result.skipped}</p>
              <p className="text-xs text-gray-600">Omitidos</p>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <p className="text-2xl font-bold text-blue-600">{result.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 rounded">
              <p className="text-xs font-medium text-yellow-800 mb-1">
                Errores encontrados:
              </p>
              <ul className="text-xs text-yellow-700 space-y-1">
                {result.errors.map((err, idx) => (
                  <li key={idx}>
                    • {err.title}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Botones */}
      {file && !result && (
        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Subir Tips
              </>
            )}
          </button>
          <button
            onClick={resetUploader}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default TipsUploader;
