import EquipoManager from "@/components/EquipoManager";
import { requireStaffSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  await requireStaffSession();
  return <EquipoManager />;
}
