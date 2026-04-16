import { Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Sparkles size={20} className="text-accent" />
            <span className="font-heading font-bold text-text">
              Spiritual<span className="text-primary-light">Tech</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <Link to="/" className="hover:text-text transition-colors">
              Explore
            </Link>
            <Link to="/dashboard" className="hover:text-text transition-colors">
              Dashboard
            </Link>
            <Link to="/profile" className="hover:text-text transition-colors">
              Profile
            </Link>
          </div>

          {/* Attribution */}
          <p className="text-xs text-text-dim flex items-center gap-1">
            Made with <Heart size={12} className="text-danger" /> for SpiritualTech
          </p>
        </div>
      </div>
    </footer>
  );
}
