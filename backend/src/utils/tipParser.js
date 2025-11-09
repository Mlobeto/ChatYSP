/**
 * Utility para parsear archivos TXT de tips
 * Soporta formatos:
 * - "Tip🦁del dia: [Título]" + contenido
 * - "Historia🦁del dia: [Título]" + contenido
 */

/**
 * Parsea el contenido de un archivo TXT y extrae la información del tip
 * @param {string} textContent - Contenido completo del archivo de texto
 * @param {string} filename - Nombre del archivo (opcional, para contexto)
 * @returns {Object} Objeto con la información parseada del tip
 */
function parseTipFromText(textContent, filename = '') {
  // Limpiar el contenido
  const content = textContent.trim();
  
  // Detectar el tipo de tip basado en el encabezado
  const tipPattern = /Tip🦁del\s+dia:\s*\[([^\]]+)\]/i;
  const historiaPattern = /Historia🦁del\s+dia:\s*\[([^\]]+)\]/i;
  
  let title = '';
  let category = 'ruptura'; // categoría por defecto para coaching
  let difficulty = 'intermedio'; // dificultad por defecto
  let tipContent = '';
  
  // Intentar extraer título de formato "Tip🦁del dia"
  const tipMatch = content.match(tipPattern);
  if (tipMatch) {
    title = tipMatch[1].trim();
    category = 'ruptura'; // Todos los tips son de coaching de ruptura
    // Extraer el contenido después del encabezado
    tipContent = content.replace(tipPattern, '').trim();
  } else {
    // Intentar extraer título de formato "Historia🦁del dia"
    const historiaMatch = content.match(historiaPattern);
    if (historiaMatch) {
      title = historiaMatch[1].trim();
      category = 'historia'; // Historias motivacionales
      tipContent = content.replace(historiaPattern, '').trim();
    } else {
      // Si no hay formato reconocido, usar la primera línea como título
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        title = lines[0].substring(0, 100); // Limitar título a 100 caracteres
        tipContent = lines.slice(1).join('\n').trim();
      } else {
        tipContent = content;
        title = filename ? filename.replace('.txt', '') : 'Tip sin título';
      }
    }
  }

  // Si no hay contenido después de extraer el título, usar todo el texto
  if (!tipContent && content) {
    tipContent = content;
  }

  // Generar tags basados en el contenido
  const tags = generateTags(title, tipContent, category);

  // Determinar dificultad basada en longitud del contenido (en español)
  if (tipContent.length < 200) {
    difficulty = 'basico';
  } else if (tipContent.length < 500) {
    difficulty = 'intermedio';
  } else {
    difficulty = 'avanzado';
  }

  return {
    title: title || 'Tip del día',
    content: tipContent || content,
    category,
    difficulty,
    tags,
    source: filename || 'archivo-txt'
  };
}

/**
 * Genera tags automáticamente basándose en palabras clave
 * @param {string} title - Título del tip
 * @param {string} content - Contenido del tip
 * @param {string} category - Categoría del tip
 * @returns {Array<string>} Array de tags
 */
function generateTags(title, content, category) {
  const tags = [category];
  const fullText = `${title} ${content}`.toLowerCase();

  // Palabras clave para diferentes categorías
  const keywords = {
    'motivacion': ['motivación', 'inspiración', 'fuerza', 'ánimo', 'energía'],
    'habitos': ['hábito', 'rutina', 'práctica', 'costumbre', 'disciplina'],
    'mindfulness': ['mindfulness', 'atención', 'presente', 'conciencia', 'meditación'],
    'relaciones': ['relación', 'amistad', 'familia', 'pareja', 'social'],
    'autoestima': ['autoestima', 'confianza', 'valor', 'autoconfianza', 'seguridad'],
    'emociones': ['emoción', 'sentimiento', 'sentir', 'emocional'],
    'crecimiento': ['crecimiento', 'desarrollo', 'mejora', 'evolución', 'progreso'],
    'salud': ['salud', 'bienestar', 'físico', 'ejercicio', 'alimentación'],
    'productividad': ['productividad', 'eficiencia', 'tiempo', 'organización', 'planificación'],
    'gratitud': ['gratitud', 'agradecer', 'apreciar', 'valorar'],
    'resilencia': ['resiliencia', 'superar', 'obstáculo', 'desafío', 'dificultad'],
    'comunicacion': ['comunicación', 'hablar', 'escuchar', 'diálogo', 'conversación']
  };

  // Detectar tags basados en palabras clave
  for (const [tag, words] of Object.entries(keywords)) {
    if (words.some(word => fullText.includes(word))) {
      tags.push(tag);
    }
  }

  // Limitar a 5 tags máximo
  return [...new Set(tags)].slice(0, 5);
}

/**
 * Valida que el tip parseado tenga la información mínima necesaria
 * @param {Object} tip - Tip parseado
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validateParsedTip(tip) {
  const errors = [];

  if (!tip.content || tip.content.length < 10) {
    errors.push('El contenido del tip debe tener al menos 10 caracteres');
  }

  if (tip.content && tip.content.length > 10000) {
    errors.push('El contenido del tip no debe exceder 10000 caracteres');
  }

  if (!tip.title || tip.title.length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  }

  // Categorías para tips de coaching
  const validCategories = ['ruptura', 'historia', 'sanacion', 'autoestima', 'general'];
  if (!validCategories.includes(tip.category)) {
    errors.push(`Categoría inválida. Debe ser una de: ${validCategories.join(', ')}`);
  }

  // Dificultades en español
  const validDifficulties = ['basico', 'intermedio', 'avanzado'];
  if (!validDifficulties.includes(tip.difficulty)) {
    errors.push(`Dificultad inválida. Debe ser una de: ${validDifficulties.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  parseTipFromText,
  generateTags,
  validateParsedTip
};
