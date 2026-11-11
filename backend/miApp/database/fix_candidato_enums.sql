-- Ejecutar una sola vez sobre la base diseno_1.
-- Alinea las columnas que guardan enums con @Enumerated(EnumType.STRING).
-- No agregar este archivo a schema.sql: schema.sql se ejecuta al iniciar la app.

BEGIN;

ALTER TABLE candidato
    ALTER COLUMN genero TYPE VARCHAR(255)
    USING genero::text;

ALTER TABLE candidato
    ALTER COLUMN tipo_documento TYPE VARCHAR(255)
    USING tipo_documento::text;

COMMIT;
