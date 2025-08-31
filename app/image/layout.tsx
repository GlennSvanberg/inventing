export default function ImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content - Allow natural scrolling */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
