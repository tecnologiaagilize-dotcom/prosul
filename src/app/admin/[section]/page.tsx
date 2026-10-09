import { AdminPanel } from "@/components/AdminPanel";
import { kindKeys } from "@/lib/catalog";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (![...kindKeys, "members", "audit", "collect"].includes(section))
    notFound();
  return <AdminPanel key={section} section={section} />;
}
