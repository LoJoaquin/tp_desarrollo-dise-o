package com.diseno.miApp.ManejoErrores;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.exc.InvalidFormatException;
import tools.jackson.databind.exc.MismatchedInputException;
import tools.jackson.databind.exc.UnrecognizedPropertyException;

import java.util.List;

@RestControllerAdvice
public class ApiExceptionHandler {

    public record ErrorCampo(String campo, String mensaje) {}

    public record ErrorResponse(
            int status,
            String mensaje,
            List<ErrorCampo> errores
    ) {}

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> manejarErroresDeCampos(
            MethodArgumentNotValidException exception) {

        List<ErrorCampo> errores =
                exception.getBindingResult().getFieldErrors().stream()
                        .map(error -> new ErrorCampo(
                                error.getField(),
                                error.getDefaultMessage()
                        ))
                        .distinct()
                        .toList();

        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "Hay errores en los datos ingresados",
                errores
        );

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> manejarJsonInvalido(
            HttpMessageNotReadableException exception) {

        UnrecognizedPropertyException campoDesconocido =
                buscarCampoDesconocido(exception);

        if (campoDesconocido != null) {
            String campo = campoDesconocido.getPropertyName();
            Class<?> tipo = campoDesconocido.getReferringClass();
            String nombreTipo = tipo == null
                    ? "este request"
                    : tipo.getSimpleName();

            ErrorResponse body = new ErrorResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    "El campo '" + campo + "' no está permitido en "
                            + nombreTipo,
                    List.of(new ErrorCampo(
                            campo,
                            "Este campo no existe en el request"
                    ))
            );

            return ResponseEntity.badRequest().body(body);
        }

        MismatchedInputException datoInvalido =
                buscarDatoInvalido(exception);

        if (datoInvalido != null) {
            String campo = buscarCampo(datoInvalido);
            String detalle = describirDatoInvalido(datoInvalido);

            ErrorResponse body = new ErrorResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    "Hay un dato con formato o tipo inválido",
                    List.of(new ErrorCampo(campo, detalle))
            );

            return ResponseEntity.badRequest().body(body);
        }

        ErrorResponse body = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                "El JSON tiene un tipo de dato o una estructura inválida",
                List.of()
        );

        return ResponseEntity.badRequest().body(body);
    }

    private MismatchedInputException buscarDatoInvalido(
            Throwable exception) {
        for (Throwable causa = exception;
                causa != null;
                causa = causa.getCause()) {
            if (causa instanceof MismatchedInputException desajuste) {
                return desajuste;
            }
        }
        return null;
    }

    private String buscarCampo(MismatchedInputException exception) {
        List<String> campos = exception.getPath().stream()
                .map(referencia -> referencia.getPropertyName())
                .filter(nombre -> nombre != null && !nombre.isBlank())
                .toList();

        return campos.isEmpty() ? "cuerpo" : String.join(".", campos);
    }

    private String describirDatoInvalido(
            MismatchedInputException exception) {
        if (exception instanceof InvalidFormatException formatoInvalido) {
            Class<?> tipoEsperado = formatoInvalido.getTargetType();

            if (tipoEsperado != null && tipoEsperado.isEnum()) {
                String valoresPermitidos = java.util.Arrays
                        .stream(tipoEsperado.getEnumConstants())
                        .map(valor -> ((Enum<?>) valor).name())
                        .collect(java.util.stream.Collectors.joining(", "));

                if (valoresPermitidos.isBlank()) {
                    return "El enum " + tipoEsperado.getSimpleName()
                            + " no tiene valores configurados en el backend.";
                }

                return "El valor no pertenece al enum "
                        + tipoEsperado.getSimpleName()
                        + ". Valores permitidos: " + valoresPermitidos + ".";
            }

            if (tipoEsperado != null) {
                return "El valor no tiene un formato válido para el tipo "
                        + tipoEsperado.getSimpleName() + ".";
            }

            return "El valor no tiene un formato válido para el tipo esperado.";
        }

        Class<?> tipoEsperado = exception.getTargetType();
        if (tipoEsperado != null) {
            return "La estructura recibida no coincide con el tipo esperado: "
                    + tipoEsperado.getSimpleName() + ".";
        }

        return "La estructura recibida no coincide con el tipo esperado.";
    }

    private UnrecognizedPropertyException buscarCampoDesconocido(
            Throwable exception) {
        for (Throwable causa = exception;
                causa != null;
                causa = causa.getCause()) {
            if (causa instanceof UnrecognizedPropertyException desconocida) {
                return desconocida;
            }
        }

        return null;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> manejarIntegridad(
            DataIntegrityViolationException exception) {

        String restriccion = buscarNombreRestriccion(exception);

        String mensaje = switch (restriccion == null ? "" : restriccion) {
            case "uk_empresa_nombre_ci" ->
                    "Ya existe una empresa con ese nombre";
            case "uk_competencia_codigo_ci" ->
                    "Ya existe una competencia con ese código";
            case "uk_competencia_nombre_ci" ->
                    "Ya existe una competencia con ese nombre";
            case "uk_factor_codigo_ci" ->
                    "Ya existe un factor con ese código";
            case "uk_factor_nombre_ci" ->
                    "Ya existe un factor con ese nombre";
            case "uk_factor_competencia_orden" ->
                    "Ya existe un factor con ese orden para esa competencia";
            case "uk_puesto_codigo_ci" ->
                    "Ya existe un puesto con ese código";
            case "uk_puesto_nombre_ci" ->
                    "Ya existe un puesto con ese nombre";
            case "uk_caracteristica_puesto_competencia" ->
                    "La competencia ya está asociada a ese puesto";
            case "uk_opcion_respuesta_nombre_ci" ->
                    "Ya existe una opción de respuesta con ese nombre";
            case "uk_pregunta_factor_nombre_ci" ->
                    "Ya existe una pregunta con ese nombre para el factor";
            case "uk_pregunta_factor_texto_ci" ->
                    "Ya existe una pregunta con ese texto para el factor";
            case "uk_candidato_numero_candidato" ->
                    "Ya existe un candidato con ese número";
            case "uk_candidato_nombre_apellido_ci" ->
                    "Ya existe un candidato con ese nombre y apellido";
            case "uk_cuestionario_candidato_abierto" ->
                    "El candidato ya tiene un cuestionario activo o en proceso";
            case "uk_respuesta_cuestionario_pregunta" ->
                    "El cuestionario ya tiene una respuesta para esa pregunta";
            case "uk_ponderacion_pregunta_detalle" ->
                    "Ya existe una ponderación para ese detalle de la pregunta";
            default ->
                    "La operación entra en conflicto con una restricción de datos";
        };

        ErrorResponse body = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                mensaje,
                List.of()
        );

        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    private String buscarNombreRestriccion(Throwable exception) {
        for (Throwable causa = exception;
                causa != null;
                causa = causa.getCause()) {

            if (causa instanceof ConstraintViolationException violacion) {
                return violacion.getConstraintName();
            }
        }

        return null;
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> manejarErrorDeNegocio(
            ResponseStatusException exception) {

        int status = exception.getStatusCode().value();
        String mensaje = exception.getReason() == null
                ? "No se pudo procesar la solicitud"
                : exception.getReason();

        ErrorResponse body = new ErrorResponse(
                status,
                mensaje,
                List.of()
        );

        return ResponseEntity.status(status).body(body);
    }
}

