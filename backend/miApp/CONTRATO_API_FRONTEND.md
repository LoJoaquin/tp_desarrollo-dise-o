# Contrato inicial API ↔ Frontend

Este documento describe lo que el frontend puede consumir del backend tal como está hoy. Se preparó leyendo los controllers, requests, responses y `SEGUIMIENTO_CASOS_DE_USO.md` el 11/11/2026. No propone cambios al backend ni inventa endpoints.

## Cómo leerlo

- **Disponible (base):** hay un endpoint, aunque el seguimiento del proyecto indica que falta cotejar reglas o alternativas con el enunciado.
- **Bloqueado:** existe una ruta o lógica parcial, pero no alcanza para integrar el flujo de punta a punta.
- Si una capacidad no tiene endpoint, el frontend la registra como pendiente; no muestra datos inventados ni simula que la operación se completó.

## Convenciones observadas

- La API no publica un prefijo común como `/api`; las rutas de abajo son rutas raíz.
- Las rutas mezclan mayúsculas y minúsculas. El frontend debe respetarlas exactamente.
- Los campos JSON siguen los nombres Java serializados, normalmente `camelCase`; los nombres con guion bajo de algunos requests (`competencia_id`) deben conservarse tal cual.
- Creaciones suelen responder `201`; búsquedas/lecturas y modificaciones, `200`; bajas lógicas responden `204` sin cuerpo.
- El handler común devuelve errores con `{ status, mensaje, errores }`; cada elemento de `errores` tiene `{ campo, mensaje }`. El frontend debe admitir `errores` vacío.
- No hay paginación ni OpenAPI/Swagger publicados en el proyecto.
- `spring.jackson.deserialization.fail-on-unknown-properties=true`: enviar campos que el request no reconoce provoca error.

## Inventario de endpoints actuales

| Módulo | Método y ruta | Entrada | Salida observada | Estado para frontend |
|---|---|---|---|---|
| Login candidato | `POST /login/candidato` | `{ tipo, documento, clave }` | `AutenticarResponse` esperado | **Bloqueado:** el servicio devuelve `null`; los enums de documento no tienen valores. |
| Login consultor | `POST /login/consultor` | `{ nombreUsuario, contrasenia }` | `AutenticarResponse` esperado | **Bloqueado:** el servicio devuelve `null`; no se validan credenciales. |
| Candidatos | `POST /candidatos` | `CandidatoCrearRequest` | `CandidatoCrearResponse` | Disponible (base). |
| Candidatos | `POST /candidatos/buscar` | `{ id?, nombre?, apellido? }` | Lista de entidades `Candidato` | Disponible (base); devuelve más campos que la búsqueda del flujo de evaluación. |
| Candidatos | `PUT /candidatos/{id}` | `CandidatoModificarRequest` | Entidad `Candidato` | Disponible (base); el servicio puede reemplazar datos omitidos. |
| Candidatos | `DELETE /candidatos/{id}` | Sin cuerpo | `204` | Disponible (base); baja lógica según el servicio. |
| Empresas | `POST /Empresa/crear` | `{ nombre }` | Entidad `Empresa` | Disponible (base). |
| Empresas | `PUT /Empresa/modificar/{id}` | `{ nombre }` | Entidad `Empresa` | Disponible (base); falta validar nombre vacío en backend. |
| Empresas | `POST /Empresa/buscar` | `{ id?, nombre? }` | Lista de entidades `Empresa` | Disponible (base); no hay `GET` de listado. |
| Competencias | `GET /Competencia` | — | Lista de entidades `Competencia` | Disponible (base). |
| Competencias | `GET /Competencia/{id}` | — | Entidad `Competencia` | Disponible (base). |
| Competencias | `POST /Competencia/crear` | `{ codigo, nombre, descripcion? }` | Entidad `Competencia` | Disponible (base). |
| Competencias | `PATCH /Competencia/modificar/{id}` | `{ nombre?, descripcion? }` | Entidad `Competencia` | Disponible (base); rechaza PATCH vacío. |
| Competencias | `PATCH /Competencia/{id}/reactivar` | — | Entidad `Competencia` | Disponible (base). |
| Competencias | `DELETE /Competencia/eliminar/{id}` | — | `204` | Disponible (base); baja lógica. |
| Factores | `GET /factor` | — | Lista de `FactorResponse` | Disponible (base). |
| Factores | `GET /factor/{id}` | — | `FactorResponse` | Disponible (base). |
| Factores | `GET /factor/competencia/{idCompetencia}` | — | Lista de `FactorResponse` | Disponible (base). |
| Factores | `POST /factor` | `FactorCrearRequest` | `FactorResponse` | Disponible (base); el backend aún no valida que `nroOrden` sea positivo. |
| Factores | `PATCH /factor/{id}` | `{ nombre?, descripcion?, competencia_id?, nroOrden? }` | `FactorResponse` | Disponible (base); falta validar orden positivo. |
| Factores | `PATCH /factor/{id}/reactivar` | — | `FactorResponse` | Disponible (base). |
| Factores | `DELETE /factor/{id}` | — | `204` | Disponible (base); baja lógica. |
| Preguntas | `GET /Pregunta` | — | Lista de entidades `Pregunta` | Disponible (base). |
| Preguntas | `GET /Pregunta/{id}` | — | Entidad `Pregunta` | Disponible (base). |
| Preguntas | `POST /Pregunta/crear` | IDs de competencia, factor y opción; texto/nombre; lista `ponderaciones` | Entidad `Pregunta` | Disponible (base); comprobar el JSON exacto de ponderaciones antes del formulario. |
| Preguntas | `PATCH /Pregunta/modificar/{id}` | Campos opcionales de pregunta y ponderaciones | Entidad `Pregunta` | Disponible (base); al cambiar opción requiere sus ponderaciones. |
| Preguntas | `PATCH /Pregunta/{id}/reactivar` | — | Entidad `Pregunta` | Disponible (base). |
| Preguntas | `DELETE /Pregunta/eliminar/{id}` | — | `204` | Disponible (base); baja lógica. |
| Opciones de respuesta | `GET /opcion-respuesta` | — | Lista de `OpcionRespuestaResponse` con detalles | Disponible (base); lista activas. |
| Opciones de respuesta | `GET /opcion-respuesta/{id}` | — | `OpcionRespuestaResponse` | Disponible (base). |
| Opciones de respuesta | `POST /opcion-respuesta` | Nombre, descripción y lista de detalles | `OpcionRespuestaResponse` | Disponible (base). |
| Opciones de respuesta | `PATCH /opcion-respuesta/{id}` | Descripción y detalles existentes | `OpcionRespuestaResponse` | Disponible (base); no permite agregar o quitar detalles. |
| Opciones de respuesta | `DELETE /opcion-respuesta/{id}` | — | `204` | Disponible (base); puede rechazarse si una pregunta la utiliza. |
| Puestos | `GET /Puesto` | — | Lista de `PuestoSalidaResponse` | Disponible (base). |
| Puestos | `GET /Puesto/{idPuesto}` | — | `PuestoSalidaResponse` | Disponible (base). |
| Puestos | `GET /Puesto/{idPuesto}/caracteristicas` | — | Lista de competencias y ponderaciones | Disponible (base). |
| Puestos | `POST /Puesto/buscar` | `{ codigo?, nombre?, empresa? }` | Lista de `PuestoSalidaResponse` | Disponible (base). |
| Puestos | `POST /Puesto/crear` | Puesto y `caracteristicasPuesto` | `PuestoSalidaResponse` | Disponible (base). El request actual contiene objetos `Empresa`/`CaracteristicasPuesto`, no solo IDs. |
| Puestos | `PATCH /Puesto/modificar/{id}` | Nombre, descripción, empresa y/o características | `PuestoSalidaResponse` | Disponible (base); la lista de características reemplaza las existentes si se envía. |
| Puestos | `PATCH /Puesto/{idPuesto}/reactivar` | — | `PuestoSalidaResponse` | Disponible (base). |
| Puestos | `DELETE /Puesto/baja/{id}` | — | `204` | Disponible (base); baja lógica. |
| Evaluación | `POST /evaluar-candidato/candidatos/buscar` | `{ nombre?, apellido?, id? }` | Lista `{ id, nombre, apellido }` | Disponible (base). |
| Evaluación | `POST /evaluar-candidato/candidatos/seleccion` | `{ idsCandidatos }` | Lista de puestos para elegir | Disponible (base); rechaza candidatos con cuestionario abierto. |
| Evaluación | `POST /evaluar-candidato/puesto/verificar` | `{ idPuesto }` | Lista `{ nombreCompetencia, ponderacion }` | Disponible (base). |
| Evaluación | `POST /evaluar-candidato/confirmar` | `{ idsCandidatos, idPuesto }` | Lista con candidato, tipo/número de documento y clave de ingreso | Disponible (base), responde `201`. |
| Reportes | `POST /Reporte/puestos/buscar` | Filtros de puesto | Lista `PuestoResponse` con candidatos y cantidad de evaluaciones completas | Disponible (base). |
| Reportes | `GET /Reporte/puestos/{idPuesto}/orden-merito` | — | Lista de grupos `{ estado, candidatos }` | Disponible (base); fórmula y filtros deben cotejarse con el enunciado. |

