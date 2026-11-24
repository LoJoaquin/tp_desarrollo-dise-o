package com.diseno.miApp.FinalizarCuestionarios;

import com.diseno.miApp.Cuestionario.CuestionarioRepository;
import com.diseno.miApp.EstadoCuestionario.EstadoCuestionario;
import com.diseno.miApp.FinalizarCuestionarios.EjecucionFinalizacion.Accion;
import com.diseno.miApp.FinalizarCuestionarios.EjecucionFinalizacion.Origen;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

/**
 * CU032 — Finalizar cuestionarios.
 *
 * Paso 2: los cuestionarios EN_PROCESO que superaron el tiempo máximo para
 * completarse pasan a INCOMPLETO.
 * Paso 3: los cuestionarios ACTIVO que superaron el tiempo máximo en estado
 * activo pasan a SIN_CONTESTAR.
 * En ambos casos se actualiza la fecha y hora del cambio de estado.
 *
 * Las actualizaciones son UPDATE masivos con la condición de estado en el
 * WHERE, así que un cuestionario que el candidato acaba de finalizar no se
 * pisa. El registro de inicio se guarda en su propia transacción para que
 * quede constancia aunque la actualización falle.
 */
@Service
public class FinalizarCuestionariosService {

    private static final Logger log = LoggerFactory.getLogger(FinalizarCuestionariosService.class);

    public record ResultadoFinalizacion(
            LocalDateTime fechaEjecucion,
            int cuestionariosIncompletos,
            int cuestionariosSinContestar) {
    }

    public record EjecucionResponse(
            Long id,
            LocalDateTime fechaHora,
            String accion,
            String origen,
            Integer cuestionariosIncompletos,
            Integer cuestionariosSinContestar,
            String detalle) {

        static EjecucionResponse desde(EjecucionFinalizacion e) {
            return new EjecucionResponse(e.getId(), e.getFechaHora(), e.getAccion().name(),
                    e.getOrigen().name(), e.getCuestionariosIncompletos(),
                    e.getCuestionariosSinContestar(), e.getDetalle());
        }
    }

    private final CuestionarioRepository cuestionarioRepository;
    private final EjecucionFinalizacionRepository ejecucionRepository;
    private final TransactionTemplate transaccion;
    // Evita que el proceso automático y uno manual corran a la vez.
    private final ReentrantLock enEjecucion = new ReentrantLock();

    public FinalizarCuestionariosService(
            CuestionarioRepository cuestionarioRepository,
            EjecucionFinalizacionRepository ejecucionRepository,
            PlatformTransactionManager transactionManager) {
        this.cuestionarioRepository = cuestionarioRepository;
        this.ejecucionRepository = ejecucionRepository;
        this.transaccion = new TransactionTemplate(transactionManager);
    }

    public ResultadoFinalizacion ejecutar(Origen origen) {
        enEjecucion.lock();
        try {
            registrar(Accion.INICIO, origen, null, null, null);
            try {
                ResultadoFinalizacion resultado = transaccion.execute(estado -> actualizarVencidos());
                registrar(Accion.FINALIZACION, origen,
                        resultado.cuestionariosIncompletos(),
                        resultado.cuestionariosSinContestar(),
                        "Ejecución finalizada correctamente");
                if (resultado.cuestionariosIncompletos() > 0 || resultado.cuestionariosSinContestar() > 0) {
                    log.info("CU032: {} cuestionarios pasaron a INCOMPLETO y {} a SIN_CONTESTAR",
                            resultado.cuestionariosIncompletos(), resultado.cuestionariosSinContestar());
                }
                return resultado;
            } catch (RuntimeException e) {
                String mensaje = e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage();
                registrar(Accion.ERROR, origen, null, null,
                        mensaje.length() > 480 ? mensaje.substring(0, 480) : mensaje);
                throw e;
            }
        } finally {
            enEjecucion.unlock();
        }
    }

    public List<EjecucionResponse> ultimasEjecuciones() {
        return ejecucionRepository.findTop50ByOrderByIdDesc().stream()
                .map(EjecucionResponse::desde)
                .toList();
    }

    private ResultadoFinalizacion actualizarVencidos() {
        LocalDateTime ahora = LocalDateTime.now();
        int incompletos = cuestionarioRepository.vencerPorLimiteFinalizacion(
                EstadoCuestionario.EN_PROCESO, EstadoCuestionario.INCOMPLETO, ahora);
        int sinContestar = cuestionarioRepository.vencerPorLimiteActivo(
                EstadoCuestionario.ACTIVO, EstadoCuestionario.SIN_CONTESTAR, ahora);
        return new ResultadoFinalizacion(ahora, incompletos, sinContestar);
    }

    private void registrar(Accion accion, Origen origen, Integer incompletos,
                           Integer sinContestar, String detalle) {
        EjecucionFinalizacion registro = new EjecucionFinalizacion();
        registro.setFechaHora(LocalDateTime.now());
        registro.setAccion(accion);
        registro.setOrigen(origen);
        registro.setCuestionariosIncompletos(incompletos);
        registro.setCuestionariosSinContestar(sinContestar);
        registro.setDetalle(detalle);
        ejecucionRepository.save(registro);
    }
}
