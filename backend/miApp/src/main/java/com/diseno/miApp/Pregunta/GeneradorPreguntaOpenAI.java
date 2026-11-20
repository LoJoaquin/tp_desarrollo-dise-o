package com.diseno.miApp.Pregunta;

import com.diseno.miApp.Factor.Factor;
import com.diseno.miApp.Pregunta.PreguntaIADTO.Borrador;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Component
public class GeneradorPreguntaOpenAI {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeneradorPreguntaOpenAI(
            ObjectMapper objectMapper,
            @Value("${openai.api-key:}") String apiKey,
            @Value("${openai.model:gpt-6.2-sol}") String model) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public Borrador generar(Factor factor, String indicaciones) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Falta configurar OPENAI_API_KEY en el backend"
            );
        }

        String instrucciones = """
                Generá una sola pregunta de evaluación laboral en español.
                Debe evaluar una conducta relacionada directamente con el factor.
                La pregunta debe ser clara y evaluar un solo aspecto.
                No inventes datos de personas ni nombres de candidatos.

                Generá exactamente cinco respuestas posibles, ordenadas de menor
                a mayor nivel de evidencia de la conducta. Cada respuesta debe
                tener una ponderación entera entre 0 y 10. La suma de las cinco
                ponderaciones debe ser exactamente 10. Las descripciones deben
                ser distintas y corresponder al factor.

                Devolvé solo los campos solicitados en el esquema estructurado.
                Si no corresponde una descripción opcional, devolvé texto vacío.
                """;

        String entrada = """
                Competencia: %s
                Descripción de la competencia: %s
                Factor: %s
                Descripción del factor: %s
                Indicaciones adicionales: %s
                """.formatted(
                factor.getCompetencia().getNombre(),
                valor(factor.getCompetencia().getDescripcion()),
                factor.getNombre(),
                valor(factor.getDescripcion()),
                valor(indicaciones)
        );

        Map<String, Object> cuerpo = Map.of(
                "model", model,
                "instructions", instrucciones,
                "input", entrada,
                "max_output_tokens", 1400,
                "text", Map.of(
                        "format", Map.of(
                                "type", "json_schema",
                                "name", "pregunta_generada",
                                "strict", true,
                                "schema", esquema()
                        )
                )
        );

        try {
            RespuestaOpenAI respuesta = restClient.post()
                    .uri("/responses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(headers -> headers.setBearerAuth(apiKey))
                    .body(cuerpo)
                    .retrieve()
                    .body(RespuestaOpenAI.class);

            String texto = extraerTexto(respuesta);
            return objectMapper.readValue(texto, Borrador.class);
        } catch (RestClientResponseException | ResourceAccessException error) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "No se pudo obtener una pregunta desde OpenAI"
            );
        } catch (ResponseStatusException error) {
            throw error;
        } catch (Exception error) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "OpenAI no devolvió una pregunta con el formato esperado"
            );
        }
    }

    private String extraerTexto(RespuestaOpenAI respuesta) {
        if (respuesta == null || respuesta.output() == null) {
            throw new IllegalStateException("Respuesta vacía de OpenAI");
        }

        for (ElementoSalida elemento : respuesta.output()) {
            if (elemento.content() == null) continue;

            for (ContenidoSalida contenido : elemento.content()) {
                if ("refusal".equals(contenido.type())) {
                    throw new ResponseStatusException(
                            HttpStatus.UNPROCESSABLE_ENTITY,
                            "OpenAI no pudo generar esta pregunta"
                    );
                }

                if ("output_text".equals(contenido.type())
                        && contenido.text() != null
                        && !contenido.text().isBlank()) {
                    return contenido.text();
                }
            }
        }

        throw new IllegalStateException(
                "La respuesta de OpenAI no contiene texto"
        );
    }

    private Map<String, Object> esquema() {
        Map<String, Object> detalle = Map.of(
                "type", "object",
                "properties", Map.of(
                        "ordenVisualizacion", Map.of("type", "integer"),
                        "descripcion", Map.of("type", "string"),
                        "ponderacion", Map.of("type", "integer")
                ),
                "required", List.of(
                        "ordenVisualizacion",
                        "descripcion",
                        "ponderacion"
                ),
                "additionalProperties", false
        );

        return Map.of(
                "type", "object",
                "properties", Map.of(
                        "nombre", Map.of("type", "string"),
                        "textoPregunta", Map.of("type", "string"),
                        "descripcion", Map.of("type", "string"),
                        "nombreOpcionRespuesta", Map.of("type", "string"),
                        "descripcionOpcionRespuesta", Map.of("type", "string"),
                        "detalles", Map.of(
                                "type", "array",
                                "items", detalle
                        )
                ),
                "required", List.of(
                        "nombre",
                        "textoPregunta",
                        "descripcion",
                        "nombreOpcionRespuesta",
                        "descripcionOpcionRespuesta",
                        "detalles"
                ),
                "additionalProperties", false
        );
    }

    private String valor(String texto) {
        return texto == null || texto.isBlank()
                ? "Sin descripción" : texto;
    }

    private record RespuestaOpenAI(List<ElementoSalida> output) {}
    private record ElementoSalida(String type, List<ContenidoSalida> content) {}
    private record ContenidoSalida(String type, String text, String refusal) {}
}
