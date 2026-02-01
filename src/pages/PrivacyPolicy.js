import React from 'react';
import '../components/Dashboard.css';

const PrivacyPolicy = () => {
    return (
        <div className="dashboard-container">
            <div className="legal-page">
                <h1>Privacy Policy</h1>
                <p className="last-updated">Last updated: February 1, 2026</p>

                <h2>1. Information We Collect</h2>
                <p>Vidoryx collects minimal information to provide our services:</p>
                <ul>
                    <li><strong>Name and Email:</strong> When you download a report, we collect your name and email address.</li>
                    <li><strong>YouTube Channel Data:</strong> We temporarily access public YouTube channel data via the YouTube Data API to generate your SEO analysis.</li>
                    <li><strong>Usage Data:</strong> We may collect anonymous usage statistics to improve our service.</li>
                </ul>

                <h2>2. How We Use Your Information</h2>
                <ul>
                    <li>To generate and deliver your SEO analysis reports</li>
                    <li>To send you the PDF report you requested</li>
                    <li>To improve our services and user experience</li>
                    <li>To communicate with you about our services (only if you opt-in)</li>
                </ul>

                <h2>3. Data Storage and Security</h2>
                <p>We do not store your YouTube channel data permanently. Analysis is performed in real-time and not saved to our servers. Your name and email are stored securely and used solely for delivering your requested reports.</p>

                <h2>4. Third-Party Services</h2>
                <p>We use the YouTube Data API v3 to access public channel information. This service is governed by Google's Privacy Policy.</p>

                <h2>5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>Request deletion of your personal data</li>
                    <li>Opt-out of marketing communications</li>
                    <li>Access the data we have about you</li>
                </ul>

                <h2>6. Contact Us</h2>
                <p>For privacy-related questions, contact us at: <a href="mailto:moulicsayak@gmail.com">moulicsayak@gmail.com</a></p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
