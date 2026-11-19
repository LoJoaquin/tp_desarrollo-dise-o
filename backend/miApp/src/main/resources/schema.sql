CREATE UNIQUE INDEX IF NOT EXISTS uk_empresa_nombre
    ON empresa (nombre);

CREATE UNIQUE INDEX IF NOT EXISTS uk_competencia_codigo
    ON competencia (codigo);

CREATE UNIQUE INDEX IF NOT EXISTS uk_competencia_nombre
    ON competencia (nombre);

CREATE UNIQUE INDEX IF NOT EXISTS uk_factor_codigo
    ON factor (codigo);

CREATE UNIQUE INDEX IF NOT EXISTS uk_factor_nombre
    ON factor (nombre);

CREATE UNIQUE INDEX IF NOT EXISTS uk_factor_competencia_orden
    ON factor (compentencia_id, nro_orden);

CREATE UNIQUE INDEX IF NOT EXISTS uk_puesto_codigo
    ON puesto (codigo);

CREATE UNIQUE INDEX IF NOT EXISTS uk_puesto_nombre
    ON puesto (nombre);

CREATE UNIQUE INDEX IF NOT EXISTS uk_caracteristica_puesto_competencia
    ON caracteristicas_puesto (puesto_id, competencia_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_opcion_respuesta_nombre
    ON opcion_respuesta (nombre);

CREATE UNIQUE INDEX IF NOT EXISTS uk_pregunta_factor_nombre
    ON pregunta (factor_id, name);

CREATE UNIQUE INDEX IF NOT EXISTS uk_pregunta_factor_texto
    ON pregunta (factor_id, texto_pregunta);

DROP INDEX IF EXISTS uk_cuestionario_candidato;

CREATE UNIQUE INDEX IF NOT EXISTS uk_cuestionario_candidato_abierto
    ON cuestionario (candidato_id)
    WHERE estado_cuestionario IN ('ACTIVO', 'EN_PROCESO');

DROP INDEX IF EXISTS uk_respuesta_cuestionario_pregunta;

CREATE UNIQUE INDEX IF NOT EXISTS uk_respuesta_cuestionario_modelo_pregunta
    ON respuesta_pregunta_cuestionario (cuestionario_id, modelo_pregunta_id);

CREATE UNIQUE INDEX IF NOT EXISTS uk_ponderacion_pregunta_detalle
    ON pregunta_opcion_ponderacion (
        pregunta_id,
        detalle_opcion_respuesta_id
    );

CREATE UNIQUE INDEX IF NOT EXISTS uk_modelo_competencia_origen
    ON modelo_competencia (modelo_cuestionario_id, id_competencia_original);

CREATE UNIQUE INDEX IF NOT EXISTS uk_modelo_pregunta_origen
    ON modelo_pregunta (modelo_cuestionario_id, id_pregunta_original);

CREATE UNIQUE INDEX IF NOT EXISTS uk_modelo_pregunta_bloque_orden
    ON modelo_pregunta (modelo_cuestionario_id, bloque, orden);

CREATE UNIQUE INDEX IF NOT EXISTS uk_modelo_opcion_origen
    ON modelo_opcion (modelo_pregunta_id, id_detalle_original);

CREATE UNIQUE INDEX IF NOT EXISTS uk_candidato_nombre_apellido
    ON candidato (nombre, apellido);
