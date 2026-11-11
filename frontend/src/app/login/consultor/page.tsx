import { UnavailablePage } from "@/shared/ui/unavailable-page";
export default function ConsultantLoginPage() { return <UnavailablePage title="Ingreso de consultor" useCase="Autenticación" reason="El endpoint existe, pero el backend todavía no valida credenciales ni devuelve un token." nextStep="Implementar la autenticación del consultor y devolver un token utilizable por el frontend." />; }
