// Enhanced SEO analysis with more comprehensive checks
export const analyzeVideo = (video) => {
    const issues = [];
    const good = [];
    let score = 100;

    const { snippet, statistics } = video;
    const title = snippet.title;
    const description = snippet.description;
    const tags = snippet.tags || [];

    // Title Analysis
    if (title.length < 30) {
        issues.push("Title is too short. Aim for 50-60 characters to maximize visibility and CTR.");
        score -= 12;
    } else if (title.length > 70) {
        issues.push("Title may be truncated on mobile devices. Keep it under 60 characters for best results.");
        score -= 8;
    } else {
        good.push("Title length is optimal for search visibility.");
    }

    // Check for power words
    const powerWords = ['best', 'top', 'ultimate', 'complete', 'guide', 'how to', 'tutorial', 'review', 'vs'];
    const hasPowerWord = powerWords.some(word => title.toLowerCase().includes(word));

    if (!hasPowerWord) {
        issues.push("Consider adding power words like 'Best', 'Ultimate', 'Complete Guide' to improve CTR.");
        score -= 5;
    } else {
        good.push("Title uses engaging power words.");
    }

    if (!/[A-Z]/.test(title)) {
        issues.push("Title lacks proper capitalization. Use Title Case for better readability.");
        score -= 5;
    }

    if (/\d+/.test(title)) {
        good.push("Title contains numbers, which typically increases click-through rate by 20-30%.");
    }

    // Check for brackets/parentheses (proven to increase CTR)
    if (/[\[\(].*[\]\)]/.test(title)) {
        good.push("Using brackets/parentheses in title - great for highlighting key info!");
    }

    // Description Analysis
    if (description.length < 150) {
        issues.push("Description is critically short. Add at least 250-300 words with timestamps and keywords for better SEO.");
        score -= 18;
    } else if (description.length < 250) {
        issues.push("Description could be longer. Aim for 250+ words to improve search rankings.");
        score -= 10;
    } else {
        good.push("Description length is comprehensive.");
    }

    // Check for timestamps
    if (!/\d{1,2}:\d{2}/.test(description)) {
        issues.push("Add timestamps to your description. Videos with timestamps get 15% more engagement.");
        score -= 8;
    } else {
        good.push("Timestamps included - helps with user experience and watch time!");
    }

    if (!description.includes('http')) {
        issues.push("No links in description. Add your social media, website, or affiliate links.");
        score -= 6;
    } else {
        good.push("Links included in description.");
    }

    const hashtagCount = (description.match(/#/g) || []).length;
    if (hashtagCount < 3) {
        issues.push("Use 3-5 relevant hashtags in description for better discoverability.");
        score -= 7;
    } else if (hashtagCount > 15) {
        issues.push("Too many hashtags can be seen as spam. Stick to 3-5 most relevant ones.");
        score -= 5;
    } else {
        good.push("Good hashtag usage for discoverability.");
    }

    // Tags Analysis
    if (tags.length < 8) {
        issues.push("Add more tags. Use 10-15 relevant tags including broad and specific keywords.");
        score -= 12;
    } else if (tags.length > 20) {
        issues.push("Too many tags can dilute relevance. Focus on 10-15 highly relevant tags.");
        score -= 5;
    } else {
        good.push("Tag count is in the optimal range.");
    }

    // Engagement Analysis
    const views = parseInt(statistics.viewCount) || 0;
    const likes = parseInt(statistics.likeCount) || 0;
    const comments = parseInt(statistics.commentCount) || 0;

    if (views > 0) {
        const likeRatio = (likes / views) * 100;
        const commentRatio = (comments / views) * 100;

        if (likeRatio < 1.5) {
            issues.push(`Low engagement rate (${likeRatio.toFixed(2)}% likes). Add clear CTAs asking viewers to like.`);
            score -= 8;
        } else if (likeRatio >= 3) {
            good.push(`Excellent engagement rate! (${likeRatio.toFixed(2)}% likes) - Keep doing what you're doing!`);
        } else {
            good.push(`Good engagement rate (${likeRatio.toFixed(2)}% likes).`);
        }

        if (commentRatio < 0.1 && views > 100) {
            issues.push("Very few comments. Ask questions in your video to encourage discussion.");
            score -= 5;
        }
    }

    // Check for custom thumbnail indicators (we can't directly check, but we can infer)
    if (snippet.thumbnails.maxres) {
        good.push("High-resolution thumbnail available.");
    }

    return {
        score: Math.max(0, Math.min(100, score)),
        issues,
        good
    };
};

// Helper to extract channel ID or username from various YouTube URL formats
export const extractChannelIdentifier = (url) => {
    try {
        const urlObj = new URL(url);

        // Handle different YouTube URL formats
        if (urlObj.hostname.includes('youtube.com')) {
            // Channel ID format: youtube.com/channel/UC...
            if (urlObj.pathname.startsWith('/channel/')) {
                return { type: 'id', value: urlObj.pathname.split('/')[2] };
            }

            // Username format: youtube.com/@username or youtube.com/c/username or youtube.com/user/username
            if (urlObj.pathname.startsWith('/@')) {
                return { type: 'handle', value: urlObj.pathname.split('/')[1] };
            }

            if (urlObj.pathname.startsWith('/c/') || urlObj.pathname.startsWith('/user/')) {
                return { type: 'username', value: urlObj.pathname.split('/')[2] };
            }
        }

        return null;
    } catch (e) {
        // If not a valid URL, check if it's just a handle or ID
        if (url.startsWith('@')) {
            return { type: 'handle', value: url };
        }
        if (url.startsWith('UC') && url.length === 24) {
            return { type: 'id', value: url };
        }
        return null;
    }
};

export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1
    }).format(num);
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
};
