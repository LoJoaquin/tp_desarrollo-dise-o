# Seguimiento de casos de uso

Documento de trabajo para comparar la implementación del backend con el enunciado del TP. Este estado se actualizó revisando el código presente en el proyecto el 04/11/2026. “Revisar” significa que hay una implementación base, pero todavía falta confirmar cada regla contra el enunciado y sus flujos alternativos.

## Estados

- **Pendiente:** el flujo principal no está implementado.
- **Parcial:** hay partes implementadas, pero faltan operaciones o reglas centrales.
- **Revisar:** hay implementación base; falta cotejar campos, reglas, errores y alternativas con el enunciado.

## Pendientes o incompletos

| CU | Caso de uso | Estado | Estado observado en el código |
|---|---|---|---|
| 001 | Autenticar usuario | Revisar (24/11) | Candidato y consultor autentican y reciben un JWT (`ROLE_CANDIDATO` / `ROLE_CONSULTOR`). El consultor se valida con un bind al LDAP (`LDAP_URL`, `LDAP_DN_PATRON`) o, sin LDAP, contra `CONSULTOR_USUARIO`/`CONSULTOR_CONTRASENIA`. Usuario en mayúsculas, máx. 15/20 caracteres. Falta decidir si los endpoints del consultor exigen el token (hoy `anyRequest().permitAll()`). |
| 006 | Importar candidatos | Revisar (24/11) | `POST /candidatos/importar` (multipart, campo `archivo`). CSV con `;` y encabezado; clave = nro candidato; devuelve creados/actualizados/eliminados. Es todo o nada: si una fila es inválida no se guarda nada. Los candidatos importados no tienen contraseña. |
| 007 | Exportar resultados | Revisar (24/11) | `POST /Reporte/evaluados/puestos/buscar`, `GET /Reporte/puestos/{id}/evaluados` y `GET /Reporte/puestos/{id}/exportar` (CSV con nombre `aaaa-mm-dd-hh-mm-Empresa-Función.csv`). Usa el modelo congelado del cuestionario. |
| 026 | Completar cuestionario | Parcial | Hay lógica para buscar el cuestionario, guardar respuestas parciales, finalizar bloques y calcular el resultado. Faltan validaciones de acceso/plazos y selección/asignación de preguntas; esos métodos todavía no están implementados. No se encontró un controlador para este flujo. |
| 027 | Emitir reporte comparativo | Revisar (24/11) | `GET /Reporte/puestos/{idPuesto}/cuestionarios/{idCuestionario}/comparativo`: requerido (ponderación mínima congelada) vs. obtenido por competencia. El frontend muestra grilla, gráfico e imprime. |
| 032 | Finalizar cuestionarios | Revisar (24/11) | `@Scheduled` cada 5 min (`CUESTIONARIO_FINALIZACION_CRON`): EN_PROCESO vencidos → INCOMPLETO, ACTIVO vencidos → SIN_CONTESTAR, con fecha de cambio de estado. Registro de ejecución (inicio/finalización/error) en `ejecucion_finalizacion_cuestionarios`; `POST /procesos/finalizar-cuestionarios/ejecutar` y `GET .../ejecuciones`. |
| 033 | Generar pregunta con IA | Pendiente | No se encontró la integración con IA ni el flujo de generación y carga. |

## Casos con implementación base para revisar

