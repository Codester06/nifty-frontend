import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Facebook, Instagram, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import Logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info & About Us */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={Logo}
                alt="NiftyBulk"
                className="w-20 h-10 object-contain filter invert brightness-150"
              />
            </div>
            <h3 className="text-white dark:text-gray-200 font-semibold text-lg mb-3">About Us</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed mb-4">
              NiftyBulk is your trusted partner in stock market investing, and help you make informed investment decisions.
            </p>

            
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-gray-200 font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200 flex items-center"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200 flex items-center"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200 flex items-center"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link
                  to="/tnC"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            {/* <h3 className="text-white dark:text-gray-200 font-semibold mb-4">Legal & Compliance</h3> */}
            {/* Social Media Icons */}
            <div>
              <h4 className="text-white dark:text-gray-200 font-medium mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <a
                  href="https://twitter.com/niftybulk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://linkedin.com/company/niftybulk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com/niftybulk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/niftybulk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-white dark:text-gray-200 font-semibold mb-4">Contact Us</h3>
            <div className="space-y-4">
              {/* Customer Support */}
              <div>
                <h4 className="text-white dark:text-gray-200 font-medium mb-2 text-sm">Customer Support</h4>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <a
                      href="mailto:support@niftybulk.com"
                      className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      support@niftybulk.com
                    </a>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <a
                      href="tel:+911800123456"
                      className="text-sm text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      1800-123-456 (Toll Free)
                    </a>
                  </li>
                </ul>
              </div>


              {/* Office Address */}
              <div>
                <h4 className="text-white dark:text-gray-200 font-medium mb-2 text-sm">Registered Office</h4>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                    NiftyBulk Securities Pvt. Ltd.<br />
                    BKC,
                    Mumbai, Maharashtra 400051
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
