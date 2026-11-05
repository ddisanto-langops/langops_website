import "./globals.css";


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-[hsl(211,37%,21%)]">{children}</body>
    </html>
  );
}
