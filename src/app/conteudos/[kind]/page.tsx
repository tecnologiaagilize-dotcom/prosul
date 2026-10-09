import { ContentList } from "@/components/ContentList";
import { kindKeys, privateKinds, type Kind } from "@/lib/catalog";
import { notFound } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!kindKeys.includes(kind as Kind) || privateKinds.includes(kind as Kind))
    notFound();
  return <ContentList kind={kind as Kind} />;
}
