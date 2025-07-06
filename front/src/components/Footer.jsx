import React from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Dumbbell className="h-6 w-6 text-red-600" />
          <span className="text-lg font-bold text-white">Gym Club</span>
        </div>
        <p className="text-gray-400 mb-4 text-sm">
          © 2025 Gym Club. All rights reserved.
        </p>
        
      </div>
    </footer>
  );
};

export default Footer;