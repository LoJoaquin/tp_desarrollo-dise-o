package com.diseno.miApp.EstadoCuestionario;

import lombok.Getter;

@Getter
/*
 * Cuestionario.estadoCuestionario se persiste con EnumType.STRING.
 * Los nombres ACTIVO y EN_PROCESO también se usan en el índice parcial de
 * schema.sql; si se renombran, hay que actualizar ese índice.
 */
public enum EstadoCuestionario {
    ACTIVO,
    EN_PROCESO,
    COMPLETO,
    INCOMPLETO,
    SIN_CONTESTAR
}
