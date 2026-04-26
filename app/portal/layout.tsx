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