| CU | Caso de uso | Estado | Implementación y puntos pendientes |
|---|---|---|---|
| 008 | Gestionar puestos o funciones | Revisar | Hay endpoints para listar, buscar, consultar, reactivar, crear, modificar y dar de baja puestos. Falta cotejar filtros y navegación requeridos. |
| 009 | Dar de alta puesto o función | Revisar | Se validan código y nombre no vacíos, Empresa existente, al menos una característica, Competencia existente por característica y ponderación de 0 a 10. Hay índices únicos para código/nombre y para Puesto–Competencia. Falta cotejar los campos obligatorios con el enunciado y reforzar en base de datos las relaciones/campos que deban ser `NOT NULL`. |
| 010 | Modificar puesto o función | Revisar | `PATCH` admite nombre, descripción, Empresa y características; el código no se modifica. La operación es transaccional y reemplaza características si se envía esa lista. Falta cotejar campos modificables y semántica de listas omitidas/vacías con el enunciado. |
| 011 | Dar de baja puesto o función | Revisar | La baja es lógica (`estaActiva=false`). No hay una comprobación explícita de cuestionarios asociados; confirmar con el enunciado si debe bloquearse o permitirse. |
| 012 | Gestión de competencias | Revisar | Hay listado, búsqueda por ID, alta, modificación parcial, reactivación y baja. Falta confirmar filtros y comportamiento de navegación requeridos. |
| 013 | Dar de alta competencia | Revisar | Se exigen código y nombre; la unicidad de ambos se garantiza mediante índices en la base y mensajes en el handler. Descripción es opcional. |
| 014 | Modificar competencia | Revisar | `PATCH` permite nombre y descripción; se conservan los valores omitidos y se rechaza un PATCH vacío. Falta cotejar reglas y campos exactos con el enunciado. |
| 015 | Dar de baja competencia | Revisar | La baja es lógica. El enunciado requiere auditoría con usuario y fecha/hora; esa auditoría no está implementada. También falta confirmar reglas por dependencias. |
| 016 | Gestión de factores | Revisar | Hay listado, búsqueda por ID y por competencia, alta, modificación, reactivación y baja. Falta cotejar búsqueda/filtros y navegación. |
| 017 | Dar de alta factor | Revisar | Se exige código, nombre y una Competencia existente; código, nombre y orden por Competencia tienen índices únicos. Sigue pendiente validar que `nroOrden` sea obligatorio y positivo. |
| 018 | Modificar factor | Revisar | `PATCH` permite nombre, descripción, Competencia y orden; código no se modifica. Sigue pendiente rechazar `nroOrden` cero o negativo cuando se envía. Cotejar el conjunto de campos modificables con el enunciado. |
| 019 | Dar de baja factor | Revisar | La baja es lógica. No hay comprobación explícita de preguntas asociadas; confirmar el comportamiento requerido. |
| 020 | Gestionar preguntas | Revisar | Hay listado, consulta por ID, alta, modificación, reactivación y baja. No se encontró búsqueda por filtros; cotejar si el CU la requiere. |
| 021 | Dar de alta pregunta | Revisar | Se validan Competencia, Factor, nombre, texto, Opción y ponderaciones. Se comprueba que el Factor pertenezca a la Competencia y que los detalles correspondan a la Opción; las ponderaciones deben ser no negativas y sumar 10. Hay índices únicos para nombre y texto dentro del Factor. Falta cotejar reglas y formato del enunciado. |
| 022 | Modificar pregunta | Revisar | `PATCH` permite nombre, texto, descripción, Opción y ponderaciones; al cambiar Opción exige sus ponderaciones. Se validan los detalles y la unicidad en la base. Cotejar campos modificables, incluido si deben poder cambiar Factor o Competencia. |
| 023 | Dar de baja pregunta | Revisar | La baja es lógica. No hay comprobación explícita de asignaciones/respuestas en cuestionarios; confirmar las reglas de dependencia del enunciado. |
| 024 | Gestionar opciones de respuesta | Revisar | Hay listado de activas, consulta, alta, modificación y baja. Falta cotejar los filtros y acciones requeridos por el CU. |
| 025 | Evaluar a candidatos | Revisar | Implementado en `EvaluarCandidatoController` y coordinado por `EvaluarCandidatoService` mediante cuatro solicitudes HTTP: búsqueda parcial de candidatos por apellido, nombre y/o ID; selección de candidatos con rechazo si alguno tiene cuestionario `ACTIVO` o `EN_PROCESO`, seguida del listado de puestos activos con empresa; verificación del puesto y devolución de competencias con ponderación; confirmación que crea un cuestionario por candidato y devuelve sus datos y clave de ingreso. Para cada competencia exige al menos un factor activo con dos o más preguntas activas. La creación es transaccional y el índice parcial de la base impide más de un cuestionario abierto por candidato, permitiendo cuestionarios en estados terminales. Falta cotejar el contrato y los detalles de cada alternativa con el enunciado. Los candidatos existentes pueden no tener número de documento cargado; la confirmación valida tipo y número antes de crear. |
| 028 | Emitir orden de mérito | Revisar | Hay agrupación por estado, cálculo de puntajes, separación por cumplimiento de mínimos y orden por puntaje/apellido/nombre. `CalculoPuntajeHelper` promedia factores dentro de cada Competencia (divide la suma por 2) y luego promedia las Competencias para el puntaje final. Confirmar la fórmula con el enunciado. También falta cotejar selección de evaluaciones (“TODAS” u otro filtro) y formato/datos del reporte. |
| 029 | Dar de alta opción de respuesta | Revisar | Se exigen nombre, descripción y al menos un detalle. Los detalles requieren descripción, orden positivo, orden consecutivo desde 1 y descripciones no repetidas; hay índice único para nombre de Opción. Cotejar con los campos/reglas del enunciado. |
| 030 | Modificar opción de respuesta | Revisar | `PATCH` permite descripción y detalles. No permite agregar o quitar detalles; exige enviar los mismos IDs existentes. Cotejar ese comportamiento y la edición de detalles ya usados por preguntas. |
| 031 | Dar de baja opción de respuesta | Revisar | La baja es lógica y se rechaza si una Pregunta usa la Opción. Cotejar las reglas restantes del enunciado. |

