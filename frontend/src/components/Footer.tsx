// src/components/Footer.tsx
const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-8 py-4 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} Faithbliss. All rights reserved.
    </footer>
  );
};

export default Footer;