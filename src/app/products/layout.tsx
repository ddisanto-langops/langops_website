import { Suspense } from "react";

export default function ProductsLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children} {/* This renders the existing page.tsx content */}
      <Suspense fallback={null}>
        {modal}    {/* This renders the intercepted modal route content */}
      </Suspense>
    </>
  );
}
