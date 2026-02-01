import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = (selectedVideos, userInfo) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Margins
    const marginLeft = 20;
    const marginRight = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // Clean Color Palette (Premium SaaS Style)
    const colors = {
        darkGray: [31, 41, 55],      // #1F2937 - Primary text
        mutedGray: [107, 114, 128],   // #6B7280 - Secondary text
        green: [16, 185, 129],        // #10B981 - Success/Highlight
        orange: [245, 158, 11],       // #F59E0B - Warning
        red: [239, 68, 68],           // #EF4444 - Critical
        blue: [37, 99, 235],          // #2563EB - Accent
        lightGray: [243, 244, 246],   // #F3F4F6 - Background
        border: [229, 231, 235],      // #E5E7EB - Borders
        white: [255, 255, 255]
    };

    // Typography Hierarchy
    const typography = {
        reportTitle: { size: 20, weight: 'bold' },
        sectionTitle: { size: 15, weight: 'bold' },
        subHeading: { size: 12, weight: 'bold' },
        body: { size: 10, weight: 'normal' },
        footer: { size: 8, weight: 'normal' }
    };

    // Helper: Safe Number Formatting
    const formatNumber = (num) => {
        const parsed = parseInt(num) || 0;
        if (parsed === 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            notation: parsed >= 10000 ? 'compact' : 'standard',
            compactDisplay: 'short',
            maximumFractionDigits: 1
        }).format(parsed);
    };

    // Helper: Add Wrapped Text with Dynamic Height
    const addWrappedText = (text, x, y, maxWidth, fontSize, fontWeight = 'normal', color = colors.darkGray) => {
        if (!text) return 0;

        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontWeight);
        doc.setTextColor(...color);

        const safeText = String(text).replace(/\s+/g, ' ').trim();
        const lines = doc.splitTextToSize(safeText, maxWidth);
        const lineHeight = fontSize * 0.4;

        lines.forEach((line, i) => {
            const currentY = y + (i * lineHeight);
            if (currentY > pageHeight - 30) {
                doc.addPage();
                y = 20 - (i * lineHeight);
            }
            doc.text(line, x, y + (i * lineHeight));
        });

        return lines.length * lineHeight;
    };

    // Helper: Render Score Badge
    const renderScoreBadge = (score, x, y, size = 'large') => {
        const badgeColor = score >= 75 ? colors.green : score >= 50 ? colors.orange : colors.red;
        const dimensions = size === 'large' ? { w: 60, h: 20, fontSize: 14 } : { w: 28, h: 10, fontSize: 9 };

        doc.setFillColor(...badgeColor);
        doc.roundedRect(x, y, dimensions.w, dimensions.h, 3, 3, 'F');

        doc.setTextColor(...colors.white);
        doc.setFontSize(dimensions.fontSize);
        doc.setFont('helvetica', 'bold');
        doc.text(`${score}`, x + dimensions.w / 2, y + dimensions.h / 2 + 3, { align: 'center' });

        return dimensions.h;
    };

    // Helper: Render Footer
    const renderFooter = (pageNum, totalPages) => {
        const footerY = pageHeight - 15;

        // Divider line
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.3);
        doc.line(marginLeft, footerY - 5, pageWidth - marginRight, footerY - 5);

        // Left: Creator info
        doc.setFontSize(typography.footer.size);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.mutedGray);
        doc.text('Created by Vidoryx', marginLeft, footerY);

        // Right: Page number
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginRight, footerY, { align: 'right' });
    };

    // ===== PAGE 1: HEADER & EXECUTIVE SUMMARY =====
    let yPos = 20;

    // Report Title
    doc.setFontSize(typography.reportTitle.size);
    doc.setFont('helvetica', typography.reportTitle.weight);
    doc.setTextColor(...colors.darkGray);
    doc.text('YouTube SEO Analysis Report', marginLeft, yPos);

    yPos += 8;

    // Subtitle
    doc.setFontSize(typography.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedGray);
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, marginLeft, yPos);

    yPos += 15;

    // User Info Card
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(marginLeft, yPos, contentWidth, 18, 3, 3, 'F');

    doc.setTextColor(...colors.darkGray);
    doc.setFontSize(typography.body.size);
    doc.setFont('helvetica', 'bold');
    doc.text(`Prepared for: ${userInfo.name || 'N/A'}`, marginLeft + 5, yPos + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedGray);
    doc.setFontSize(typography.footer.size);
    doc.text(`${userInfo.email || 'N/A'}`, marginLeft + 5, yPos + 13);

    yPos += 28;

    // Executive Summary Section
    doc.setTextColor(...colors.darkGray);
    doc.setFontSize(typography.sectionTitle.size);
    doc.setFont('helvetica', typography.sectionTitle.weight);
    doc.text('Executive Summary', marginLeft, yPos);

    yPos += 10;

    // Summary Description
    const summaryText = `This report analyzes ${selectedVideos.length} video${selectedVideos.length !== 1 ? 's' : ''} from your YouTube channel, providing actionable SEO recommendations to improve visibility, engagement, and search rankings.`;
    const summaryHeight = addWrappedText(summaryText, marginLeft, yPos, contentWidth, typography.body.size, 'normal', colors.mutedGray);

    yPos += summaryHeight + 12;

    // Average Score Badge
    const avgScore = selectedVideos.length > 0
        ? Math.round(selectedVideos.reduce((sum, v) => sum + (v.analysis?.score || 0), 0) / selectedVideos.length)
        : 0;

    renderScoreBadge(avgScore, marginLeft, yPos, 'large');

    // Score Label
    doc.setTextColor(...colors.darkGray);
    doc.setFontSize(typography.subHeading.size);
    doc.setFont('helvetica', 'bold');
    const scoreLabel = avgScore >= 75 ? 'Excellent Performance' : avgScore >= 50 ? 'Needs Improvement' : 'Critical Issues Detected';
    doc.text(scoreLabel, marginLeft + 70, yPos + 8);

    doc.setFontSize(typography.footer.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedGray);
    doc.text('Average SEO Score', marginLeft + 70, yPos + 14);

    yPos += 30;

    // Section Divider
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);

    yPos += 15;

    // ===== VIDEO ANALYSIS CARDS =====
    selectedVideos.forEach((video, index) => {
        // Page Break Check
        if (yPos > pageHeight - 100) {
            doc.addPage();
            yPos = 20;
        }

        // Video Card Header
        doc.setFillColor(...colors.lightGray);
        doc.roundedRect(marginLeft, yPos, contentWidth, 12, 2, 2, 'F');

        doc.setTextColor(...colors.darkGray);
        doc.setFontSize(typography.sectionTitle.size);
        doc.setFont('helvetica', typography.sectionTitle.weight);

        const videoTitle = video.snippet?.title || 'Untitled Video';
        const titleLines = doc.splitTextToSize(`${index + 1}. ${videoTitle}`, contentWidth - 6);
        const cardHeight = Math.max(12, titleLines.length * 5 + 4);
        doc.roundedRect(marginLeft, yPos, contentWidth, cardHeight, 2, 2, 'F');
        titleLines.forEach((line, i) => {
            doc.text(line, marginLeft + 3, yPos + 8 + (i * 5));
        });

        yPos += cardHeight + 5;

        // Metrics Row
        const score = video.analysis?.score || 0;
        renderScoreBadge(score, marginLeft, yPos, 'small');

        doc.setFontSize(typography.footer.size);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.mutedGray);

        const views = formatNumber(video.statistics?.viewCount);
        const likes = formatNumber(video.statistics?.likeCount);
        const comments = formatNumber(video.statistics?.commentCount);

        const metricsX = marginLeft + 35;
        doc.text(`Views: ${views}`, metricsX, yPos + 7);
        doc.text('|', metricsX + 30, yPos + 7);
        doc.text(`Likes: ${likes}`, metricsX + 35, yPos + 7);
        doc.text('|', metricsX + 60, yPos + 7);
        doc.text(`Comments: ${comments}`, metricsX + 65, yPos + 7);

        yPos += 15;

        // Recommended Actions
        const actions = video.analysis?.specificActions || [];

        if (actions.length > 0) {
            doc.setTextColor(...colors.darkGray);
            doc.setFontSize(typography.subHeading.size);
            doc.setFont('helvetica', typography.subHeading.weight);
            doc.text('Recommended Actions', marginLeft, yPos);

            yPos += 8;

            // Show top 3 actions
            actions.slice(0, 3).forEach((action) => {
                // Page break check
                if (yPos > pageHeight - 50) {
                    doc.addPage();
                    yPos = 20;
                }

                // Bullet point
                doc.setFillColor(...colors.blue);
                doc.circle(marginLeft + 2, yPos + 2, 1.2, 'F');

                // Action Issue (Bold)
                doc.setTextColor(...colors.darkGray);
                doc.setFontSize(typography.body.size);
                doc.setFont('helvetica', 'bold');

                const issue = action.issue || 'Optimization needed';
                const issueLines = doc.splitTextToSize(issue, contentWidth - 10);
                doc.text(issueLines, marginLeft + 8, yPos + 3);
                yPos += issueLines.length * 4 + 3;

                // Current Title (Muted)
                if (action.current) {
                    doc.setTextColor(...colors.mutedGray);
                    doc.setFontSize(typography.footer.size);
                    doc.setFont('helvetica', 'normal');

                    const currentText = `Current: ${String(action.current).replace(/\s+/g, ' ').trim()}`;
                    const currentLines = doc.splitTextToSize(currentText, contentWidth - 15);
                    doc.text(currentLines, marginLeft + 12, yPos);
                    yPos += currentLines.length * 3.5 + 2;
                }

                // Optimized Title (Green Highlight)
                if (action.recommended) {
                    doc.setTextColor(...colors.green);
                    doc.setFontSize(typography.footer.size);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Optimized:', marginLeft + 12, yPos);

                    doc.setFont('helvetica', 'normal');
                    const recText = String(action.recommended).replace(/\s+/g, ' ').trim();
                    const recLines = doc.splitTextToSize(recText, contentWidth - 15);
                    doc.text(recLines, marginLeft + 12, yPos + 3.5);
                    yPos += recLines.length * 3.5 + 6;
                }
            });

            yPos += 5;
        } else {
            doc.setTextColor(...colors.mutedGray);
            doc.setFontSize(typography.footer.size);
            doc.setFont('helvetica', 'italic');
            doc.text('No specific recommendations available.', marginLeft, yPos);
            yPos += 10;
        }

        // Section Spacing
        yPos += 10;

        // Divider between videos
        if (index < selectedVideos.length - 1) {
            doc.setDrawColor(...colors.border);
            doc.setLineWidth(0.5);
            doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
            yPos += 15;
        }
    });

    // ===== FINAL BRANDED PAGE =====
    doc.addPage();
    yPos = 60;

    // Brand Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.blue);
    doc.text('Vidoryx', pageWidth / 2, yPos, { align: 'center' });

    yPos += 10;

    doc.setFontSize(typography.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedGray);
    doc.text('YouTube SEO & Growth Analytics', pageWidth / 2, yPos, { align: 'center' });

    yPos += 25;

    // Divider
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.line(marginLeft + 30, yPos, pageWidth - marginRight - 30, yPos);

    yPos += 20;

    // Creator Section
    doc.setFontSize(typography.sectionTitle.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.darkGray);
    doc.text('About the Creator', pageWidth / 2, yPos, { align: 'center' });

    yPos += 12;

    doc.setFontSize(typography.subHeading.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.blue);
    doc.text('Sayak Moulic', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;

    doc.setFontSize(typography.body.size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedGray);
    doc.text('SEO & AI Automation Specialist', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;

    // Services Box
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(marginLeft + 10, yPos, contentWidth - 20, 45, 3, 3, 'F');

    yPos += 10;

    doc.setFontSize(typography.body.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.darkGray);
    doc.text('I Help Coaches & Creators:', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.mutedGray);
    const services = [
        'Optimize YouTube SEO for maximum visibility',
        'Build AI-powered automation systems',
        'Scale content strategy with data-driven insights'
    ];

    services.forEach(service => {
        doc.text(service, pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;
    });

    yPos += 15;

    // CTA Box
    doc.setFillColor(...colors.blue);
    doc.roundedRect(marginLeft + 20, yPos, contentWidth - 40, 28, 4, 4, 'F');

    yPos += 10;

    doc.setFontSize(typography.subHeading.size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.white);
    doc.text('Ready to Grow Your Business?', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;

    doc.setFontSize(typography.body.size);
    doc.setFont('helvetica', 'normal');
    doc.textWithLink('Connect with me on LinkedIn', pageWidth / 2, yPos, {
        url: 'https://www.linkedin.com/in/sayak-moulic-seo-for-coaches/',
        align: 'center'
    });

    yPos += 6;

    doc.setFontSize(typography.footer.size);
    doc.text('linkedin.com/in/sayak-moulic-seo-for-coaches', pageWidth / 2, yPos, { align: 'center' });

    // ===== ADD FOOTERS TO ALL PAGES =====
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        renderFooter(i, totalPages);
    }

    // Save PDF
    const fileName = `Vidoryx-SEO-Report-${Date.now()}.pdf`;
    doc.save(fileName);

    return fileName;
};


// Keep existing utility functions
export const analyzeVideo = (video, competitorData = null) => {
    const issues = [];
    const good = [];
    const specificActions = [];
    let score = 100;

    const { snippet, statistics } = video;
    const title = snippet.title;
    const description = snippet.description;
    const tags = snippet.tags || [];

    // ===== TITLE ANALYSIS =====
    const titleLength = title.length;

    if (titleLength < 30) {
        issues.push("Title is too short and missing valuable keywords.");
        specificActions.push({
            type: 'title',
            issue: 'Title too short',
            current: title,
            recommended: `${title} - Complete Guide 2026`,
            example: `${title} - Complete Guide 2026`,
            why: 'Titles between 50-60 characters get 20% more clicks. Add specific benefits or numbers.'
        });
        score -= 12;
    } else if (titleLength > 70) {
        const truncatedTitle = title.substring(0, 60);
        issues.push("Title gets cut off on mobile devices.");
        specificActions.push({
            type: 'title',
            issue: 'Title too long',
            current: title,
            recommended: `${truncatedTitle}...`,
            example: truncatedTitle.trim(),
            why: 'Titles over 60 characters get truncated on mobile. Keep the most important info at the start.'
        });
        score -= 8;
    } else {
        good.push("Title length is optimal for all devices.");
    }

    // Power words check
    const powerWords = ['best', 'top', 'ultimate', 'complete', 'guide', 'how to', 'tutorial', 'review', 'vs', 'secret', 'proven', 'easy'];
    const hasPowerWord = powerWords.some(word => title.toLowerCase().includes(word));

    if (!hasPowerWord) {
        issues.push("Title lacks engaging power words that drive clicks.");
        specificActions.push({
            type: 'title',
            issue: 'Missing power words',
            current: title,
            recommended: `The ULTIMATE ${title}`,
            alternatives: [
                `BEST ${title} (Complete Guide)`,
                `How to ${title} - Step by Step`,
                `${title} - PROVEN Method 2026`
            ],
            why: 'Videos with power words like "Ultimate", "Best", "Proven" get 30% higher CTR.'
        });
        score -= 5;
    } else {
        good.push("Title uses engaging power words.");
    }

    // Number check
    if (!/\d+/.test(title)) {
        specificActions.push({
            type: 'title',
            issue: 'No numbers in title',
            current: title,
            recommended: `${title} (5 Steps)`,
            alternatives: [
                `7 ${title} Tips`,
                `${title} in 2026`,
                `Top 10 ${title}`
            ],
            why: 'Titles with numbers get 36% more clicks. Numbers create curiosity and set expectations.'
        });
        score -= 4;
    } else {
        good.push("Title contains numbers - proven to boost CTR by 36%.");
    }

    // Capitalization check
    if (title === title.toLowerCase() || title === title.toUpperCase()) {
        issues.push("Title capitalization needs improvement.");
        specificActions.push({
            type: 'title',
            issue: 'Poor capitalization',
            current: title,
            recommended: toTitleCase(title),
            why: 'Proper Title Case looks more professional and is easier to read.'
        });
        score -= 5;
    }

    // Brackets check
    if (!/(\[.*?\]|\(.*?\))/.test(title)) {
        specificActions.push({
            type: 'title',
            issue: 'No brackets for emphasis',
            current: title,
            recommended: `${title} [2026 Update]`,
            alternatives: [
                `${title} (MUST WATCH)`,
                `${title} [Step-by-Step]`,
                `${title} (Works in 2026)`
            ],
            why: 'Brackets/parentheses increase CTR by 15-20% by highlighting key info.'
        });
        score -= 3;
    } else {
        good.push("Using brackets effectively to highlight key information!");
    }

    // ===== DESCRIPTION ANALYSIS =====
    const descLength = description.length;

    if (descLength < 150) {
        issues.push("Description is critically short - missing SEO opportunities.");
        specificActions.push({
            type: 'description',
            issue: 'Description too short',
            current: `${descLength} characters`,
            recommended: 'Write 250-500 words',
            template: `📌 In this video, I'll show you [main topic]...\n\n⏱️ TIMESTAMPS:\n0:00 - Intro\n0:30 - [Section 1]\n2:15 - [Section 2]\n\n🔗 RESOURCES:\n[Link 1]\n[Link 2]\n\n📱 CONNECT WITH ME:\n[Social links]\n\n#${snippet.title.split(' ').slice(0, 3).join('')} #Tutorial #2026`,
            why: 'Longer descriptions (250+ words) rank better in search. Include keywords, timestamps, and links.'
        });
        score -= 18;
    } else if (descLength < 250) {
        issues.push("Description could be more comprehensive.");
        specificActions.push({
            type: 'description',
            issue: 'Description needs expansion',
            current: `${descLength} characters`,
            recommended: 'Expand to 300-500 words',
            addThese: [
                '⏱️ Timestamps for each section',
                '🔗 Relevant resource links',
                '📱 Social media links',
                '💡 Key takeaways summary',
                '#️⃣ 3-5 relevant hashtags'
            ],
            why: 'Comprehensive descriptions improve search rankings and viewer experience.'
        });
        score -= 10;
    } else {
        good.push("Description length is comprehensive.");
    }

    // Timestamps check
    const hasTimestamps = /\d{1,2}:\d{2}/.test(description);
    if (!hasTimestamps) {
        issues.push("Missing timestamps - hurting watch time and user experience.");
        specificActions.push({
            type: 'description',
            issue: 'No timestamps',
            current: 'No timestamps found',
            recommended: 'Add chapter timestamps',
            template: `⏱️ TIMESTAMPS:\n0:00 - Introduction\n1:30 - Main Topic Starts\n5:45 - Key Point #1\n10:20 - Key Point #2\n15:00 - Conclusion`,
            why: 'Videos with timestamps get 15% more engagement and YouTube promotes them with chapter markers.'
        });
        score -= 8;
    } else {
        good.push("Timestamps included - great for user experience!");
    }

    // Links check
    const hasLinks = /https?:\/\//.test(description);
    if (!hasLinks) {
        issues.push("No links in description - missing traffic opportunities.");
        specificActions.push({
            type: 'description',
            issue: 'No links',
            current: 'No links found',
            recommended: 'Add relevant links',
            addThese: [
                '🔗 Your website/landing page',
                '📱 Instagram/Twitter/TikTok',
                '💼 Affiliate links (if applicable)',
                '📧 Email newsletter signup',
                '🎁 Free resources/downloads'
            ],
            why: 'Links drive traffic to your other platforms and can generate revenue through affiliates.'
        });
        score -= 6;
    } else {
        good.push("Links included in description.");
    }

    // Hashtags check
    const hashtagCount = (description.match(/#\w+/g) || []).length;
    if (hashtagCount < 3) {
        issues.push("Not enough hashtags for discoverability.");
        specificActions.push({
            type: 'description',
            issue: 'Insufficient hashtags',
            current: `${hashtagCount} hashtags`,
            recommended: 'Add 3-5 relevant hashtags',
            suggestions: generateHashtagSuggestions(title),
            why: 'First 3 hashtags appear above your title. Use them strategically for discoverability.'
        });
        score -= 7;
    } else if (hashtagCount > 15) {
        issues.push("Too many hashtags - looks spammy.");
        specificActions.push({
            type: 'description',
            issue: 'Hashtag overload',
            current: `${hashtagCount} hashtags`,
            recommended: 'Reduce to 3-5 most relevant',
            why: 'YouTube ignores ALL hashtags if you use more than 15. Stick to 3-5 highly relevant ones.'
        });
        score -= 5;
    } else {
        good.push("Optimal hashtag usage.");
    }

    // ===== TAGS ANALYSIS =====
    const tagCount = tags.length;

    if (tagCount < 8) {
        issues.push("Not enough tags - limiting discoverability.");
        specificActions.push({
            type: 'tags',
            issue: 'Insufficient tags',
            current: tags.join(', ') || 'No tags',
            recommended: 'Add 10-15 relevant tags',
            suggestions: generateTagSuggestions(title, description),
            why: 'Tags help YouTube understand your content. Use a mix of broad and specific keywords.'
        });
        score -= 12;
    } else if (tagCount > 20) {
        issues.push("Too many tags diluting relevance.");
        specificActions.push({
            type: 'tags',
            issue: 'Too many tags',
            current: `${tagCount} tags`,
            recommended: 'Focus on 10-15 most relevant',
            keepThese: tags.slice(0, 12),
            why: 'Quality over quantity. Too many tags confuse the algorithm.'
        });
        score -= 5;
    } else {
        good.push("Tag count is optimal.");
    }

    // ===== ENGAGEMENT ANALYSIS =====
    const views = parseInt(statistics.viewCount) || 0;
    const likes = parseInt(statistics.likeCount) || 0;
    const comments = parseInt(statistics.commentCount) || 0;

    if (views > 0) {
        const likeRatio = (likes / views) * 100;
        const commentRatio = (comments / views) * 100;

        if (likeRatio < 1.5) {
            issues.push(`Low engagement rate (${likeRatio.toFixed(2)}% like rate).`);
            specificActions.push({
                type: 'engagement',
                issue: 'Low like rate',
                current: `${likeRatio.toFixed(2)}% like rate`,
                recommended: 'Add clear CTAs in video',
                actions: [
                    '🎬 Ask viewers to like at 30 seconds in',
                    '📌 Add a visual reminder to like (text overlay)',
                    '💬 "If you found this helpful, smash that like button!"',
                    '🎯 Remind again before the conclusion'
                ],
                why: 'Videos with 3%+ like rates get promoted more by YouTube algorithm.'
            });
            score -= 8;
        } else if (likeRatio >= 3) {
            good.push(`Excellent engagement rate! (${likeRatio.toFixed(2)}% likes)`);
        } else {
            good.push(`Good engagement rate (${likeRatio.toFixed(2)}% likes).`);
        }

        if (commentRatio < 0.1 && views > 100) {
            issues.push("Very few comments - missing engagement signals.");
            specificActions.push({
                type: 'engagement',
                issue: 'Low comment rate',
                current: `${comments} comments on ${views} views`,
                recommended: 'Encourage discussion',
                actions: [
                    '❓ Ask a specific question in the video',
                    '💭 "Comment below your experience with..."',
                    '🏆 "Best comment gets pinned!"',
                    '📌 Pin a conversation-starter comment yourself',
                    '💬 Reply to early comments to boost engagement'
                ],
                why: 'Comments signal to YouTube that your video is engaging. Aim for 0.5%+ comment rate.'
            });
            score -= 5;
        }
    }

    // ===== COMPETITIVE INSIGHTS =====
    const competitorInsights = {
        avgTitleLength: 58,
        commonKeywords: ['tutorial', 'guide', '2026', 'complete'],
        avgDescriptionLength: 450,
        avgTags: 12,
        topPerformers: [
            'Videos with "Complete Guide" get 2.3x more views',
            'Timestamps increase watch time by 18%',
            'Brackets in titles boost CTR by 22%'
        ]
    };

    return {
        score: Math.max(0, Math.min(100, score)),
        issues,
        good,
        specificActions,
        competitorInsights
    };
};

// Helper functions
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function generateHashtagSuggestions(title) {
    const words = title.toLowerCase().split(' ').filter(w => w.length > 3);
    const suggestions = [
        `#${words.slice(0, 2).join('')}`,
        '#Tutorial',
        '#HowTo',
        '#2026',
        `#${words[0]}`
    ];
    return suggestions.slice(0, 5);
}

function generateTagSuggestions(title, description) {
    const words = title.toLowerCase().split(' ').filter(w => w.length > 3);
    const suggestions = [
        title.toLowerCase(),
        ...words.slice(0, 5),
        'tutorial',
        'how to',
        'guide',
        '2026',
        `${words[0]} tutorial`,
        `${words[0]} guide`
    ];
    return [...new Set(suggestions)].slice(0, 12);
}

export const extractChannelIdentifier = (url) => {
    try {
        const urlObj = new URL(url);

        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.startsWith('/channel/')) {
                return { type: 'id', value: urlObj.pathname.split('/')[2] };
            }

            if (urlObj.pathname.startsWith('/@')) {
                return { type: 'handle', value: urlObj.pathname.split('/')[1] };
            }

            if (urlObj.pathname.startsWith('/c/') || urlObj.pathname.startsWith('/user/')) {
                return { type: 'username', value: urlObj.pathname.split('/')[2] };
            }
        }

        return null;
    } catch (e) {
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
