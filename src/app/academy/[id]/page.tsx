import { CourseViewer } from "@/components/CourseViewer";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <CourseViewer id={(await params).id} />;
}
