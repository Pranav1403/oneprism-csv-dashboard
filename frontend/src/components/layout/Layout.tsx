import type { ReactNode } from "react";

import Header from "./Header";


interface LayoutProps {
  children: ReactNode;
}


function Layout({
  children,
}: LayoutProps) {
  return (
    <div className="app-layout">

      <Header />

      <main className="main-content">
        {children}
      </main>

    </div>
  );
}


export default Layout;