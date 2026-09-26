import Sidebar from "./Sidebar";

export default function AppShell({ children }) {
  return (
    <div className="flex h-full min-h-screen bg-[#F5F6F8]">
      <Sidebar />
      <main className="flex-1 ml-56 px-8 py-6 min-h-screen">
        {children}
      </main>
    </div>
  );
}
