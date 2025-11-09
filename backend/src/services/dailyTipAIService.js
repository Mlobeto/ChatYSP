const OpenAI = require('openai');
const CoachTip = require('../models/CoachTip');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

class DailyTipAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Cargar opciones de footer
    const footerPath = path.join(__dirname, '../../data/footer_options.json');
    this.footerOptions = JSON.parse(fs.readFileSync(footerPath, 'utf-8'));

    this.fedePersonality = `Eres Federico Hirigoyen, coach ontológico especializado en rupturas de pareja.

ESTILO DE ESCRITURA PARA TIPS:
- Directo, motivador y empático
- Usa español NEUTRO (tú, tu, tienes, etc.) - NO argentino
- Para saludos usa "querid@" (con @) para incluir femenino y masculino
- Incluye emojis estratégicamente (🦁, ✨, 💪, etc.)
- Formato conversacional, como hablando con un amigo
- Preguntas retóricas para generar reflexión
- Mezcla de conceptos profundos con ejemplos cotidianos
- Referencias a filosofía (Ayn Rand, Carl Jung) cuando es relevante
- Metáforas y ejemplos universales que conecten con toda Latinoamérica

ESTRUCTURA DE TIP:
1. Hook inicial (pregunta, situación común, o afirmación potente)
2. Desarrollo del concepto
3. Aplicación práctica
4. Cierre motivador con pregunta o llamado a la acción

TONO:
- Profesional pero cercano
- Sin juzgar, comprensivo
- Motivador y orientado a la acción
- Auténtico y humano`;

    this.modelConfig = {
      model: 'gpt-4o-mini',
      max_tokens: 800,
    };
  }

  async generateDailyTip(usedTipIds = []) {
    try {
      console.log('🤖 Generando tip diario...');

      const availableTips = await CoachTip.findAll({
        where: {
          id: {
            [Op.notIn]: usedTipIds.length > 0 ? usedTipIds : ['00000000-0000-0000-0000-000000000000'],
          },
          isActive: true,
        },
        limit: 5,
        order: [['createdAt', 'DESC']],
      });

      if (availableTips.length === 0) {
        throw new Error('No hay tips disponibles');
      }

      const baseTip = availableTips[Math.floor(Math.random() * availableTips.length)];
      console.log(`📝 Tip base: "${baseTip.title}"`);

      const generatedContent = await this.generateVariation(baseTip);

      return {
        success: true,
        content: generatedContent,
        baseTipId: baseTip.id,
        baseTipTitle: baseTip.title,
        category: baseTip.category,
      };
    } catch (error) {
      console.error('❌ Error generando tip:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateVariation(baseTip) {
    const prompt = `Basándote en el siguiente tip, crea una NUEVA VERSIÓN completamente original que:

1. Mantenga el CONCEPTO central
2. Use DIFERENTES palabras y ejemplos
3. Sea igual de impactante
4. NO sea una paráfrasis
5. Longitud: 300-500 palabras

TIP ORIGINAL:
Título: ${baseTip.title}
${baseTip.content}

IMPORTANTE:
- Español NEUTRO (tú, tu, tienes, eres, etc.) - NO argentino (vos, tenés, sos)
- Estilo empático y directo
- Incluye emojis (🦁, 💪, ✨)
- Preguntas retóricas
- Termina con pregunta o llamado
- NO copies frases textuales

Genera SOLO el contenido del tip.`;

    const completion = await this.openai.chat.completions.create({
      ...this.modelConfig,
      messages: [
        { role: 'system', content: this.fedePersonality },
        { role: 'user', content: prompt },
      ],
    });

    return completion.choices[0]?.message?.content || '';
  }

  /**
   * Extrae una frase impactante del contenido para usar en la firma
   */
  async extractKeyPhrase(content) {
    const prompt = `Del siguiente texto, extrae LA FRASE MÁS IMPACTANTE Y MEMORABLE (máximo 8-12 palabras).
Debe ser una frase completa que resuma la esencia del mensaje.
No incluyas comillas ni puntos finales.

TEXTO:
${content}

Devuelve SOLO la frase, sin nada más.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 50,
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'Eres experto en extraer frases clave memorables.' },
          { role: 'user', content: prompt },
        ],
      });

      const phrase = completion.choices[0]?.message?.content?.trim().replace(/[."]/g, '');
      return phrase || 'Tu proceso es único y valioso';
    } catch (error) {
      console.error('Error extrayendo frase:', error);
      return 'Tu proceso es único y valioso';
    }
  }

  /**
   * Genera un footer aleatorio con PD + firma personalizada
   */
  generateRandomFooter(keyPhrase) {
    // Seleccionar un tipo de PD aleatorio
    const pdTypes = this.footerOptions.postData;
    const selectedPD = pdTypes[Math.floor(Math.random() * pdTypes.length)];
    
    // Seleccionar un template aleatorio de ese tipo
    const pdTemplate = selectedPD.templates[Math.floor(Math.random() * selectedPD.templates.length)];
    
    // Seleccionar un formato de firma aleatorio
    const firmaTemplate = this.footerOptions.firmas[Math.floor(Math.random() * this.footerOptions.firmas.length)];
    
    // Reemplazar {frase} con la frase clave
    const pdFinal = pdTemplate.replace('{frase}', keyPhrase);
    const firmaFinal = firmaTemplate.replace('{frase}', keyPhrase);
    
    return {
      postData: pdFinal,
      firma: firmaFinal,
      type: selectedPD.type,
    };
  }

  formatForWhatsApp(content, footer = null) {
    // Formato bonito para WhatsApp con negritas (*) e ítalicas (_)
    const lines = content.split('\n');
    const formatted = lines.map(line => {
      // Si la línea parece un título o encabezado, ponerla en negrita
      if (line.trim().length > 0 && line.trim().length < 60 && !line.includes('.')) {
        return `*${line.trim()}*`;
      }
      return line;
    }).join('\n');

    const header = `┏━━━━━━━━━━━━━━━┓
┃  *🦁 TIP DEL DÍA* ┃
┗━━━━━━━━━━━━━━━┛

`;
    
    let footerText = `

━━━━━━━━━━━━━━━━━━━`;

    if (footer) {
      footerText += `\n${footer.postData}\n\n${footer.firma}`;
    } else {
      footerText += `
_Fede - Tu Coach de Rupturas_
🦁 Método *"Yo Soy el Premio"*`;
    }

    footerText += `

💪 ¿Te sirvió este tip?
📱 Compartilo con quien lo necesite`;

    return header + formatted + footerText;
  }

  formatForTelegram(content, footer = null) {
    // Formato para Telegram con HTML (negrita y cursiva)
    const lines = content.split('\n');
    const formatted = lines.map(line => {
      // Si la línea parece un título o encabezado, ponerla en negrita
      if (line.trim().length > 0 && line.trim().length < 60 && !line.includes('.')) {
        return `<b>${line.trim()}</b>`;
      }
      return line;
    }).join('\n');

    const header = `╔═══════════════════╗
║  <b>🦁 TIP DEL DÍA</b>  ║
╚═══════════════════╝

`;
    
    let footerText = `

━━━━━━━━━━━━━━━━━━━`;

    if (footer) {
      // Convertir formato WhatsApp a HTML
      const pdHtml = footer.postData
        .replace(/\*([^*]+)\*/g, '<b>$1</b>')
        .replace(/_([^_]+)_/g, '<i>$1</i>');
      const firmaHtml = footer.firma
        .replace(/\*([^*]+)\*/g, '<b>$1</b>')
        .replace(/_([^_]+)_/g, '<i>$1</i>');
      
      footerText += `\n${pdHtml}\n\n${firmaHtml}`;
    } else {
      footerText += `
<i>Fede - Tu Coach de Rupturas</i>
🦁 Método <b>"Yo Soy el Premio"</b>`;
    }

    footerText += `

💪 ¿Te sirvió este tip?
📱 Compartilo con quien lo necesite`;

    return header + formatted + footerText;
  }

  async generateTitle(content) {
    const prompt = `Título corto e impactante (máximo 60 caracteres) para este tip:\n\n${content.substring(0, 300)}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 50,
      messages: [
        { role: 'system', content: 'Crea títulos impactantes para tips de coaching.' },
        { role: 'user', content: prompt },
      ],
    });

    return completion.choices[0]?.message?.content?.trim() || 'Tip del Día';
  }
}

module.exports = DailyTipAIService;
