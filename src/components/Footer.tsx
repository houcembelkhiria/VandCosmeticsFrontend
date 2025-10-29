import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">VANDA Cosmetics</h3>
            <p className="text-sm text-gray-600">
              Cosmétiques de luxe sélectionnés pour l'enthousiaste de beauté moderne.
            </p>
             <div className="flex space-x-4">
               <a 
                 href="https://www.facebook.com/profile.php?id=61571190816771&locale=fr_FR"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 <Button variant="ghost" size="icon">
                   <Facebook className="h-4 w-4" />
                 </Button>
               </a>
               <a 
                 href="https://www.instagram.com/_vanda_cosmetic"
                 target="_blank"
                 rel="noopener noreferrer"
               >
                 <Button variant="ghost" size="icon">
                   <Instagram className="h-4 w-4" />
                 </Button>
               </a>
             </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-sm text-gray-600 hover:text-gray-900">
                  Produits
                </Link>
              </li>
            </ul>
          </div>



          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">contact@vanda.tn</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">+216 21 344 781</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Tunis, Tunisie</span>
              </div>
            </div>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © 2025 VANDA Cosmetics. Tous droits réservés.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              Politique de confidentialité
            </Link>
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700">
              Conditions d'utilisation
            </Link>
            <Link to="/shipping" className="text-sm text-gray-500 hover:text-gray-700">
              Livraison
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
