#!/bin/bash

# Script para ejecutar migraciones en Neon (producción)
# Uso: ./migrate-neon.sh

echo "🚀 Ejecutando migraciones en Neon (Producción)..."
echo ""

# Construir la DATABASE_URL desde las credenciales
export DATABASE_URL="postgresql://neondb_owner:npg_2FCs9RNZYTau@ep-fancy-union-ad5vgh7r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Verificar que Sequelize CLI está instalado
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx no encontrado. Instala Node.js primero."
    exit 1
fi

echo "📊 Configuración:"
echo "   Database: neondb"
echo "   Host: ep-fancy-union-ad5vgh7r-pooler.c-2.us-east-1.aws.neon.tech"
echo "   Environment: production"
echo ""

# Ejecutar migraciones
echo "⚙️  Ejecutando: npx sequelize-cli db:migrate --env production"
echo ""

npx sequelize-cli db:migrate --env production

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migraciones completadas exitosamente en Neon!"
    echo ""
    echo "📝 Verificar la tabla knowledge_base:"
    echo "   psql \"\$DATABASE_URL\" -c \"\\d knowledge_base\""
else
    echo ""
    echo "❌ Error ejecutando las migraciones"
    exit 1
fi
