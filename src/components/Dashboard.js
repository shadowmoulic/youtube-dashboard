import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import { analyzeVideo, extractChannelIdentifier, formatDate, generatePDFReport } from '../utils/seo';

const DEFAULT_API_KEY = 'AIzaSyD5yiPBP-PGOJYwJu4XsAq_H43T6i1AGBQ';

const Dashboard = () => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [error, setError] = useState(null);
    const [apiKey] = useState(DEFAULT_API_KEY);
    const [showDownload, setShowDownload] = useState(false);
    const [downloadForm, setDownloadForm] = useState({ name: '', email: '' });
    const [downloadSuccess, setDownloadSuccess] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupShowCount, setPopupShowCount] = useState(0);

    const [videosPage, setVideosPage] = useState(1);
    const [selectedVideosForPDF, setSelectedVideosForPDF] = useState([]);

    // Show popup 5 seconds after results are loaded (max 2 times, not if download is open)
    useEffect(() => {
        if (videos.length > 0 && !showPopup && !showDownload && popupShowCount < 2) {
            const timer = setTimeout(() => {
                setShowPopup(true);
                setPopupShowCount(prev => prev + 1);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [videos, showDownload, popupShowCount, showPopup]);

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US', {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: 1
        }).format(num);
    };

    const fetchWorstPerformingVideos = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setError(null);
        setVideos([]);
        setShowPopup(false);

        try {
            const identifier = extractChannelIdentifier(input.trim());

            if (!identifier) {
                throw new Error('Invalid YouTube URL or channel identifier. Please enter a valid channel URL, @handle, or channel ID.');
            }

            let channelId = identifier.value;

            if (identifier.type === 'handle' || identifier.type === 'username') {
                const searchRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(identifier.value)}&key=${apiKey}`
                );
                const searchData = await searchRes.json();

                if (searchData.error) {
                    throw new Error(searchData.error.message || 'API Error');
                }

                if (!searchData.items || searchData.items.length === 0) {
                    throw new Error('Channel not found. Please check the URL or handle.');
                }

                channelId = searchData.items[0].snippet.channelId;
            }

            const channelRes = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
            );
            const channelData = await channelRes.json();

            if (channelData.error) {
                throw new Error(channelData.error.message || 'API Error');
            }

            if (!channelData.items || channelData.items.length === 0) {
                throw new Error('Channel not found.');
            }

            const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            const playlistRes = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${apiKey}`
            );
            const playlistData = await playlistRes.json();

            if (playlistData.error) {
                throw new Error(playlistData.error.message || 'API Error');
            }

            if (!playlistData.items || playlistData.items.length === 0) {
                throw new Error('No videos found on this channel.');
            }

            const recentVideos = playlistData.items.filter(item => {
                const publishedDate = new Date(item.snippet.publishedAt);
                return publishedDate >= threeMonthsAgo;
            });

            if (recentVideos.length === 0) {
                throw new Error('No videos found in the last 3 months.');
            }

            const videoIds = recentVideos.map(item => item.snippet.resourceId.videoId).join(',');
            const videosRes = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
            );
            const videosData = await videosRes.json();

            if (videosData.error) {
                throw new Error(videosData.error.message || 'API Error');
            }

            const analyzedVideos = videosData.items.map(video => {
                const analysis = analyzeVideo(video);
                const views = parseInt(video.statistics.viewCount) || 0;
                const likes = parseInt(video.statistics.likeCount) || 0;
                const engagementRate = views > 0 ? (likes / views) * 100 : 0;

                return {
                    ...video,
                    analysis,
                    performanceScore: views * 0.7 + engagementRate * 1000 + analysis.score * 10
                };
            });

            analyzedVideos.sort((a, b) => a.performanceScore - b.performanceScore);
            const worstVideos = analyzedVideos.slice(0, Math.min(10, analyzedVideos.length));
            setVideos(worstVideos);

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            fetchWorstPerformingVideos();
        }
    };

    const getScoreClass = (score) => {
        if (score >= 75) return 'high';
        if (score >= 50) return 'medium';
        return 'low';
    };

    const getScoreLabel = (score) => {
        if (score >= 75) return 'Good SEO';
        if (score >= 50) return 'Needs Work';
        return 'Poor SEO';
    };

    const copyToClipboard = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownload = (e) => {
        e.preventDefault();

        if (!downloadForm.name || !downloadForm.email) {
            alert('Please fill in both name and email');
            return;
        }

        if (selectedVideosForPDF.length === 0) {
            alert('Please select at least 1 video (max 3) for the PDF report');
            return;
        }

        // Generate PDF with selected videos
        const videosToInclude = videos.filter(v => selectedVideosForPDF.includes(v.id));
        generatePDFReport(videosToInclude, downloadForm);

        setDownloadSuccess(true);
        setTimeout(() => {
            setDownloadSuccess(false);
            setShowDownload(false);
            setShowPopup(false);
            setDownloadForm({ name: '', email: '' });
            setSelectedVideosForPDF([]);
        }, 3000);
    };

    const toggleVideoSelection = (videoId) => {
        setSelectedVideosForPDF(prev => {
            if (prev.includes(videoId)) {
                return prev.filter(id => id !== videoId);
            } else {
                if (prev.length >= 3) {
                    alert('You can select maximum 3 videos for the PDF report');
                    return prev;
                }
                return [...prev, videoId];
            }
        });
    };

    const renderActionCard = (action, index) => {
        const actionKey = `${selectedVideo.id}-${index}`;

        return (
            <div key={index} className="action-card">
                <div className="action-header">
                    <span className="action-type">
                        {action.type === 'title' && '📝 Title'}
                        {action.type === 'description' && '📄 Description'}
                        {action.type === 'tags' && '🏷️ Tags'}
                        {action.type === 'engagement' && '💬 Engagement'}
                    </span>
                </div>

                <div className="action-issue">{action.issue}</div>

                <div className="current-value">
                    <div className="current-label">Current</div>
                    <div className="current-text">{action.current}</div>
                </div>

                <div className="recommended-value">
                    <div className="current-label">✨ Recommended</div>
                    <div className="recommended-text">{action.recommended}</div>
                    <button
                        className={`copy-btn ${copiedIndex === actionKey ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(action.recommended, actionKey)}
                    >
                        {copiedIndex === actionKey ? '✓ Copied!' : '📋 Copy'}
                    </button>
                </div>

                {action.alternatives && action.alternatives.length > 0 && (
                    <div className="alternatives">
                        <div className="alternatives-title">Alternative Options:</div>
                        {action.alternatives.map((alt, i) => (
                            <div key={i} className="alternative-item">
                                <span>{alt}</span>
                                <button
                                    className="copy-btn"
                                    onClick={() => copyToClipboard(alt, `${actionKey}-alt-${i}`)}
                                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                                >
                                    {copiedIndex === `${actionKey}-alt-${i}` ? '✓' : '📋'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {action.template && (
                    <div className="alternatives">
                        <div className="alternatives-title">Template:</div>
                        <div className="alternative-item" style={{ display: 'block' }}>
                            <pre style={{ whiteSpace: 'pre-wrap', margin: '8px 0', fontSize: '0.8125rem' }}>
                                {action.template}
                            </pre>
                            <button
                                className="copy-btn"
                                onClick={() => copyToClipboard(action.template, `${actionKey}-template`)}
                            >
                                {copiedIndex === `${actionKey}-template` ? '✓ Copied!' : '📋 Copy Template'}
                            </button>
                        </div>
                    </div>
                )}

                {action.addThese && (
                    <div className="alternatives">
                        <div className="alternatives-title">Add These:</div>
                        <ul className="action-list">
                            {action.addThese.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {action.actions && (
                    <div className="alternatives">
                        <div className="alternatives-title">Action Steps:</div>
                        <ul className="action-list">
                            {action.actions.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {action.suggestions && (
                    <div className="alternatives">
                        <div className="alternatives-title">Suggestions:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {action.suggestions.map((sugg, i) => (
                                <span
                                    key={i}
                                    style={{
                                        background: 'var(--bg-tertiary)',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {sugg}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {action.why && (
                    <div className="action-why">
                        <strong>💡 Why this matters:</strong> {action.why}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <header className="header">
                <h1>Vidoryx</h1>
                <p>Discover your worst-performing videos and get AI-powered SEO recommendations to boost your rankings</p>
            </header>

            <div className="search-section">
                <div className="search-box">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Paste your channel URL or @handle"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <button
                        className="search-btn"
                        onClick={fetchWorstPerformingVideos}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                <div className="search-hint">
                    e.g., youtube.com/@YourChannel or @YourHandle
                </div>
                {error && <div className="error-message">{error}</div>}
            </div>

            {loading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <div className="loading-text">Analyzing your channel...</div>
                </div>
            )}

            {!loading && videos.length > 0 && (
                <>
                    <div className="results-header">
                        <h2 className="results-title">Videos That Need Your Attention</h2>
                        <p className="results-subtitle">
                            Showing {Math.min(videos.length, videosPage * 9)} of {videos.length} lowest-performing video{videos.length !== 1 ? 's' : ''} from the last 3 months
                        </p>
                    </div>

                    <div className="video-grid">
                        {videos.slice(0, videosPage * 9).map(video => (
                            <div
                                key={video.id}
                                className="video-card"
                                onClick={() => setSelectedVideo(video)}
                            >
                                <div className="video-thumbnail-container">
                                    <img
                                        className="video-thumbnail"
                                        src={video.snippet.thumbnails.medium.url}
                                        alt={video.snippet.title}
                                    />
                                </div>
                                <div className="video-content">
                                    <h3 className="video-title">{video.snippet.title}</h3>
                                    <div className="video-stats">
                                        <span className="stat-item">
                                            👁️ {formatNumber(video.statistics.viewCount)}
                                        </span>
                                        <span className="stat-item">
                                            👍 {formatNumber(video.statistics.likeCount)}
                                        </span>
                                        <span className="stat-item">
                                            📅 {formatDate(video.snippet.publishedAt)}
                                        </span>
                                    </div>
                                    <div className="score-badge-container">
                                        <span className={`score-badge ${getScoreClass(video.analysis.score)}`}>
                                            {video.analysis.score}/100 · {getScoreLabel(video.analysis.score)}
                                        </span>
                                        <span className="view-details">
                                            View details →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {videos.length > videosPage * 9 && (
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button
                                className="download-btn"
                                onClick={() => setVideosPage(prev => prev + 1)}
                                style={{ padding: '12px 30px' }}
                            >
                                Load More Videos ({videos.length - videosPage * 9} remaining)
                            </button>
                        </div>
                    )}

                    <div className="download-section">
                        <h3 className="download-title">📊 Get Your Complete SEO Report</h3>
                        <p className="download-subtitle">Select up to 3 videos to include in your PDF report</p>

                        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '15px',
                                maxHeight: '350px',
                                overflowY: 'auto',
                                padding: '15px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '12px'
                            }}>
                                {videos.map(video => (
                                    <div
                                        key={video.id}
                                        onClick={() => toggleVideoSelection(video.id)}
                                        style={{
                                            padding: '14px',
                                            background: selectedVideosForPDF.includes(video.id) ? 'var(--accent)' : 'var(--bg-primary)',
                                            border: selectedVideosForPDF.includes(video.id) ? '2px solid var(--accent)' : '2px solid var(--border)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            color: selectedVideosForPDF.includes(video.id) ? 'white' : 'var(--text-primary)',
                                            minHeight: '60px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', width: '100%' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedVideosForPDF.includes(video.id)}
                                                onChange={() => { }}
                                                style={{ cursor: 'pointer', marginTop: '2px', flexShrink: 0 }}
                                            />
                                            <span style={{
                                                fontSize: '0.875rem',
                                                fontWeight: '500',
                                                lineHeight: '1.4',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {video.snippet.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p style={{
                                marginTop: '10px',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                                textAlign: 'center'
                            }}>
                                {selectedVideosForPDF.length} of 3 videos selected
                            </p>
                        </div>

                        <button
                            className="download-btn"
                            onClick={() => setShowDownload(true)}
                            disabled={selectedVideosForPDF.length === 0}
                            style={{ opacity: selectedVideosForPDF.length === 0 ? 0.5 : 1 }}
                        >
                            Download PDF Report ({selectedVideosForPDF.length} video{selectedVideosForPDF.length !== 1 ? 's' : ''})
                        </button>
                    </div>
                </>
            )}

            {!loading && videos.length === 0 && !error && (
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <div className="empty-state-text">Enter a channel URL to get started</div>
                </div>
            )}

            {/* Video Detail Modal */}
            {selectedVideo && (
                <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <button className="modal-close" onClick={() => setSelectedVideo(null)}>
                                ×
                            </button>
                            <h2 className="modal-title">{selectedVideo.snippet.title}</h2>
                            <div className="modal-meta">
                                <span>👁️ {formatNumber(selectedVideo.statistics.viewCount)} views</span>
                                <span>👍 {formatNumber(selectedVideo.statistics.likeCount)} likes</span>
                                <span>💬 {formatNumber(selectedVideo.statistics.commentCount)} comments</span>
                                <span>📅 {formatDate(selectedVideo.snippet.publishedAt)}</span>
                            </div>
                        </div>

                        <div className="modal-body">
                            <div className="score-overview">
                                <div className={`score-circle ${getScoreClass(selectedVideo.analysis.score)}`}>
                                    {selectedVideo.analysis.score}
                                </div>
                                <div className="score-details">
                                    <h3>Performance Score</h3>
                                    <p>Based on views, engagement rate, and SEO optimization compared to similar content.</p>
                                </div>
                            </div>

                            <div className="analysis-section">
                                <h3>Strengths</h3>
                                <ul className="strengths-list">
                                    {selectedVideo.analysis.strengths.map((strength, i) => (
                                        <li key={i}>{strength}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="analysis-section">
                                <h3>Improvements Needed</h3>
                                <ul className="improvements-list">
                                    {selectedVideo.analysis.weaknesses.map((weakness, i) => (
                                        <li key={i}>{weakness}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="recommendations-section">
                                <h3>Recommended Actions</h3>
                                <div className="actions-grid">
                                    {selectedVideo.analysis.specificActions.map((action, i) => renderActionCard(action, i))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lead Capture Modal */}
            {showDownload && (
                <div className="modal-overlay">
                    <div className="modal-content download-modal">
                        <button className="modal-close" onClick={() => setShowDownload(false)}>×</button>
                        <h2>Where should we send your report?</h2>
                        <p>Enter your details to receive the full SEO analysis PDF.</p>

                        <form onSubmit={handleDownload}>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={downloadForm.name}
                                    onChange={(e) => setDownloadForm({ ...downloadForm, name: e.target.value })}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={downloadForm.email}
                                    onChange={(e) => setDownloadForm({ ...downloadForm, email: e.target.value })}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <button type="submit" className="download-submit-btn">
                                Send Report PDF
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Notification */}
            {downloadSuccess && (
                <div className="notification success">
                    ✅ Report sent successfully! Check your email.
                </div>
            )}

            {/* Exit Intent Popup */}
            {showPopup && !showDownload && (
                <div className="modal-overlay">
                    <div className="modal-content popup-content">
                        <button className="modal-close" onClick={() => setShowPopup(false)}>×</button>
                        <h2>Wait! Don't leave yet! 🚀</h2>
                        <p>You haven't downloaded your free SEO report yet.</p>
                        <p>Get detailed recommendations for {selectedVideosForPDF.length > 0 ? selectedVideosForPDF.length : 'your'} video{selectedVideosForPDF.length !== 1 ? 's' : ''}.</p>
                        <button
                            className="download-btn"
                            onClick={() => {
                                setShowPopup(false);
                                // Scroll to download section
                                const downloadSection = document.querySelector('.download-section');
                                if (downloadSection) {
                                    downloadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }}
                        >
                            Get My Free Report
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
