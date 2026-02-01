import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            borderTop: '1px solid var(--border)',
            padding: '40px 24px',
            marginTop: '80px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/privacy" style={{ margin: '0 12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy Policy</Link>
                    <Link to="/terms" style={{ margin: '0 12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms of Service</Link>
                    <Link to="/contact" style={{ margin: '0 12px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Contact</Link>
                </div>
                <p>Created by <a href="https://www.linkedin.com/in/sayak-moulic-seo-for-coaches/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sayak Moulic</a> · SEO & AI Automation Specialist</p>
                <p style={{ marginTop: '8px' }}>© 2026 Vidoryx. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
