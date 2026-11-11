CREATE UNIQUE INDEX IF NOT EXISTS uk_empresa_nombre_ci
    ON empresa (LOWER(BTRIM(nombre)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_competencia_codigo_ci
    ON competencia (LOWER(BTRIM(codigo)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_competencia_nombre_ci
    ON competencia (LOWER(BTRIM(nombre)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_factor_codigo_ci
    ON factor (LOWER(BTRIM(codigo)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_factor_nombre_ci
    ON factor (LOWER(BTRIM(nombre)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_factor_competencia_orden
    ON factor (compentencia_id, nro_orden);

CREATE UNIQUE INDEX IF NOT EXISTS uk_puesto_codigo_ci
    ON puesto (LOWER(BTRIM(codigo)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_puesto_nombre_ci
    ON puesto (LOWER(BTRIM(nombre)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_caracteristica_puesto_competencia
    ON caracteristicas_puesto (puesto_id, competencia_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_opcion_respuesta_nombre_ci
    ON opcion_respuesta (LOWER(BTRIM(nombre)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_pregunta_factor_nombre_ci
    ON pregunta (factor_id, LOWER(BTRIM(name)));

CREATE UNIQUE INDEX IF NOT EXISTS uk_pregunta_factor_texto_ci
    ON pregunta (factor_id, LOWER(BTRIM(texto_pregunta)));

DROP INDEX IF EXISTS uk_cuestionario_candidato;

CREATE UNIQUE INDEX IF NOT EXISTS uk_cuestionario_candidato_abierto
    ON cuestionario (candidato_id)
    WHERE estado_cuestionario IN ('ACTIVO', 'EN_PROCESO');

CREATE UNIQUE INDEX IF NOT EXISTS uk_respuesta_cuestionario_pregunta
    ON respuesta_pregunta_cuestionario (cuestionario_id, pregunta_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_ponderacion_pregunta_detalle
    ON pregunta_opcion_ponderacion (
        pregunta_id,
        detalle_opcion_respuesta_id
    );

CREATE UNIQUE INDEX IF NOT EXISTS uk_candidato_nombre_apellido_ci
    ON candidato (LOWER(BTRIM(nombre)), LOWER(BTRIM(apellido)));
