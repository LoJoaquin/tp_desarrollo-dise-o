import { ApiError } from "@/shared/api/errors";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend").replace(/\/$/, "");

function route(path: string) {
  return `${apiBase}/${path.replace(/^\//, "")}`;
}

function messageForHttpError(status: number, backendMessage?: string): string {
  const safeBackendMessage = backendMessage?.trim();
  switch (status) {
    case 400:
      return safeBackendMessage || "Revisá los datos ingresados y volvé a intentar.";
    case 401:
      return safeBackendMessage || "No se pudo verificar tu acceso. Iniciá sesión nuevamente.";
    case 403:
      return "No tenés permiso para realizar esta acción.";
    case 404:
      return safeBackendMessage || "No encontramos lo que buscabas o ya no está disponible.";
    case 409:
      return safeBackendMessage || "La operación entra en conflicto con datos existentes.";
    case 422:
      return safeBackendMessage || "No se pudieron procesar algunos datos. Revisalos e intentá de nuevo.";
    default:
      if (status >= 500) {
        return "Ocurrió un problema en el servidor. Probá de nuevo más tarde.";
      }
      return "No se pudo completar la solicitud. Volvé a intentarlo.";
  }
}

export async function request<TResponse>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  token?: string,
): Promise<TResponse> {
  const url = route(path);
  let response: Response;

  try {
    const headers: Record<string, string> = body === undefined
      ? { Accept: "application/json" }
      : { Accept: "application/json", "Content-Type": "application/json" };
    const bearer = token ?? consultantToken();
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
    response = await fetch(url, {
      method,
      cache: "no-store",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw connectionError(method, path);
  }

  if (response.status === 204) return undefined as TResponse;

  const payload = await readPayload(response);

  if (!response.ok) throw errorFromResponse(response, payload, method, path);

  return payload as TResponse;
}

// Token del consultor guardado al iniciar sesión (CU001). Se envía en todas
// las solicitudes que no indiquen otro token explícito.
function consultantToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.sessionStorage.getItem("consultant-session");
    if (!raw) return undefined;
    const session = JSON.parse(raw) as { token?: unknown };
    return typeof session.token === "string" ? session.token : undefined;
  } catch {
    return undefined;
  }
}

function connectionError(method: HttpMethod, path: string) {
  return new ApiError({
    message: "No se pudo conectar con la API. Revisá que el backend esté iniciado.",
    status: 0,
    method,
    path,
  });
}

async function readPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("json")
    ? response.json().catch(() => null)
    : response.text().catch(() => "");
}

/** Envía un archivo como multipart/form-data (por ejemplo, el CSV del CU006). */
export async function uploadFile<TResponse>(path: string, fieldName: string, file: File): Promise<TResponse> {
  const form = new FormData();
  form.append(fieldName, file);
  const headers: Record<string, string> = { Accept: "application/json" };
  const bearer = consultantToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  let response: Response;
  try {
    response = await fetch(route(path), { method: "POST", cache: "no-store", headers, body: form });
  } catch {
    throw connectionError("POST", path);
  }
  const payload = await readPayload(response);
  if (!response.ok) throw errorFromResponse(response, payload, "POST", path);
  return payload as TResponse;
}

/** Descarga un archivo y devuelve su contenido y el nombre sugerido por el backend. */
export async function downloadFile(path: string): Promise<{ blob: Blob; fileName: string | null }> {
  const headers: Record<string, string> = {};
  const bearer = consultantToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;
  let response: Response;
  try {
    response = await fetch(route(path), { method: "GET", cache: "no-store", headers });
  } catch {
    throw connectionError("GET", path);
  }
  if (!response.ok) throw errorFromResponse(response, await readPayload(response), "GET", path);
  return { blob: await response.blob(), fileName: fileNameFromDisposition(response.headers.get("content-disposition")) };
}

function fileNameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      // Se intenta con el nombre simple.
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

function errorFromResponse(response: Response, payload: unknown, method: HttpMethod, path: string): ApiError {
  const apiPayload = payload && typeof payload === "object"
    ? payload as { mensaje?: unknown; errores?: unknown }
    : undefined;
  const fieldErrors = (response.status === 400 || response.status === 422) && Array.isArray(apiPayload?.errores)
    ? apiPayload.errores.filter((item): item is { campo: string; mensaje: string } =>
        !!item && typeof item === "object" &&
        typeof (item as { campo?: unknown }).campo === "string" &&
        typeof (item as { mensaje?: unknown }).mensaje === "string")
    : [];

  return new ApiError({
    message: messageForHttpError(
      response.status,
      typeof apiPayload?.mensaje === "string" ? apiPayload.mensaje : undefined,
    ),
    status: response.status,
    method,
    path,
    fieldErrors,
  });
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T, B = unknown>(path: string, body: B) => request<T>("POST", path, body),
  postWithToken: <T, B = unknown>(path: string, body: B, token: string) => request<T>("POST", path, body, token),
  patchWithToken: <T, B = unknown>(path: string, body: B, token: string) => request<T>("PATCH", path, body, token),
  put: <T, B = unknown>(path: string, body: B) => request<T>("PUT", path, body),
  patch: <T, B = unknown>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};
