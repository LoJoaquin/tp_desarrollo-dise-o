package com.diseno.miApp.FinalizarCuestionarios;

import com.diseno.miApp.FinalizarCuestionarios.EjecucionFinalizacion.Origen;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * Actor "Sistema" del CU032: ejecuta el proceso en forma periódica.
 * La frecuencia se configura con {@code cuestionario.finalizacion.cron}.
 */
@Configuration
@EnableScheduling
public class FinalizarCuestionariosScheduler {

    private static final Logger log = LoggerFactory.getLogger(FinalizarCuestionariosScheduler.class);

    private final FinalizarCuestionariosService service;

    public FinalizarCuestionariosScheduler(FinalizarCuestionariosService service) {
        this.service = service;
    }

    @Scheduled(cron = "${cuestionario.finalizacion.cron:0 */5 * * * *}")
    public void ejecutarPeriodicamente() {
        try {
            service.ejecutar(Origen.AUTOMATICO);
        } catch (RuntimeException e) {
            // Ya quedó registrado como ERROR; se reintenta en la próxima ejecución.
            log.error("CU032: falló la finalización periódica de cuestionarios", e);
        }
    }
}
