import React, { useState } from 'react';
import './Dashboard.css';
import { analyzeVideo, extractChannelIdentifier, formatNumber, formatDate } from '../utils/seo';

// Using a public API key approach - users can optionally provide their own
const DEFAULT_API_KEY = 'AIzaSyD5yiPBP-PGOJYwJu4XsAq_H43T6i1AGBQ';

const Dashboard = () => {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [videos, setVideos] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [error, setError] = useState(null);
    const [apiKey] = useState(DEFAULT_API_KEY);

    const fetchWorstPerformingVideos = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setError(null);
        setVideos([]);

        try {
            // Extract channel identifier from URL or handle
            const identifier = extractChannelIdentifier(input.trim());

            if (!identifier) {
                throw new Error('Invalid YouTube URL or channel identifier. Please enter a valid channel URL, @handle, or channel ID.');
            }

            let channelId = identifier.value;

            // If it's a handle or username, we need to search for the channel
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

            // Get channel details
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

            // Get videos from the last 3 months
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

            // Fetch recent uploads (up to 50)
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

            // Filter videos from last 3 months
            const recentVideos = playlistData.items.filter(item => {
                const publishedDate = new Date(item.snippet.publishedAt);
                return publishedDate >= threeMonthsAgo;
            });

            if (recentVideos.length === 0) {
                throw new Error('No videos found in the last 3 months.');
            }

            // Get detailed stats for these videos
            const videoIds = recentVideos.map(item => item.snippet.resourceId.videoId).join(',');
            const videosRes = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
            );
            const videosData = await videosRes.json();

            if (videosData.error) {
                throw new Error(videosData.error.message || 'API Error');
            }

            // Analyze and sort by performance (lowest views and engagement first)
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

            // Sort by performance score (lowest first = worst performing)
            analyzedVideos.sort((a, b) => a.performanceScore - b.performanceScore);

            // Take worst 10 or all if less than 10
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

    return (
        <div className="dashboard-container">
            <header className="header">
                <h1>YouTube SEO Analyzer</h1>
                <p>Discover your worst-performing videos from the last 3 months and get actionable insights to improve them</p>
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
                            Showing {videos.length} lowest-performing video{videos.length !== 1 ? 's' : ''} from the last 3 months
                        </p>
                    </div>

                    <div className="video-grid">
                        {videos.map(video => (
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
                </>
            )}

            {!loading && videos.length === 0 && !error && input && (
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <div className="empty-state-text">Enter a channel URL to get started</div>
                </div>
            )}

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
                                <div className="score-info">
                                    <h3>SEO Score: {getScoreLabel(selectedVideo.analysis.score)}</h3>
                                    <p>Based on title, description, tags, and engagement metrics</p>
                                </div>
                            </div>

                            {selectedVideo.analysis.issues.length > 0 && (
                                <div className="analysis-section">
                                    <h3 className="section-title">🎯 Recommended Improvements</h3>
                                    <div className="issue-list">
                                        {selectedVideo.analysis.issues.map((issue, index) => (
                                            <div key={index} className="issue-item">
                                                <span className="icon">⚠️</span>
                                                <span>{issue}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedVideo.analysis.good.length > 0 && (
                                <div className="analysis-section">
                                    <h3 className="section-title">✅ What You're Doing Right</h3>
                                    <div className="good-list">
                                        {selectedVideo.analysis.good.map((item, index) => (
                                            <div key={index} className="good-item">
                                                <span className="icon">✓</span>
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
