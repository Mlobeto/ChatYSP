import PyPDF2
import sys
import os

pdf_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'Ebook7PasosParaRecuperarATuEx.pdf')
output_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'pdf_extracted_text.txt')

try:
    print('📖 Leyendo PDF...')
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        print(f'📄 Total de páginas: {len(reader.pages)}')
        
        text = ''
        for i, page in enumerate(reader.pages):
            print(f'⏳ Procesando página {i+1}/{len(reader.pages)}...')
            text += f'\n\n--- PÁGINA {i+1} ---\n\n'
            text += page.extract_text()
        
        print(f'✅ Texto extraído: {len(text)} caracteres')
        
        # Guardar
        with open(output_path, 'w', encoding='utf-8') as output:
            output.write(text)
        
        print(f'💾 Guardado en: {output_path}')
        
        # Mostrar vista previa
        print('\n📝 Vista previa:\n')
        print('=' * 80)
        print(text[:2000])
        print('=' * 80)
        
except Exception as e:
    print(f'❌ Error: {e}')
    sys.exit(1)
