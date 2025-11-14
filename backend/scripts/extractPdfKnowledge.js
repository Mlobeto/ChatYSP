const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const PDF_PATH = path.join(__dirname, '..', 'data', 'Ebook7PasosParaRecuperarATuEx.pdf');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'pdf_extracted_text.txt');

async function extractPdfText() {
  try {
    console.log('📖 Leyendo PDF...');
    const dataBuffer = fs.readFileSync(PDF_PATH);
    
    console.log('🔍 Extrayendo texto...');
    const parser = new PDFParse();
    const data = await parser.parse(dataBuffer);
    
    console.log(`✅ Texto extraído: ${data.text.length} caracteres`);
    console.log(`📄 Páginas: ${data.numpages}`);
    
    // Guardar el texto extraído
    fs.writeFileSync(OUTPUT_PATH, data.text, 'utf8');
    console.log(`💾 Texto guardado en: ${OUTPUT_PATH}`);
    
    // Mostrar primeros 2000 caracteres para revisar
    console.log('\n📝 Vista previa del contenido:\n');
    console.log('='.repeat(80));
    console.log(data.text.substring(0, 2000));
    console.log('='.repeat(80));
    console.log('\n✅ Extracción completada. Revisa el archivo para estructurar el conocimiento.');
    
  } catch (error) {
    console.error('❌ Error al extraer el PDF:', error.message);
    process.exit(1);
  }
}

extractPdfText();
