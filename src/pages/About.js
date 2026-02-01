import React from 'react';
import '../components/Dashboard.css';

const About = () => {
    return (
        <div className="dashboard-container">
            <div className="legal-page">
                <h1>About Vidoryx</h1>
                <p className="subtitle">Empowering content creators with data-driven SEO insights</p>

                <div className="about-content">
                    <h2>Our Mission</h2>
                    <p>Vidoryx was created to democratize YouTube SEO. We believe every content creator deserves access to professional-grade analytics and recommendations, not just those who can afford expensive consultants.</p>

                    <h2>What Makes Us Different</h2>
                    <ul>
                        <li><strong>Specific, Not Generic:</strong> We don't just tell you "your title is too short." We give you exact alternatives to copy and paste.</li>
                        <li><strong>AI-Powered Analysis:</strong> Our algorithms analyze thousands of data points to provide recommendations backed by real performance data.</li>
                        <li><strong>Competitive Intelligence:</strong> See what's working for top performers in your niche.</li>
                        <li><strong>Completely Free:</strong> No hidden costs, no subscriptions. Just honest, helpful SEO advice.</li>
                    </ul>

                    <h2>Created By Sayak Moulic</h2>
                    <p>Vidoryx is developed and maintained by Sayak Moulic, an SEO and AI Automation specialist with years of experience helping coaches and content creators grow their online presence.</p>

                    <p>Sayak specializes in:</p>
                    <ul>
                        <li>YouTube SEO and Growth Strategies</li>
                        <li>AI-Powered Content Optimization</li>
                        <li>Marketing Automation for Coaches</li>
                        <li>Data-Driven Performance Analysis</li>
                    </ul>

                    <div className="creator-cta">
                        <h3>Need Personalized Help?</h3>
                        <p>If you're looking for 1-on-1 SEO consulting or custom automation solutions, let's connect!</p>
                        <a href="https://www.linkedin.com/in/sayak-moulic-seo-for-coaches/" target="_blank" rel="noopener noreferrer" className="download-btn">
                            Connect on LinkedIn
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
