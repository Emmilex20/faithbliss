// src/components/Header.tsx
import { Heart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto p-4 flex justify-between items-center max-w-lg">
        {/* Logo/App Name */}
        <Link to="/" className="text-2xl font-bold text-pink-600 flex items-center">
          <Heart className="w-6 h-6 mr-1" />
          Faithbliss
        </Link>

        {/* Navigation/User Icon */}
        <nav>
          <Link to="/login" className="p-2 rounded-full hover:bg-pink-100 transition duration-150">
            <User className="w-6 h-6 text-gray-700" />
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;