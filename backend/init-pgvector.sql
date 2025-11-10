-- Habilita la extensión pgvector automáticamente al crear la base de datos
CREATE EXTENSION IF NOT EXISTS vector;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ pgvector extension installed successfully!';
  RAISE NOTICE 'You can now use vector columns and similarity search.';
END $$;
