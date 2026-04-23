import { Sidebar } from "@/components/dashboard/sidebar";

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <Sidebar role="instructor" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
