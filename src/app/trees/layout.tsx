const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <main className="mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
