// Carga datos de prueba usando la API del backend (no escribe SQL directo),
// así cada paso también ejercita el caso de uso correspondiente.
//
// Uso (con el backend levantado):
//   node backend/miApp/database/cargar_datos_prueba.mjs
//
// Variables opcionales: API_URL (default http://localhost:8080),
// CONSULTOR_USUARIO / CONSULTOR_CONTRASENIA (default ADMIN / admin123).
//
// Si los datos ya están cargados (existe la competencia LID) no hace nada.

const API = (process.env.API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const USUARIO = process.env.CONSULTOR_USUARIO ?? "ADMIN";
const CONTRASENIA = process.env.CONSULTOR_CONTRASENIA ?? "admin123";
const CONTRASENIA_CANDIDATOS = "1234";

let tokenConsultor = null;

async function llamar(metodo, ruta, cuerpo, token = tokenConsultor) {
  const headers = { Accept: "application/json" };
  if (cuerpo !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const respuesta = await fetch(`${API}${ruta}`, {
    method: metodo,
    headers,
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!respuesta.ok) {
    throw new Error(`${metodo} ${ruta} -> ${respuesta.status}: ${datos?.mensaje ?? texto}`);
  }
  return datos;
}

const post = (ruta, cuerpo, token) => llamar("POST", ruta, cuerpo, token);
const get = (ruta) => llamar("GET", ruta);

// ------------------------------------------------------------------
// Catálogo
// ------------------------------------------------------------------

const ESCALA = ["Nunca", "A veces", "Frecuentemente", "Siempre"];
// Ponderación de cada opción (debe sumar 10 por pregunta).
const PONDERACION_ESCALA = [0, 2, 3, 5];

const COMPETENCIAS = [
  {
    codigo: "LID", nombre: "Liderazgo", descripcion: "Capacidad de guiar y motivar a otros.",
    factores: [
      { codigo: "LID-F1", nombre: "Toma de decisiones", preguntas: ["Cuando el equipo está trabado, propongo un camino y lo sostengo.", "Asumo la responsabilidad por las decisiones que tomo."] },
      { codigo: "LID-F2", nombre: "Motivación del equipo", preguntas: ["Reconozco públicamente los logros de mis compañeros.", "Ayudo a que cada integrante entienda el objetivo común."] },
    ],
  },
  {
    codigo: "COM", nombre: "Comunicación", descripcion: "Transmitir ideas en forma clara y escuchar activamente.",
    factores: [
      { codigo: "COM-F1", nombre: "Expresión oral", preguntas: ["Explico temas complejos con ejemplos simples.", "Adapto mi forma de hablar según quién me escucha."] },
      { codigo: "COM-F2", nombre: "Escucha activa", preguntas: ["Dejo terminar de hablar a los demás antes de responder.", "Hago preguntas para confirmar que entendí lo que me dijeron."] },
    ],
  },
  {
    codigo: "TEQ", nombre: "Trabajo en equipo", descripcion: "Colaborar con otros para alcanzar objetivos compartidos.",
    factores: [
      { codigo: "TEQ-F1", nombre: "Colaboración", preguntas: ["Ofrezco ayuda cuando un compañero está atrasado.", "Comparto la información que puede servirle al resto."] },
      { codigo: "TEQ-F2", nombre: "Manejo de conflictos", preguntas: ["Ante un desacuerdo busco una solución que sirva a ambas partes.", "Separo las diferencias personales de las de trabajo."] },
    ],
  },
  {
    codigo: "RES", nombre: "Resolución de problemas", descripcion: "Analizar situaciones y encontrar soluciones efectivas.",
    factores: [
      { codigo: "RES-F1", nombre: "Pensamiento analítico", preguntas: ["Divido un problema grande en partes más chicas.", "Busco datos antes de sacar conclusiones."] },
      { codigo: "RES-F2", nombre: "Creatividad", preguntas: ["Propongo alternativas distintas a las habituales.", "Pruebo enfoques nuevos cuando el método conocido no funciona."] },
    ],
  },
];

const EMPRESAS = ["Empresa Norte", "Tecno Sur"];

const PUESTOS = [
  { codigo: "AS-01", nombre: "Analista de sistemas", empresa: "Empresa Norte", descripcion: "Relevamiento y análisis de requerimientos.", requeridas: { LID: 4, COM: 3, TEQ: 3, RES: 3 } },
  { codigo: "LP-01", nombre: "Líder de proyecto", empresa: "Tecno Sur", descripcion: "Coordinación de equipos de desarrollo.", requeridas: { LID: 4, COM: 4, RES: 3 } },
];

// perfil: qué opción (1..4) elige en cada competencia al completar.
const CANDIDATOS = [
  { numero: "1001", apellido: "Gómez", nombre: "Lucía", doc: "30123456", genero: "M", nac: "AR", fecha: "1990-05-01", email: "lucia.gomez@mail.com", escolaridad: "Universitario", puesto: "AS-01", accion: "completar", perfil: { LID: 4, COM: 4, TEQ: 4, RES: 4 } },
  { numero: "1002", apellido: "Fernández", nombre: "Sofía", doc: "31222333", genero: "M", nac: "AR", fecha: "1992-08-15", email: "sofia.fernandez@mail.com", escolaridad: "Universitario", puesto: "AS-01", accion: "completar", perfil: { LID: 4, COM: 3, TEQ: 3, RES: 4 } },
  { numero: "1003", apellido: "Rodríguez", nombre: "Martín", doc: "28444555", genero: "H", nac: "UY", fecha: "1987-02-20", email: "martin.rodriguez@mail.com", escolaridad: "Terciario", puesto: "AS-01", accion: "completar", perfil: { LID: 3, COM: 3, TEQ: 3, RES: 3 } },
  { numero: "1004", apellido: "López", nombre: "Carla", doc: "35666777", genero: "M", nac: "AR", fecha: "1995-11-03", email: "carla.lopez@mail.com", escolaridad: "Secundario", puesto: "AS-01", accion: "completar", perfil: { LID: 2, COM: 2, TEQ: 3, RES: 2 } },
  { numero: "1005", apellido: "Martínez", nombre: "Diego", doc: "29888999", genero: "H", nac: "AR", fecha: "1985-06-12", email: "diego.martinez@mail.com", escolaridad: "Universitario", puesto: "LP-01", accion: "completar", perfil: { LID: 4, COM: 4, TEQ: 3, RES: 4 } },
  { numero: "1006", apellido: "Pérez", nombre: "Juan", doc: "33111222", genero: "H", nac: "AR", fecha: "1991-01-31", email: "juan.perez@mail.com", escolaridad: "Universitario", puesto: "AS-01", accion: "en_proceso", perfil: { LID: 3, COM: 3, TEQ: 3, RES: 3 } },
  { numero: "1007", apellido: "Sánchez", nombre: "Valeria", doc: "36222111", genero: "M", nac: "CL", fecha: "1996-09-09", email: "valeria.sanchez@mail.com", escolaridad: "Terciario", puesto: "LP-01", accion: "activo" },
  { numero: "1008", apellido: "Romero", nombre: "Pablo", doc: "27555444", genero: "H", nac: "AR", fecha: "1980-03-25", email: "pablo.romero@mail.com", escolaridad: "Secundario", puesto: "AS-01", accion: "activo" },
  { numero: "1009", apellido: "Díaz", nombre: "Ana", doc: "34777888", genero: "M", nac: "PY", fecha: "1993-12-01", email: "ana.diaz@mail.com", escolaridad: "Universitario", puesto: "AS-01", accion: "en_proceso", perfil: { LID: 2, COM: 3, TEQ: 4, RES: 3 } },
  { numero: "1010", apellido: "Torres", nombre: "Lucas", doc: "38999000", genero: "H", nac: "AR", fecha: "1998-04-18", email: "lucas.torres@mail.com", escolaridad: "Secundario", puesto: null, accion: "ninguna" },
];

// ------------------------------------------------------------------

async function main() {
  const login = await post("/login/consultor", { nombreUsuario: USUARIO, contrasenia: CONTRASENIA }, null);
  tokenConsultor = login.token;
  console.log(`✔ CU001 login consultor como ${login.usuario}`);

  const existentes = await get("/Competencia");
  if (existentes.some((c) => c.codigo === "LID")) {
    console.log("Los datos de prueba ya están cargados (existe la competencia LID). No se hace nada.");
    return;
  }

  const empresas = {};
  for (const nombre of EMPRESAS) {
    empresas[nombre] = (await post("/Empresa/crear", { nombre })).id;
  }
  console.log(`✔ ${EMPRESAS.length} empresas`);

  const opcion = await post("/opcion-respuesta", {
    nombre: "Escala de frecuencia",
    descripcion: "Frecuencia con la que el candidato realiza la conducta.",
    detalles: ESCALA.map((descripcion, i) => ({ ordenVisualizacion: i + 1, descripcion })),
  });
  const detallesPorOrden = Object.fromEntries(opcion.detalles.map((d) => [d.ordenVisualizacion, d.id]));
  console.log("✔ CU029 opción de respuesta con 4 detalles");

  const competencias = {};
  const competenciaPorTexto = {};
  let totalPreguntas = 0;
  for (const comp of COMPETENCIAS) {
    const creada = await post("/Competencia/crear", { codigo: comp.codigo, nombre: comp.nombre, descripcion: comp.descripcion });
    competencias[comp.codigo] = creada.id;
    for (const [indiceFactor, factor] of comp.factores.entries()) {
      const factorCreado = await post("/factor", {
        codigo: factor.codigo,
        nombre: factor.nombre,
        descripcion: `Factor ${factor.nombre} de ${comp.nombre}`,
        nroOrden: indiceFactor + 1,
        competencia_id: creada.id,
      });
      for (const [indicePregunta, texto] of factor.preguntas.entries()) {
        await post("/Pregunta/crear", {
          competenciaId: creada.id,
          idFactor: factorCreado.id,
          nombre: `${factor.codigo}-P${indicePregunta + 1}`,
          textoPregunta: texto,
          descripcion: null,
          idOpcionRespuesta: opcion.id,
          ponderaciones: PONDERACION_ESCALA.map((ponderacion, i) => ({ detalleOpcionRespuestaId: detallesPorOrden[i + 1], ponderacion })),
        });
        // El backend guarda los textos en mayúsculas.
        competenciaPorTexto[texto.toLocaleUpperCase("es-AR")] = comp.codigo;
        totalPreguntas++;
      }
    }
  }
  console.log(`✔ CU013/017/021 ${COMPETENCIAS.length} competencias, ${COMPETENCIAS.length * 2} factores, ${totalPreguntas} preguntas`);

  const puestos = {};
  for (const p of PUESTOS) {
    const creado = await post("/Puesto/crear", {
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion,
      empresa: { id: empresas[p.empresa] },
      caracteristicasPuesto: Object.entries(p.requeridas).map(([codigo, ponderacion]) => ({ ponderacion, competencia: { id: competencias[codigo] } })),
    });
    puestos[p.codigo] = creado.id;
  }
  console.log(`✔ CU009 ${PUESTOS.length} puestos`);

  const idsCandidato = {};
  for (const c of CANDIDATOS) {
    const creado = await post("/candidatos", {
      numeroCandidato: c.numero, nombre: c.nombre, apellido: c.apellido,
      tipoDocumento: "DNI", numeroDocumento: c.doc, contrasenia: CONTRASENIA_CANDIDATOS,
      fechaNacimiento: c.fecha, genero: c.genero, nacionalidad: c.nac,
      email: c.email, escolaridad: c.escolaridad,
    });
    idsCandidato[c.numero] = creado.id;
  }
  console.log(`✔ Alta de ${CANDIDATOS.length} candidatos`);

  // CU025: un lote de evaluación por puesto.
  const claves = {};
  for (const p of PUESTOS) {
    const lote = CANDIDATOS.filter((c) => c.puesto === p.codigo);
    const ids = lote.map((c) => idsCandidato[c.numero]);
    await post("/evaluar-candidato/candidatos/seleccion", { idsCandidatos: ids });
    await post("/evaluar-candidato/puesto/verificar", { idPuesto: puestos[p.codigo] });
    const creados = await post("/evaluar-candidato/confirmar", { idsCandidatos: ids, idPuesto: puestos[p.codigo] });
    for (const creado of creados) {
      const candidato = lote.find((c) => c.doc === creado.numeroDocumento);
      claves[candidato.numero] = creado.claveIngreso;
    }
  }
  console.log("✔ CU025 cuestionarios generados");

  // CU026: los candidatos responden.
  for (const c of CANDIDATOS.filter((x) => x.accion === "completar" || x.accion === "en_proceso")) {
    const sesion = await post("/login/candidato", { tipo: "DNI", documento: c.doc, contrasenia: CONTRASENIA_CANDIDATOS }, null);
    let bloque = await post("/cuestionario/acceder", { claveIngreso: claves[c.numero] }, sesion.token);
    const elegir = (pregunta) => {
      const competencia = competenciaPorTexto[pregunta.texto.toLocaleUpperCase("es-AR")];
      if (!competencia) throw new Error(`No se reconoce la pregunta "${pregunta.texto}"`);
      const orden = c.perfil[competencia];
      return { idPreguntaModelo: pregunta.idPreguntaModelo, idOpcionModelo: pregunta.opciones.find((o) => o.ordenVisualizacion === orden).idOpcionModelo };
    };

    if (c.accion === "en_proceso") {
      // Responde solo la mitad del primer bloque y deja el cuestionario en proceso.
      const parcial = bloque.preguntas.slice(0, Math.max(1, Math.floor(bloque.preguntas.length / 2))).map(elegir);
      await llamar("PATCH", `/cuestionario/${bloque.idCuestionario}/respuestas`, { respuestas: parcial }, sesion.token);
      continue;
    }

    while (bloque.estado !== "COMPLETO") {
      bloque = await post(`/cuestionario/${bloque.idCuestionario}/finalizar-bloque`, { respuestas: bloque.preguntas.map(elegir) }, sesion.token);
    }
    console.log(`  ${c.apellido}, ${c.nombre}: COMPLETO, puntaje ${bloque.puntajeFinal?.toFixed(2)}, ${bloque.cumplePonderacionMinima ? "cumple" : "no cumple"} el mínimo`);
  }
  console.log("✔ CU026 cuestionarios respondidos");

  console.log("\nDatos de acceso de los candidatos (contraseña de todos: 1234, tipo DNI):");
  for (const c of CANDIDATOS) {
    const estado = { completar: "COMPLETO", en_proceso: "EN_PROCESO", activo: "ACTIVO", ninguna: "sin evaluación" }[c.accion];
    const clave = c.accion === "en_proceso" || c.accion === "activo" ? `  clave cuestionario: ${claves[c.numero]}` : "";
    console.log(`  ${c.apellido.padEnd(10)} ${c.nombre.padEnd(8)} DNI ${c.doc}  ${estado.padEnd(14)}${clave}`);
  }
}

main().catch((error) => {
  console.error("✘", error.message);
  process.exit(1);
});
