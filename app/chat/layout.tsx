export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Main Content - Full height chat interface without header/footer */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
