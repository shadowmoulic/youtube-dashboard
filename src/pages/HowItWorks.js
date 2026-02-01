import React from 'react';
import { Link } from 'react-router-dom';
import '../components/Dashboard.css';

const HowItWorks = () => {
    return (
        <div className="dashboard-container">
            <div className="legal-page">
                <h1>How Vidoryx Works</h1>
                <p className="subtitle">Discover how we analyze your YouTube videos and provide actionable SEO insights</p>

                <div className="how-it-works-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3>Enter Your Channel</h3>
                        <p>Simply paste your YouTube channel URL, @handle, or channel ID. We support all YouTube channel formats.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3>AI Analysis</h3>
                        <p>Our AI analyzes your last 3 months of videos, examining titles, descriptions, tags, thumbnails, and engagement metrics.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3>Performance Ranking</h3>
                        <p>We identify your worst-performing videos using a proprietary algorithm that considers views, engagement, and SEO score.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">4</div>
                        <h3>Specific Recommendations</h3>
                        <p>Get exact, copy-paste-ready recommendations for each video. No vague advice—just actionable changes you can implement immediately.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">5</div>
                        <h3>Competitive Insights</h3>
                        <p>See what top performers in your niche are doing differently and how you can apply those strategies.</p>
                    </div>

                    <div className="step-card">
                        <div className="step-number">6</div>
                        <h3>Download Report</h3>
                        <p>Get a professional PDF report with all recommendations, perfect for sharing with your team or keeping for reference.</p>
                    </div>
                </div>

                <div className="cta-section">
                    <h2>Ready to Boost Your Rankings?</h2>
                    <Link to="/" className="download-btn">
                        Analyze My Channel Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;
