package com.diseno.miApp.Pregunta;

import com.diseno.miApp.Factor.Factor;
import com.diseno.miApp.Factor.FactorService;
import com.diseno.miApp.OpcionRespuesta.DetalleOpcionCrearRequest;
import com.diseno.miApp.OpcionRespuesta.GestionOpcionRespuestaService;
import com.diseno.miApp.OpcionRespuesta.OpcionRespuestaCrearRequest;
import com.diseno.miApp.OpcionRespuesta.OpcionRespuestaResponse;
import com.diseno.miApp.Pregunta.PreguntaIADTO.Borrador;
import com.diseno.miApp.Pregunta.PreguntaIADTO.ConfirmarRequest;
import com.diseno.miApp.Pregunta.PreguntaIADTO.DetalleBorrador;
import com.diseno.miApp.Pregunta.PreguntaIADTO.GenerarRequest;
import com.diseno.miApp.Pregunta.PreguntaIADTO.PreguntaGuardada;
import com.diseno.miApp.Pregunta.PreguntaIADTO.VistaPrevia;
import com.diseno.miApp.PreguntaOpcionPonderacion.PonderacionDetalleRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.diseno.miApp.helpers.ManejoErroresHelper.errorSolicitud;

@Service
public class PreguntaIAService {

    private final FactorService factorService;
    private final GeneradorPreguntaOpenAI generadorOpenAI;
    private final GestionOpcionRespuestaService opcionRespuestaService;
    private final GestionPreguntaService gestionPreguntaService;

    public PreguntaIAService(
            FactorService factorService,
            GeneradorPreguntaOpenAI generadorOpenAI,
            GestionOpcionRespuestaService opcionRespuestaService,
            GestionPreguntaService gestionPreguntaService) {
        this.factorService = factorService;
        this.generadorOpenAI = generadorOpenAI;
        this.opcionRespuestaService = opcionRespuestaService;
        this.gestionPreguntaService = gestionPreguntaService;
    }

    public VistaPrevia generar(GenerarRequest request) {
        if (request == null || request.idFactor() == null) {
            throw errorSolicitud("Seleccioná un factor");
        }

        Factor factor = buscarFactorActivo(request.idFactor());
        Borrador borrador = normalizarYValidar(
                generadorOpenAI.generar(factor, request.indicaciones())
        );
        if (borrador.nombreOpcionRespuesta().length() > 208) {
            throw errorSolicitud(
                    "El nombre generado para la escala es demasiado largo"
            );
        }

        // La escala se crea únicamente al aceptar. El sufijo evita colisiones
        // con los nombres únicos de opciones de respuesta existentes.
        String sufijo = UUID.randomUUID().toString()
                .substring(0, 8)
                .toUpperCase(Locale.ROOT);
        borrador = new Borrador(
                borrador.nombre(),
                borrador.textoPregunta(),
                borrador.descripcion(),
                borrador.nombreOpcionRespuesta() + " IA-" + sufijo,
                borrador.descripcionOpcionRespuesta(),
                borrador.detalles()
        );

        return new VistaPrevia(
                factor.getId(),
                factor.getNombre(),
                factor.getCompetencia().getId(),
                factor.getCompetencia().getNombre(),
                borrador
        );
    }

    @Transactional
    public PreguntaGuardada confirmar(ConfirmarRequest request) {
        if (request == null || request.idFactor() == null) {
            throw errorSolicitud("No se recibió el borrador para guardar");
        }

        Factor factor = buscarFactorActivo(request.idFactor());
        Borrador borrador = normalizarYValidar(request.borrador());

        List<DetalleOpcionCrearRequest> detalles = borrador.detalles()
                .stream()
                .map(detalle -> new DetalleOpcionCrearRequest(
                        detalle.ordenVisualizacion(),
                        detalle.descripcion()
                ))
                .toList();

        OpcionRespuestaResponse opcion = opcionRespuestaService.crear(
                new OpcionRespuestaCrearRequest(
                        borrador.nombreOpcionRespuesta(),
                        borrador.descripcionOpcionRespuesta(),
                        detalles
                )
        );

        Map<Integer, Integer> ponderacionPorOrden =
                borrador.detalles().stream().collect(Collectors.toMap(
                        DetalleBorrador::ordenVisualizacion,
                        DetalleBorrador::ponderacion
                ));

        PreguntaCrearRequest requestPregunta = new PreguntaCrearRequest();
        requestPregunta.setCompetenciaId(factor.getCompetencia().getId());
        requestPregunta.setIdFactor(factor.getId());
        requestPregunta.setNombre(borrador.nombre());
        requestPregunta.setTextoPregunta(borrador.textoPregunta());
        requestPregunta.setDescripcion(borrador.descripcion());
        requestPregunta.setIdOpcionRespuesta(opcion.id());
        requestPregunta.setPonderaciones(opcion.detalles().stream()
                .map(detalle -> {
                    PonderacionDetalleRequest ponderacion =
                            new PonderacionDetalleRequest();
                    ponderacion.setDetalleOpcionRespuestaId(detalle.id());
                    ponderacion.setPonderacion(ponderacionPorOrden.get(
                            detalle.ordenVisualizacion()));
                    return ponderacion;
                })
                .toList());

        Pregunta pregunta = gestionPreguntaService.crearPregunta(
                requestPregunta);

        return new PreguntaGuardada(
                pregunta.getId(),
                factor.getNombre(),
                factor.getCompetencia().getNombre(),
                borrador
        );
    }