## Validaciones y restricciones verificadas en el código

- Las creaciones de Candidato, Empresa, Competencia, Factor, Puesto, Pregunta, Opción y cuestionario están declaradas con respuesta `201 Created`. Las búsquedas POST continúan respondiendo `200`.
- Se agregaron restricciones únicas para Empresa, Competencia, Factor, Puesto, Característica de Puesto, Opción, Pregunta, Respuesta por Cuestionario–Pregunta y Ponderación por Pregunta–Detalle. Para Cuestionario, el índice único es parcial: limita a uno por candidato en estado `ACTIVO` o `EN_PROCESO`, pero permite varios cuestionarios en estados terminales. `ApiExceptionHandler` traduce sus nombres a mensajes de conflicto.
- Respuesta por Cuestionario–Pregunta conserva el comportamiento de actualizar la opción elegida si la respuesta ya existe; el índice impide duplicar la fila.
- Las validaciones de la solicitud están repartidas entre DTOs, gestores/servicios y la base. Varias relaciones JPA todavía no declaran `nullable=false`; revisar cuáles deben tener una garantía `NOT NULL` real en la base.
- Candidato sigue sin validar todos los campos del alta y reemplaza los campos al modificar aunque falten en el request. La entidad y los requests ahora modelan `numeroDocumento`; los registros existentes podrían tenerlo vacío y el CU025 lo valida antes de confirmar.
- La modificación de Empresa todavía asigna el nombre recibido sin validar que no sea nulo o blanco.
- Factor todavía no valida que `nroOrden` sea obligatorio/positivo al crear ni positivo al modificar.

## Cobertura observada

- Los endpoints de modificación parcial usan `PATCH` para Competencia, Factor, Puesto, Pregunta y Opción. Candidato y Empresa usan `PUT`; confirmar la semántica completa de sus requests contra el enunciado.
- Factor responde DTO de salida; Puesto responde DTO de salida. Pregunta, Competencia, Empresa y algunas operaciones de Candidato todavía devuelven entidades directamente; cotejar el contrato requerido.
- No se consideran cerrados los casos marcados “Revisar” hasta contrastar sus reglas con el enunciado, incluidos errores, campos, estados, asociaciones y flujos alternativos.
- El proyecto tiene CRUD para varias entidades, pero eso por sí solo no demuestra cobertura completa de los CU.
- En el PDF revisado aparecen especificados CU001 y CU006–CU033; no se encontraron especificaciones para CU002–CU005. Confirmar si están en otra versión o documento del trabajo.

## Orden sugerido de revisión

1. Cotejar CU008–025 y CU029–031 con sus enunciados, incluyendo campos y flujos alternativos.
2. Completar CU026, que es el flujo central de respuesta al cuestionario.
3. Confirmar la fórmula de puntaje, filtros y formato de CU028; después implementar CU027.
4. Implementar CU001, CU006, CU007, CU032 y CU033.
5. Confirmar con la cátedra o con otra versión del enunciado si corresponden CU002–CU005.
