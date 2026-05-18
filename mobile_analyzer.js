/**
 * Mobile Responsiveness Analyzer
 * 
 * Analyzes a website's mobile responsiveness by:
 * 1. Loading the page with various mobile viewport sizes
 * 2. Checking for common mobile-friendly elements
 * 3. Identifying potential issues that could affect mobile UX
 * 
 * Usage: node mobile_analyzer.js <URL> [options]
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Standard mobile viewport sizes for testing
const VIEWPORT_SIZES = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
  { name: 'Samsung Galaxy S20', width: 360, height: 800 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Air', width: 820, height: 1180 },
];

// Minimum acceptable font sizes for readability
const MIN_FONT_SIZES = {
  'body': 14,
  'heading': 20,
  'button': 14,
  'link': 14
};

class MobileResponsivenessAnalyzer {
  constructor() {
    this.results = {
      url: '',
      timestamp: new Date().toISOString(),
      viewports: [],
      issues: [],
      recommendations: []
    };
  }

  /**
   * Initialize the browser instance
   */
  async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✓ Browser initialized');
  }

  /**
   * Analyze the website at the given URL
   */
  async analyze(url) {
    this.results.url = url;
    
    if (!this.browser) {
      await this.initialize();
    }

    for (const viewport of VIEWPORT_SIZES) {
      console.log(`\n📱 Analyzing viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      await this.analyzeViewport(viewport, url);
    }

    await this.collectGeneralMetrics(url);
    return this.results;
  }

  /**
   * Analyze a specific viewport size
   */
  async analyzeViewport(viewport, url) {
    const page = await this.browser.newPage();
    
    try {
      // Set viewport size
      await page.setViewport({
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 2, // High DPI
        isMobile: true,
        hasTouch: true
      });

      // Navigate to the page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for fonts and styles to load
      await page.waitForTimeout(2000);

      const viewportData = {
        name: viewport.name,
        dimensions: { width: viewport.width, height: viewport.height },
        issues: [],
        metrics: {}
      };

      // Check for horizontal overflow
      const overflowData = await this.checkHorizontalOverflow(page, viewport);
      viewportData.metrics.overflow = overflowData;
      if (overflowData.hasOverflow) {
        viewportData.issues.push({
          type: 'horizontal_overflow',
          severity: 'high',
          description: `Content exceeds viewport width by ${overflowData.maxOverflow}px`,
          element: overflowData.offendingElement
        });
      }

      // Check font sizes
      const fontData = await this.checkFontSizes(page);
      viewportData.metrics.fonts = fontData;
      fontData.tooSmall.forEach(item => {
        viewportData.issues.push({
          type: 'small_font',
          severity: 'medium',
          description: `Font size ${item.size}px for ${item.element} is below recommended ${MIN_FONT_SIZES[item.type]}px`,
          element: item.element
        });
      });

      // Check tap target sizes
      const targetData = await this.checkTapTargets(page);
      viewportData.metrics.tapTargets = targetData;
      if (targetData.tooSmall.length > 0) {
        viewportData.issues.push({
          type: 'small_tap_targets',
          severity: 'high',
          description: `${targetData.tooSmall.length} tap targets are smaller than 48x48px`,
          elements: targetData.tooSmall
        });
      }

      // Check viewport meta tag
      const viewportData_meta = await this.checkViewportMeta(page);
      viewportData.metrics.viewport = viewportData_meta;
      if (!viewportData_meta.hasViewport) {
        viewportData.issues.push({
          type: 'missing_viewport',
          severity: 'critical',
          description: 'Viewport meta tag is missing'
        });
      }

      // Check for fixed elements that might cause issues
      const fixedData = await this.checkFixedElements(page);
      viewportData.metrics.fixedElements = fixedData;
      if (fixedData.length > 0) {
        viewportData.issues.push({
          type: 'fixed_elements',
          severity: 'medium',
          description: `${fixedData.length} fixed-position elements might obstruct content`,
          elements: fixedData
        });
      }

      // Check image dimensions
      const imageData = await this.checkImages(page);
      viewportData.metrics.images = imageData;
      if (imageData.overflowing.length > 0) {
        viewportData.issues.push({
          type: 'large_images',
          severity: 'medium',
          description: `${imageData.overflowing.length} images exceed viewport width`,
          images: imageData.overflowing
        });
      }

      // Check for text that's too wide (reduced readability)
      const textData = await this.checkTextWidth(page, viewport.width);
      viewportData.metrics.text = textData;
      if (textData.tooWide.length > 0) {
        viewportData.issues.push({
          type: 'wide_text',
          severity: 'low',
          description: `${textData.tooWide.length} text elements are too wide for comfortable reading`,
          elements: textData.tooWide
        });
      }

      this.results.viewports.push(viewportData);
      console.log(`  ✓ Found ${viewportData.issues.length} issues`);

    } catch (error) {
      console.error(`  ✗ Error analyzing viewport: ${error.message}`);
      this.results.viewports.push({
        name: viewport.name,
        error: error.message
      });
    } finally {
      await page.close();
    }
  }

  /**
   * Check for horizontal overflow
   */
  async checkHorizontalOverflow(page, viewport) {
    return await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const overflow = scrollWidth - clientWidth;
      
      let offendingElement = null;
      if (overflow > 0) {
        // Find the element causing overflow
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > clientWidth && !offendingElement) {
            offendingElement = {
              tag: el.tagName,
              class: el.className,
              id: el.id
            };
          }
        });
      }

      return {
        hasOverflow: overflow > 0,
        maxOverflow: Math.max(overflow, 0),
        totalWidth: scrollWidth,
        offendingElement
      };
    });
  }

  /**
   * Check font sizes for readability
   */
  async checkFontSizes(page) {
    return await page.evaluate(() => {
      const tooSmall = [];
      const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, button, a, span, li');
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseInt(style.fontSize);
        
        let type = 'body';
        if (el.tagName.match(/^H[1-6]$/)) type = 'heading';
        else if (el.tagName === 'BUTTON') type = 'button';
        else if (el.tagName === 'A') type = 'link';

        if (fontSize < 14) {
          tooSmall.push({
            element: `${el.tagName}${el.className ? '.' + el.className : ''}`,
            size: fontSize,
            type
          });
        }
      });

      return { tooSmall };
    });
  }

  /**
   * Check tap target sizes
   */
  async checkTapTargets(page) {
    return await page.evaluate(() => {
      const MIN_TAP_SIZE = 48;
      const tooSmall = [];
      
      const targets = document.querySelectorAll('a, button, [role="button"], input, select, textarea, [onclick]');
      targets.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.width < MIN_TAP_SIZE || rect.height < MIN_TAP_SIZE) {
          tooSmall.push({
            element: `${el.tagName}${el.className ? '.' + el.className : ''}`,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`
          });
        }
      });

      return { tooSmall };
    });
  }

  /**
   * Check viewport meta tag
   */
  async checkViewportMeta(page) {
    return await page.evaluate(() => {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewport = !!viewportMeta;
      
      let content = '';
      let hasWidthDevice = false;
      let hasInitialScale = false;
      let preventsZoom = false;

      if (hasViewport) {
        content = viewportMeta.getAttribute('content') || '';
        hasWidthDevice = content.includes('width=device-width');
        hasInitialScale = content.includes('initial-scale');
        preventsZoom = content.includes('user-scalable=no');
      }

      return {
        hasViewport,
        content,
        hasWidthDevice,
        hasInitialScale,
        preventsZoom
      };
    });
  }

  /**
   * Check for fixed elements
   */
  async checkFixedElements(page) {
    return await page.evaluate(() => {
      const fixedElements = [];
      const elements = document.querySelectorAll('*');
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed') {
          const rect = el.getBoundingClientRect();
          fixedElements.push({
            tag: el.tagName,
            class: el.className,
            id: el.id,
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
            zIndex: style.zIndex
          });
        }
      });

      return fixedElements;
    });
  }

  /**
   * Check image dimensions
   */
  async checkImages(page) {
    return await page.evaluate(() => {
      const overflowing = [];
      const maxWidth = document.documentElement.clientWidth;
      
      document.querySelectorAll('img').forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.width > maxWidth) {
          overflowing.push({
            src: img.src,
            alt: img.alt,
            dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}px`
          });
        }
      });

      return { overflowing };
    });
  }

  /**
   * Check text width for comfortable reading
   */
  async checkTextWidth(page, viewportWidth) {
    return await page.evaluate((vw) => {
      const tooWide = [];
      const elements = document.querySelectorAll('p, article, section');
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const width = el.getBoundingClientRect().width;
        const fontSize = parseInt(style.fontSize);
        const maxWidth = fontSize * 30; // ~30 characters per line
        
        if (width > maxWidth && width > (vw * 0.9)) {
          tooWide.push({
            tag: el.tagName,
            class: el.className,
            width: Math.round(width),
            fontSize
          });
        }
      });

      return { tooWide };
    }, viewportWidth);
  }

  /**
   * Collect general metrics
   */
  async collectGeneralMetrics(url) {
    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Check for media queries
      const mediaQueryData = await page.evaluate(() => {
        const styles = Array.from(document.styleSheets);
        const mediaQueries = styles.flatMap(sheet => {
          try {
            return Array.from(sheet.cssRules)
              .filter(rule => rule.type === CSSRule.MEDIA_RULE)
              .map(rule => ({ media: rule.media.mediaText }));
          } catch (e) {
            return [];
          }
        });

        return {
          hasMediaQueries: mediaQueries.length > 0,
          count: mediaQueries.length,
          queries: mediaQueries.slice(0, 5)
        };
      });

      this.results.generalMetrics = { mediaQueries: mediaQueryData };
    } finally {
      await page.close();
    }
  }

  /**
   * Generate recommendations based on analysis results
   */
  generateRecommendations() {
    const recommendations = {
      critical: [],
      important: [],
      suggestions: []
    };

    let hasViewport = true;
    let hasOverflow = false;
    let hasSmallTapTargets = false;
    let hasSmallFonts = false;
    let preventsZoom = false;

    // Analyze issues across all viewports
    this.results.viewports.forEach(vp => {
      if (vp.issues) {
        vp.issues.forEach(issue => {
          switch (issue.type) {
            case 'missing_viewport':
              hasViewport = false;
              break;
            case 'horizontal_overflow':
              hasOverflow = true;
              break;
            case 'small_tap_targets':
              hasSmallTapTargets = true;
              break;
            case 'small_font':
              hasSmallFonts = true;
              break;
            case 'prevents_zoom':
              preventsZoom = true;
              break;
          }
        });
      }
    });

    // Generate recommendations
    if (!hasViewport) {
      recommendations.critical.push({
        title: 'Add Viewport Meta Tag',
        description: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> to the <head> section. Without this, mobile browsers render pages at desktop width and scale them down, making text unreadable.',
        code: '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">'
      });
    }

    if (preventsZoom) {
      recommendations.important.push({
        title: 'Allow Users to Zoom',
        description: 'Remove "user-scalable=no" from the viewport meta tag. Preventing zoom accessibility is bad for accessibility and user experience.'
      });
    }

    if (hasOverflow) {
      recommendations.critical.push({
        title: 'Fix Horizontal Overflow',
        description: 'Content exceeds the viewport width. Common causes include: fixed-width elements, images without max-width:100%, or tables. Use max-width: 100vw on container elements and ensure images use max-width: 100%.',
        code: 'img, video, embed, iframe { max-width: 100%; height: auto; }'
      });
    }

    if (hasSmallTapTargets) {
      recommendations.important.push({
        title: 'Increase Tap Target Sizes',
        description: 'Ensure interactive elements are at least 48×48px. Use padding to increase touch area without affecting visual design. As recommended by Material Design guidelines.',
        code: '.button, .link, .nav-item { min-height: 48px; min-width: 48px; padding: 12px; }'
      });
    }

    if (hasSmallFonts) {
      recommendations.suggestions.push({
        title: 'Increase Font Sizes',
        description: 'Some text elements have font sizes below 14px. While 14px is acceptable for secondary text, ensure body text is at least 16px for comfortable reading on mobile.',
        code: 'body { font-size: 16px; } /* Minimum for body text */'
      });
    }

    // Check for media queries
    if (this.results.generalMetrics?.mediaQueries) {
      const mqData = this.results.generalMetrics.mediaQueries;
      if (!mqData.hasMediaQueries) {
        recommendations.critical.push({
          title: 'Add Responsive Media Queries',
          description: 'No media queries were found. Use media queries to adapt layout for different screen sizes.',
          code: `@media (max-width: 768px) {
  /* Mobile styles */
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet styles */
}

@media (min-width: 1025px) {
  /* Desktop styles */
}`
        });
      }
    }

    // General recommendations
    recommendations.important.push({
      title: 'Test on Real Devices',
      description: 'Testing on actual devices is the most reliable way to ensure good mobile UX. Emulators and simulators don\'t account for real-world factors like touch response and network conditions.'
    });

    recommendations.suggestions.push({
      title: 'Use Relative Units',
      description: 'Use em, rem, vw, vh, % instead of px for sizes. This allows content to scale naturally with the device and user preferences.',
      code: `/* Good */
.container { width: 90%; max-width: 1200px; }
.text { font-size: 1rem; padding: 1.5em; }

/* Bad */
.container { width: 960px; }
.text { font-size: 16px; padding: 24px; }`
    });

    recommendations.suggestions.push({
      title: 'Optimize Image Loading',
      description: 'Serve appropriately sized images for mobile using srcset or the <picture> element to reduce bandwidth and improve loading times.',
      code: `<picture>
  <source media="(max-width: 600px)" srcset="image-mobile.jpg">
  <source media="(max-width: 1024px)" srcset="image-tablet.jpg">
  <img src="image-desktop.jpg" alt="Description">
</picture>`
    });

    this.results.recommendations = recommendations;
    return recommendations;
  }

  /**
   * Generate the analysis report
   */
  generateReport() {
    this.generateRecommendations();

    const report = [
      '═══════════════════════════════════════════════════════════════',
      '          MOBILE RESPONSIVENESS ANALYSIS REPORT',
      '═══════════════════════════════════════════════════════════════',
      '',
      `Website: ${this.results.url}`,
      `Date: ${new Date().toLocaleString()}`,
      '',
      '─────────────────────────────────────────────────────────────',
      '  EXECUTIVE SUMMARY',
      '─────────────────────────────────────────────────────────────',
      '',
      this.generateExecutiveSummary(),
      '',
      '─────────────────────────────────────────────────────────────',
      '  VIEWPORT ANALYSIS',
      '─────────────────────────────────────────────────────────────',
      '',
      ...this.generateViewportSummary(),
      '',
      '─────────────────────────────────────────────────────────────',
      '  CRITICAL RECOMMENDATIONS',
      '─────────────────────────────────────────────────────────────',
      '',
      ...this.formatRecommendations(this.results.recommendations.critical, '🔴'),
      '',
      '─────────────────────────────────────────────────────────────',
      '  IMPORTANT RECOMMENDATIONS',
      '─────────────────────────────────────────────────────────────',
      '',
      ...this.formatRecommendations(this.results.recommendations.important, '🟡'),
      '',
      '─────────────────────────────────────────────────────────────',
      '  SUGGESTIONS FOR IMPROVEMENT',
      '─────────────────────────────────────────────────────────────',
      '',
      ...this.formatRecommendations(this.results.recommendations.suggestions, '💡'),
      '',
      '─────────────────────────────────────────────────────────────',
      '  DETAILED VIEWPORT RESULTS',
      '─────────────────────────────────────────────────────────────',
      '',
      ...this.generateDetailedResults(),
      '',
      '─────────────────────────────────────────────────────────────',
      '  BEST PRACTICES CHECKLIST',
      '─────────────────────────────────────────────────────────────',
      '',
      ...this.generateChecklist()
    ].join('\n');

    return report;
  }

  generateExecutiveSummary() {
    const totalIssues = this.results.viewports.reduce(
      (sum, vp) => sum + (vp.issues?.length || 0), 0
    );
    const criticalIssues = this.results.viewports.reduce((sum, vp) => {
      if (!vp.issues) return sum;
      return sum + vp.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length;
    }, 0);

    const overallScore = Math.max(0, 100 - (criticalIssues * 10) - (totalIssues * 2));

    return [
      `Overall Mobile-Friendliness Score: ${overallScore}/100`,
      '',
      `Total Viewports Tested: ${this.results.viewports.length}`,
      `Total Issues Found: ${totalIssues}`,
      `Critical/High Issues: ${criticalIssues}`,
      '',
      overallScore >= 90 ? '✅ Excellent mobile responsiveness' :
      overallScore >= 70 ? '⚠️ Good, but needs improvement' :
      overallScore >= 50 ? '❗ Poor mobile experience, needs significant work' :
      '🔴 Critical mobile issues, immediate attention required'
    ].join('\n');
  }

  generateViewportSummary() {
    return this.results.viewports.map(vp => {
      const issues = vp.issues || [];
      const issueSummary = issues.length === 0 
        ? '✅ No major issues detected'
        : issues.map(i => `  - ${i.description}`).join('\n');

      return [
        `📱 ${vp.name} (${vp.dimensions?.width}x${vp.dimensions?.height})`,
        `   Issues: ${issues.length}`,
        `   ${issueSummary}`,
        ''
      ].join('\n');
    });
  }

  formatRecommendations(recommendations, emoji) {
    if (recommendations.length === 0) return ['None'];  
    return recommendations.flatMap(rec => [
      `${emoji} ${rec.title}`,
      ...rec.description.split('\n').map(line => `   ${line}`),
      ...(rec.code ? ['', '   Recommended implementation:', ...rec.code.split('\n').map(line => `   ${line}`)] : []),
      ''
    ]);
  }

  generateDetailedResults() {
    return this.results.viewports.flatMap(vp => [
      `Device: ${vp.name}`,
      `Resolution: ${vp.dimensions?.width}x${vp.dimensions?.height}`,
      '',
      ...(vp.issues || []).map(issue => [
        `  [!] ${issue.description}`,
        `      Severity: ${issue.severity}`,
        ...(issue.element ? [`      Element: ${JSON.stringify(issue.element)}`] : []),
        ''
      ].join('\n')),
      vp.issues?.length === 0 ? '  ✅ No issues found\n' : '',
      '───────────────────────────────────────────────────────'
    ]);
  }

  generateChecklist() {
    return [
      '  □ Viewport meta tag is present and correct',
      '  □ Content fits within viewport (no horizontal scroll)',
      '  □ Font sizes are legible on small screens (≥14px)',
      '  □ Tap targets are large enough (≥48×48px)',
      '  □ Images are responsive (max-width: 100%)',
      '  □ Media queries are used for different screen sizes',
      '  □ Fixed elements don\'t obstruct content or touch targets',
      '  □ Text is readable (line length < 75 characters)',
      '  □ Users can zoom (no user-scalable=no)',
      '  □ Touch targets have adequate spacing (≥8px apart)',
      '  □ Forms are easy to use on mobile (sufficient input height)',
      '  □ Loading states are optimized for mobile networks',
      ''
    ];
  }

  /**
   * Save report to file
   */
  async saveReport(filename = 'mobile-analysis-report.txt') {
    const report = this.generateReport();
    await fs.promises.writeFile(filename, report, 'utf8');
    return filename;
  }

  /**
   * Close the browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI usage
async function main() {
  const url = process.argv[2] || 'https://example.com';
  const outputFile = process.argv[3] || 'mobile_responsiveness_report.txt';

  console.log(`🔍 Analyzing website: ${url}\n`);

  const analyzer = new MobileResponsivenessAnalyzer();

  try {
    await analyzer.initialize();
    await analyzer.analyze(url);
    
    const filename = await analyzer.saveReport(outputFile);
    console.log(`\n✅ Analysis complete! Report saved to: ${filename}`);
    
    // Also print a summary
    console.log('\n┌──────────────────────────────────────────────────┐');
    console.log('│           QUICK SUMMARY                          │');
    console.log('├──────────────────────────────────────────────────┤');
    console.log(`│ Website analyzed: ${url.slice(0, 30).padEnd(30, ' ')} │`);
    console.log(`│ Viewports tested:   ${analyzer.results.viewports.length}                    │`);
    console.log(`│ Output file: ${outputFile}     │`);
    console.log('└──────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await analyzer.close();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MobileResponsivenessAnalyzer };
