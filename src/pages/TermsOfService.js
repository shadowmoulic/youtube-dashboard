import React from 'react';
import '../components/Dashboard.css';

const TermsOfService = () => {
    return (
        <div className="dashboard-container">
            <div className="legal-page">
                <h1>Terms of Service</h1>
                <p className="last-updated">Last updated: February 1, 2026</p>

                <h2>1. Acceptance of Terms</h2>
                <p>By accessing and using Vidoryx, you accept and agree to be bound by these Terms of Service.</p>

                <h2>2. Description of Service</h2>
                <p>Vidoryx provides YouTube SEO analysis and recommendations based on publicly available data from the YouTube Data API. Our service analyzes video metadata and provides actionable suggestions to improve video performance.</p>

                <h2>3. Use License</h2>
                <p>We grant you a limited, non-exclusive, non-transferable license to use Vidoryx for personal or commercial purposes, subject to these terms.</p>

                <h2>4. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul>
                    <li>Provide accurate information when downloading reports</li>
                    <li>Use the service only for lawful purposes</li>
                    <li>Not attempt to reverse engineer or exploit our service</li>
                    <li>Not use automated tools to abuse our API limits</li>
                </ul>

                <h2>5. Disclaimer of Warranties</h2>
                <p>Vidoryx is provided "as is" without warranties of any kind. We do not guarantee specific results from implementing our recommendations. YouTube's algorithm is proprietary and subject to change.</p>

                <h2>6. Limitation of Liability</h2>
                <p>Vidoryx and its creator, Sayak Moulic, shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>

                <h2>7. YouTube API Services</h2>
                <p>This service uses YouTube API Services. By using Vidoryx, you agree to be bound by the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">YouTube Terms of Service</a>.</p>

                <h2>8. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.</p>

                <h2>9. Contact</h2>
                <p>For questions about these terms, contact: <a href="mailto:moulicsayak@gmail.com">moulicsayak@gmail.com</a></p>
            </div>
        </div>
    );
};

export default TermsOfService;
