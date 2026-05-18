# Mobile Responsiveness Analyzer

A comprehensive tool that analyzes any website's mobile responsiveness across multiple device viewports and generates detailed suggestions for improvement.

## Features

- **Multi-Device Testing**: Tests across 6 standard mobile and tablet viewport sizes
- **Comprehensive Checks**:
  - Viewport meta tag presence and correctness
  - Horizontal overflow detection
  - Font size readability
  - Tap target sizing (minimum 48×48px)
  - Image responsiveness
  - Fixed element analysis
  - Text width optimization
  - Media query detection
- **Detailed Reporting**: Generates a text-based report with:
  - Executive summary with score
  - Per-viewport analysis
  - Severity-based recommendations
  - Implementation code examples
  - Best practices checklist

## Prerequisites

Node.js and npm must be installed on your system.

## Installation

1. Open a terminal in this project directory
2. Install the required dependency:

```bash
npm install puppeteer
```

## Usage

### Basic Usage

```bash
node mobile_analyzer.js <URL> [output_filename]
```

### Examples

```bash
# Analyze a website with default output filename
node mobile_analyzer.js https://example.com

# Analyze a website with custom output filename
node mobile_analyzer.js https://example.com my_report.txt

# Analyze a local development server
node mobile_analyzer.js http://localhost:3000
```

### As a Module

```javascript
const { MobileResponsivenessAnalyzer } = require('./mobile_analyzer');

async function analyzeWebsite() {
  const analyzer = new MobileResponsivenessAnalyzer();
  
  await analyzer.initialize();
  const results = await analyzer.analyze('https://example.com');
  const reportPath = await analyzer.saveReport('report.txt');
  
  console.log(`Report saved to: ${reportPath}`);
  await analyzer.close();
}

analyzeWebsite();
```

## Report Output

The tool generates a detailed text report (`mobile_responsiveness_report.txt` by default) containing:

1. **Executive Summary**
   - Overall mobile-friendliness score (0-100)
   - Total issues found
   - Overall assessment

2. **Critical Recommendations** (🔴)
   - Issues that severely impact mobile usability
   - Includes code examples for fixes

3. **Important Recommendations** (🟡)
   - Significant improvements for better UX
   - Implementation guidance

4. **Suggestions** (💡)
   - Best practices for optimization
   - Code examples and patterns

5. **Detailed Viewport Results**
   - Per-device analysis
   - Specific issue details
   - Affected elements

6. **Best Practices Checklist**
   - Comprehensive checklist for mobile optimization

## Checked Viewport Sizes

| Device | Resolution |
|--------|-----------|
| iPhone SE | 375×667 |
| iPhone 12 | 390×844 |
| iPhone 12 Pro Max | 428×926 |
| Samsung Galaxy S20 | 360×800 |
| iPad Mini | 768×1024 |
| iPad Air | 820×1180 |

## What It Detects

1. **Missing Viewport Meta Tag**
   - Critical: Without this, mobile browsers render at desktop width
   
2. **Horizontal Overflow**
   - Content exceeding viewport width
   - Common causes: fixed-width elements, unresponsive images

3. **Small Tap Targets**
   - Interactive elements smaller than 48×48px
   - Affects touch usability

4. **Small Font Sizes**
   - Text below recommended minimum (14px)
   - Impacts readability

5. **Fixed Elements**
   - Elements that might obstruct content
   - Can cause usability issues on small screens

6. **Unzoom Prevention**
   - `user-scalable=no` in viewport meta
   - Bad for accessibility

7. **Large Images**
   - Images exceeding viewport width
   - Can cause horizontal scroll

8. **Missing Media Queries**
   - No responsive CSS rules detected
   - Essential for responsive design

## Tips for Mobile Optimization

### Use Responsive Units
```css
.container {
  width: 90%;        /* Relative to viewport */
  max-width: 1200px; /* But not too wide */
}

.text {
  font-size: 1rem;   /* Scales with user preference */
  padding: 1.5em;    /* Relative to font */
}
```

### Implement Media Queries
```css
/* Mobile first approach */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Ensure Images Are Responsive
```css
img, video, embed, iframe {
  max-width: 100%;
  height: auto;
}
```

### Accessibility Best Practices
```html
<!-- Good: Allows zooming -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- Bad: Prevents zooming (bad for accessibility) -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
```

## Troubleshooting

### Puppeteer Installation Issues

If Puppeteer fails to install Chromium:

```bash
# Install Puppeteer without Chromium (use system Chrome)
npm install puppeteer --ignore-scripts

# Or install with specific Chrome path
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome npm install puppeteer
```

### Memory Issues

For large websites, you may need to increase Node.js memory limit:

```bash
node --max-old-space-size=4096 mobile_analyzer.js https://example.com
```

## Limitations

- Requires JavaScript execution (won't work with static HTML only)
- Network connection needed to load external resources
- Cannot detect all dynamic states (hover effects, dropdowns etc.)
- Some responsive design features may require interaction to trigger

## Dependencies

- **Puppeteer**: For browser automation and testing
  ```
  npm install puppeteer
  ```

## License

MIT