## Funcionalidades sin endpoint consumible

| Funcionalidad | Situación actual | Tratamiento del frontend |
|---|---|---|
| Completar cuestionario | Hay lógica en servicios para acceder, guardar respuestas parciales y finalizar bloques, pero no hay controller. | No conectar ni simular; dejar registrada como pendiente. |
| Reporte comparativo individual | No se encontró implementación del CU027. | Pendiente; no mostrar como disponible. |
| Importar candidatos CSV | No se encontró el flujo CU006. | Pendiente. |
| Exportar resultados CSV | No se encontró el flujo CU007. | Pendiente. |
| Cierre periódico de cuestionarios | No se encontró el proceso CU032. | Pendiente. |
| Generación de preguntas con IA | No se encontró el flujo CU033. | Pendiente. |

## Bloqueos y decisiones antes de integrar

1. **Autenticación:** los endpoints existen, pero ambos servicios devuelven `null`; `AutenticarResponse` no expone un getter del token. Además `SeguridadConfig` permite todas las solicitudes y no hay filtro JWT. El frontend no debe considerar autenticado al usuario hasta que el backend entregue un contrato funcional.
2. **Enums:** `TipoDocumento`, `Genero` y `Nacionalidad` no tienen valores. El frontend no puede construir opciones válidas basándose en ellos.
3. **Cuestionarios:** existe lógica de servicio, pero no una ruta HTTP que permita consumirla.
4. **CORS/origen:** no se encontró configuración CORS. Antes de ejecutar frontend y backend en puertos distintos habrá que confirmar si se habilita CORS en backend o si Next.js hará de proxy.
5. **Contrato sin especificación automática:** los tipos de frontend se derivarán inicialmente de los DTOs y entidades actuales; si cambia el backend, este documento debe actualizarse junto con ellos.

## Próxima etapa (todavía sin código)

Revisar este inventario y marcar cada módulo como: **integrar ahora**, **integrar con limitación** o **esperar backend**. Después acordar URL/origen del backend y el manejo de autenticación. Con esas decisiones cerradas recién se crea el esqueleto Next.js, los tipos, servicios, hooks y rutas no visuales.
