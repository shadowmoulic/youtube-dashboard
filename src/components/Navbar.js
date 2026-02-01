import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Reuse existing styles

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="logo-container">
                    <div className="logo-icon">▲</div>
                    <span className="logo-text">Vidoryx</span>
                </Link>
                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/how-it-works" className="nav-link">How It Works</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/contact" className="nav-link">Contact</Link>
                    <a href="https://www.linkedin.com/in/sayak-moulic-seo-for-coaches/" target="_blank" rel="noopener noreferrer" className="nav-cta">
                        Work With Me
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
