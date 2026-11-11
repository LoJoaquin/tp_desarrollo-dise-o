import { UnavailablePage } from "@/shared/ui/unavailable-page";
export default function CandidateImportPage() { return <UnavailablePage title="Importar candidatos" useCase="Carga masiva" reason="El backend no implementa la importación de candidatos desde CSV." nextStep="Definir el formato de columnas, validar filas y publicar un endpoint de importación con el resultado por fila." />; }
