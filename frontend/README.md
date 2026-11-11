# Frontend de miApp

Frontend separado del backend Java para no mezclar dependencias ni scripts de Postman. Usa Next.js App Router, React, TypeScript y Tailwind CSS. Incluye pantallas funcionales para los endpoints disponibles y páginas de estado para los casos de uso cuyo soporte todavía falta en el backend.

## Requisitos y ejecución

- Node.js 20.9 o superior.
- Copiar `.env.example` a `.env.local` y ajustar `BACKEND_URL` si Spring Boot no corre en `http://localhost:8080`.
- Instalar dependencias con `npm install` y ejecutar `npm run dev`.
- `npm run typecheck` comprueba los tipos; `npm run build` genera la aplicación.

Las llamadas del navegador usan `/api/backend/...`. El Route Handler de Next.js reenvía la solicitud al backend para evitar depender de CORS del navegador. No reemplaza ni modifica el backend.

## Estructura

- `src/shared/api`: proxy cliente, errores normalizados y hooks genéricos de consultas/mutaciones.
- `src/shared/types`: tipos compartidos que reflejan enums del backend; los enums Java vacíos quedan como `string` para no inventar opciones.
- `src/shared/navigation/routes.ts`: catálogo de rutas de la aplicación.
- `src/shared/ui`: componentes reutilizables para botones, campos, tablas, paneles, estados y errores.
- `src/shared/layout`: navegación y estructura común de las páginas.
- `src/features`: contratos, servicios y hooks separados por módulo.
- `src/app/api/backend/[...path]`: proxy HTTP genérico hacia Spring Boot.
- `src/app`: páginas de módulos disponibles y estados explicativos para capacidades pendientes.

## Hooks

Cada hook expone datos/resultado, estado de carga y error. Las consultas incluyen `refetch`; las mutaciones ofrecen `mutate` y `isPending`. `ApiError` conserva status, ruta, método y errores de campo del backend.

## Limitaciones conocidas

- Login candidato y consultor se bloquean con `FeatureUnavailableError`: el backend todavía no autentica.
- Los hooks de cuestionario notifican que falta el controller/endpoints; no hacen llamadas a rutas inventadas.
- Importación/exportación CSV, comparación individual, cierre automático e IA muestran páginas con el faltante del backend.
- Hay DTOs que todavía requieren confirmar sus formas JSON exactas frente a una instancia del backend.

## Endpoints usados

Las rutas y nombres de campos se mantienen como los declara el backend (incluidas mayúsculas y el campo `competencia_id`). Ver `../CONTRATO_API_FRONTEND.md` para el inventario completo y las observaciones de compatibilidad.
