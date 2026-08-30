import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function MainLayout() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default MainLayout;




/*

What is <Outlet />?

This is an important React Router concept.

Think of it as:

MainLayout
│
├── Navbar
│
├── <Outlet />
│
└── Footer

The <Outlet /> is the placeholder where the current page will appear.

For example:

/user visits "/"
        ↓
MainLayout
        ↓
Navbar
        ↓
Outlet → Home
        ↓
Footer

If they visit:

/login

then:

MainLayout
        ↓
Navbar
        ↓
Outlet → Login
        ↓
Footer

So we don't duplicate:

<Navbar />
<Footer />

inside Home, Login, Register, etc.

*/