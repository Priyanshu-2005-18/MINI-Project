import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRobot, FaBars, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/hr-dashboard', label: 'HR Dashboard' },
    { to: '/student-tools', label: 'Student Tools' }
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center gap-2 text-xl font-bold hover:text-blue-100 transition-colors">
              <div className="bg-white text-blue-600 p-2 rounded-lg">
                <FaRobot className="text-xl" />
              </div>
              <span className="hidden sm:inline">Resume Bot</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <motion.div
                key={link.to}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Link
                  to={link.to}
                  className="relative group font-medium text-blue-50 hover:text-white transition-colors"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
          >
            {mobileOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: mobileOpen ? 1 : 0,
            height: mobileOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
        >
          <div className="flex flex-col gap-4 pb-4 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navigation;
