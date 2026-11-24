package com.diseno.miApp.FinalizarCuestionarios;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Requerimiento especial del CU032: registro de ejecución del proceso con
 * fecha, hora y acción (inicio o finalización de la ejecución).
 */
@Entity
@Getter
@Setter
@Table(name = "ejecucion_finalizacion_cuestionarios")
public class EjecucionFinalizacion {

    public enum Accion { INICIO, FINALIZACION, ERROR }

    public enum Origen { AUTOMATICO, MANUAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Accion accion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Origen origen;

    private Integer cuestionariosIncompletos;
    private Integer cuestionariosSinContestar;

    @Column(length = 500)
    private String detalle;
}
