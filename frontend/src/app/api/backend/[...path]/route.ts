import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const backendBase = (process.env.BACKEND_URL ?? "http://localhost:8080").replace(/\/$/, "");
  const encodedPath = path.map((part) => encodeURIComponent(part)).join("/");
  const target = new URL(`${backendBase}/${encodedPath}`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("accept-encoding");

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD", "OPTIONS"].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return NextResponse.json(
      {
        status: 502,
        mensaje: "No se pudo conectar con el backend.",
        errores: [],
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("content-length");
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("transfer-encoding");
  responseHeaders.delete("connection");

  if (upstream.status === 204 || request.method === "HEAD") {
    return new NextResponse(null, { status: upstream.status, headers: responseHeaders });
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