    private Factor buscarFactorActivo(Long idFactor) {
        Factor factor = factorService.buscarPorId(idFactor);

        if (!factor.isEstaActvivo()) {
            throw errorSolicitud("El factor seleccionado está dado de baja");
        }
        if (factor.getCompetencia() == null
                || !Boolean.TRUE.equals(
                        factor.getCompetencia().getEstaActivo())) {
            throw errorSolicitud(
                    "La competencia del factor no está activa"
            );
        }
        return factor;
    }

    private Borrador normalizarYValidar(Borrador borrador) {
        if (borrador == null
                || borrador.detalles() == null
                || borrador.detalles().size() != 5) {
            throw errorSolicitud(
                    "La pregunta debe incluir cinco detalles de respuesta"
            );
        }

        String nombre = normalizar(borrador.nombre());
        String texto = normalizar(borrador.textoPregunta());
        String descripcion = normalizar(borrador.descripcion());
        String nombreOpcion = normalizar(borrador.nombreOpcionRespuesta());
        String descripcionOpcion =
                normalizar(borrador.descripcionOpcionRespuesta());

        validarTexto(nombre, 100, "El nombre de pregunta", true);
        validarTexto(texto, 1000, "El texto de pregunta", true);
        validarTexto(descripcion, 500, "La descripción de pregunta", false);
        validarTexto(nombreOpcion, 220, "El nombre de la escala", true);
        validarTexto(descripcionOpcion, 255, "La descripción de la escala", true);

        Set<String> descripcionesUnicas = new HashSet<>();
        int suma = 0;
        java.util.ArrayList<DetalleBorrador> detalles =
                new java.util.ArrayList<>();

        for (int indice = 0; indice < borrador.detalles().size(); indice++) {
            DetalleBorrador detalle = borrador.detalles().get(indice);
            if (detalle == null
                    || detalle.descripcion() == null
                    || detalle.ponderacion() == null
                    || detalle.ordenVisualizacion() == null) {
                throw errorSolicitud(
                        "Cada respuesta requiere descripción, orden y ponderación"
                );
            }

            String textoDetalle = normalizar(detalle.descripcion());
            if (textoDetalle.isBlank() || textoDetalle.length() > 255) {
                throw errorSolicitud(
                        "Cada detalle debe tener una descripción de hasta 255 caracteres"
                );
            }
            if (detalle.ordenVisualizacion() != indice + 1) {
                throw errorSolicitud(
                        "Los detalles deben estar ordenados consecutivamente desde 1"
                );
            }
            if (detalle.ponderacion() < 0 || detalle.ponderacion() > 10) {
                throw errorSolicitud(
                        "Cada ponderación debe estar entre 0 y 10"
                );
            }
            if (!descripcionesUnicas.add(textoDetalle)) {
                throw errorSolicitud(
                        "Los detalles de respuesta no pueden repetirse"
                );
            }

            suma += detalle.ponderacion();
            detalles.add(new DetalleBorrador(
                    detalle.ordenVisualizacion(),
                    textoDetalle,
                    detalle.ponderacion()
            ));
        }

        if (suma != 10) {
            throw errorSolicitud(
                    "Las ponderaciones de los detalles deben sumar 10"
            );
        }

        return new Borrador(
                nombre,
                texto,
                descripcion,
                nombreOpcion,
                descripcionOpcion,
                List.copyOf(detalles)
        );
    }

    private void validarTexto(
            String texto, int maximo, String campo, boolean obligatorio) {
        if ((obligatorio && texto.isBlank()) || texto.length() > maximo) {
            throw errorSolicitud(
                    campo + " debe tener como máximo " + maximo + " caracteres"
            );
        }
    }

    private String normalizar(String valor) {
        return valor == null
                ? ""
                : valor.trim().toUpperCase(Locale.forLanguageTag("es-AR"));
    }
}
