import React from 'react';
import '../components/Dashboard.css';

const Contact = () => {
    return (
        <div className="dashboard-container">
            <div className="legal-page">
                <h1>Contact Us</h1>
                <p className="subtitle">Have questions? We'd love to hear from you!</p>

                <div className="contact-content">
                    <div className="contact-card">
                        <h2>📧 Email</h2>
                        <p>For general inquiries, support, or feedback:</p>
                        <a href="mailto:moulicsayak@gmail.com" className="contact-link">moulicsayak@gmail.com</a>
                    </div>

                    <div className="contact-card">
                        <h2>💼 LinkedIn</h2>
                        <p>Connect for professional inquiries or consulting:</p>
                        <a href="https://www.linkedin.com/in/sayak-moulic-seo-for-coaches/" target="_blank" rel="noopener noreferrer" className="contact-link">
                            Sayak Moulic on LinkedIn
                        </a>
                    </div>

                    <div className="contact-card">
                        <h2>🚀 Business Inquiries</h2>
                        <p>Interested in custom SEO solutions or automation services?</p>
                        <p>Email me with "Business Inquiry" in the subject line, and I'll get back to you within 24 hours.</p>
                    </div>

                    <div className="faq-section">
                        <h2>Frequently Asked Questions</h2>

                        <div className="faq-item">
                            <h3>Is Vidoryx really free?</h3>
                            <p>Yes! Vidoryx is completely free to use. No credit card required, no hidden fees.</p>
                        </div>

                        <div className="faq-item">
                            <h3>How accurate are the recommendations?</h3>
                            <p>Our recommendations are based on proven SEO best practices and data from thousands of successful YouTube videos. However, results may vary based on your niche and content quality.</p>
                        </div>

                        <div className="faq-item">
                            <h3>Can I use this for client channels?</h3>
                            <p>Absolutely! Many agencies and consultants use Vidoryx to analyze their clients' channels and generate professional reports.</p>
                        </div>

                        <div className="faq-item">
                            <h3>Do you store my channel data?</h3>
                            <p>No. We only access public data temporarily to generate your analysis. Nothing is stored on our servers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
