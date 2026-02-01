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
        doc.text('Created by Sayak Moulic', marginLeft, footerY);

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
        const displayTitle = videoTitle.length > 65 ? videoTitle.substring(0, 65) + '...' : videoTitle;
        doc.text(`${index + 1}. ${displayTitle}`, marginLeft + 3, yPos + 8);

        yPos += 17;

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
