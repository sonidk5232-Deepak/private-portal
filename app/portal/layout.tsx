export const dynamic = "force-dynamic";
export const revalidate = 0;
import SecuritySessionWatch from "@/components/SecuritySessionWatch";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SecuritySessionWatch />
      {children}
    </>
  );
}
