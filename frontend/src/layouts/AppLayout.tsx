import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // Make sure path is correct
import Footer from '../components/Footer'; // Make sure path is correct

function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 max-w-lg">
        {/* This is where Login, SignUp, etc. will render */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;