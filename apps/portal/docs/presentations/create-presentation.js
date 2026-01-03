/**
 * DEMA Group Portal Build Optimization Presentation Generator
 * Generated from documentation in apps/portal/docs/
 */
/**
 * Presentation Configuration
 */
const PRESENTATION_CONFIG = {
  duration: 30, // minutes
  qaTime: 15,   // minutes
  // Transitions temporarily disabled
  animations: false,
  layout: {
    margins: { top: 40, left: 40, right: 40, bottom: 40 },
    chartSize: { width: 500, height: 300 },
    diagramSize: { width: 600, height: 400 }
  }
};

/**
 * Creates the DEMA Group Portal Build Optimization presentation
 */
function createDEMAPresentation() {
  // 1. CONFIGURATION
  // DEMA Brand Colors and Status Colors from METRICS-SUMMARY.md
  // Create presentation with standard 16:9 layout
  var deck = SlidesApp.create('DEMA Group Portal - Optimization Strategy');

  // Create initial slide for progress bar
  var progressSlide = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);

  // Theme configuration
  var theme = {
    // Brand Colors
    primary: '#0047AB',    // Blue
    accent: '#FF6B00',     // Orange
    bg: '#F5F5F5',         // Light Gray
    text: '#333333',
    white: '#FFFFFF',
    // Status Colors
    success: '#00C853',    // Green
    warning: '#FFD600',    // Yellow
    error: '#FF3D00',      // Red
    info: '#2962FF'        // Info Blue
  };

  // Track progress for loading animation
  var progress = createProgressBar(progressSlide, theme);
  var totalSteps = 14; // Total number of slides
  var currentStep = 0;

  // Create slides with progress updates
  function updateProgress() {
    currentStep++;
    progress.updateProgress(currentStep / totalSteps);
  }

  // 2. SLIDE GENERATION WITH ANIMATIONS
  createTitleSlide(deck, theme); updateProgress();
  createAgendaSlide(deck, theme); updateProgress();
  createOverviewSlide(deck, theme); updateProgress();
  createMetricsSlide(deck, theme); updateProgress();
  createBuildFlowSlide(deck, theme); updateProgress();
  createMemorySlide(deck, theme); updateProgress();
  createCacheSlide(deck, theme); updateProgress();
  createErrorSlide(deck, theme); updateProgress();
  createOptimizationSlide(deck, theme); updateProgress();
  createPerformanceSlide(deck, theme); updateProgress();
  createTimelineSlide(deck, theme); updateProgress();
  createRiskSlide(deck, theme); updateProgress();
  createNextStepsSlide(deck, theme); updateProgress();
  createQASlide(deck, theme); updateProgress();

  // Transitions temporarily disabled
  // applyTransitions(deck);

  // Add navigation buttons
  addNavigation(deck, theme);

  // Remove progress bar after completion
  progress.remove();

  Logger.log('Presentation created: ' + deck.getUrl());
}

// --- SLIDE 1: TITLE ---
/**
 * Creates a progress bar for slide generation
 */
function createProgressBar(slide, theme) {
  // Use fixed width for progress bar
  const PROGRESS_WIDTH = 600; // Standard presentation width
  
  // Create initial progress bar with minimum width
  var bar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 0, 0, 1, 5);
  bar.getFill().setSolidFill(theme.accent);

  return {
    updateProgress: function(percent) {
      // Ensure minimum width of 1
      var width = Math.max(1, PROGRESS_WIDTH * percent);
      bar.setWidth(width);
      bar.setLeft(0);
    },
    remove: function() {
      slide.remove(); // Remove entire progress slide
    }
  };
}

// Transitions temporarily disabled
// function applyTransitions(deck) {
//   // Will be re-enabled in next version
// }

/**
 * Adds navigation buttons to all slides
 */
function addNavigation(deck, theme) {
  deck.getSlides().forEach((slide, index) => {
    if (index > 0) { // Skip first slide
      // Add footer shape for navigation
      var footer = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 0, 510, 720, 40);
      footer.getFill().setSolidFill(theme.primary);
      footer.getBorder().setTransparent();
      
      // Add navigation text
      var navText = footer.getText();
      navText.setText('← Previous     Next →');
      navText.getTextStyle().setForegroundColor(theme.white);
      navText.getTextStyle().setBold(true);
      navText.getTextStyle().setFontSize(14);
      
      // Center text
      var textRange = navText.getTextStyle();
      textRange.setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
    }
  });
}

/**
 * Creates the title slide
 */
function createTitleSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getBackground().setSolidFill(theme.primary);
  
  var title = slide.getShapes()[0];
  var subtitle = slide.getShapes()[1];
  
  var titleText = title.getText();
  titleText.setText("DEMA Group Portal: Build Optimization");
  titleText.getTextStyle().setForegroundColor(theme.white);
  titleText.getTextStyle().setBold(true);
  
  var date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  var subtitleText = subtitle.getText();
  subtitleText.setText(`Status: CRITICAL | Build Optimization Strategy\n${date}`);
  subtitleText.getTextStyle().setForegroundColor(theme.accent);

  // Add speaker notes
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Welcome to our build optimization presentation.\n\n' +
    'Key Points:\n' +
    '- Current build time: 13 minutes (target: 5 minutes)\n' +
    '- Memory usage at warning levels\n' +
    '- Cache performance needs improvement\n' +
    '\nAction Required: Immediate optimization needed'
  );
}

// --- SLIDE 2: AGENDA ---
function createAgendaSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Today's Agenda");
  
  var body = slide.getShapes()[1];
  var agenda = [
    "1. Current Build Status",
    "2. Performance Metrics",
    "3. Build Process Analysis",
    "4. Memory & Cache Issues",
    "5. Error Distribution",
    "6. Optimization Strategy",
    "7. Risk Assessment",
    "8. Action Plan & Next Steps"
  ];
  
  body.getText().setText(agenda.join("\n"));

  // Add speaker notes
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Agenda Overview:\n\n' +
    '- Start with current status\n' +
    '- Deep dive into metrics\n' +
    '- Focus on critical issues\n' +
    '- Present optimization plan\n\n' +
    'Time allocation: 30 minutes + 15 minutes Q&A'
  );
}

// --- SLIDE 3: OVERVIEW (The Grim Reality) ---
function createOverviewSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_ONLY);
  slide.getShapes()[0].getText().setText("Current Build Status");
  
  // Data from METRICS-SUMMARY.md
  var metrics = [
    { 
      label: "Build Time", 
      val: "13 min", 
      target: "5 min",
      status: "CRITICAL" 
    },
    { 
      label: "Memory", 
      val: "2.8 GB", 
      target: "2.0 GB",
      status: "WARNING" 
    },
    { 
      label: "Cache Rate", 
      val: "65%", 
      target: "80%",
      status: "WARNING" 
    },
    { 
      label: "Success Rate", 
      val: "92%", 
      target: "99%",
      status: "DEGRADING" 
    }
  ];

  for (var i = 0; i < metrics.length; i++) {
    var box = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, 50 + (i*200), 150, 180, 150);
    var metric = metrics[i];
    var statusColor = getStatusColor(metric.status, theme);
    box.getFill().setSolidFill(theme.white);
    box.getBorder().setTransparent();
    
    var textRange = box.getText();
    textRange.setText(
      `${metric.val}\n` +
      `${metric.label}\n` +
      `Target: ${metric.target}\n` +
      `${metric.status}`
    );
    
    // Styling
    textRange.getParagraphs()[0].getRange().getTextStyle().setFontSize(32).setBold(true).setForegroundColor(theme.primary);
    textRange.getParagraphs()[2].getRange().getTextStyle().setForegroundColor(theme.primary).setFontSize(12);
    textRange.getParagraphs()[3].getRange().getTextStyle().setForegroundColor(statusColor).setFontSize(12).setBold(true);
  }
}

// --- SLIDE 3: METRICS CHART ---
function createMetricsSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_ONLY);
  slide.getShapes()[0].getText().setText("Build Time Distribution");
  
  // Data from METRICS-SUMMARY.md
  // Create metrics table
  var table = slide.insertTable(7, 2);
  
  // Set headers
  table.getCell(0, 0).getText().setText('Task');
  table.getCell(0, 1).getText().setText('Percentage');
  
  // Add data
  var data = [
    ['TypeScript Compilation', '25%'],
    ['Next.js Build', '35%'],
    ['Asset Optimization', '20%'],
    ['Pre-build Tasks', '10%'],
    ['Error Handling', '5%'],
    ['Deployment', '5%']
  ];
  
  // Fill table
  data.forEach((row, i) => {
    table.getCell(i + 1, 0).getText().setText(row[0]);
    table.getCell(i + 1, 1).getText().setText(row[1]);
  });
  
  // Style table
  for (var i = 0; i < 7; i++) {
    for (var j = 0; j < 2; j++) {
      var cell = table.getCell(i, j);
      if (i === 0) {
        cell.getFill().setSolidFill(theme.primary);
        cell.getText().getTextStyle().setForegroundColor(theme.white);
        cell.getText().getTextStyle().setBold(true);
      } else {
        cell.getFill().setSolidFill(theme.white);
        cell.getText().getTextStyle().setForegroundColor(theme.text);
      }
    }
  }
  
  // Position table
  table.setLeft(150);
  table.setTop(100);
}

// --- SLIDE 4: BUILD FLOW ---
function createBuildFlowSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Build Process Flow");
  
  // Create build flow diagram using shapes
  createBuildFlowDiagram(slide, theme);
}

function createBuildFlowDiagram(slide, theme) {
  var steps = [
    { text: "Git Push", x: 50, y: 100 },
    { text: "Pre-build", x: 200, y: 100 },
    { text: "Build", x: 350, y: 100 },
    { text: "Deploy", x: 500, y: 100 },
    { text: "Error Handler", x: 350, y: 200 }
  ];

  steps.forEach(step => {
    var shape = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, step.x, step.y, 100, 50);
    shape.getFill().setSolidFill(theme.primary);
    var stepText = shape.getText();
    stepText.setText(step.text);
    stepText.getTextStyle().setForegroundColor(theme.white);
  });

  // Add arrows
  addArrow(slide, 150, 125, 200, 125, theme);
  addArrow(slide, 300, 125, 350, 125, theme);
  addArrow(slide, 450, 125, 500, 125, theme);
  addArrow(slide, 400, 150, 400, 200, theme);
}

function addArrow(slide, x1, y1, x2, y2, theme) {
  // Create arrow using basic shapes
  var arrow = slide.insertShape(SlidesApp.ShapeType.RECTANGLE);
  
  // Calculate dimensions
  var dx = x2 - x1;
  var dy = y2 - y1;
  var length = Math.sqrt(dx * dx + dy * dy);
  var angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // Set arrow properties
  arrow.setLeft(x1);
  arrow.setTop(y1 - 1); // Offset for line thickness
  arrow.setWidth(length);
  arrow.setHeight(2);
  arrow.setRotation(angle);
  
  // Style arrow
  arrow.getFill().setSolidFill(theme.accent);
  arrow.getBorder().setTransparent();
}

function createMemorySlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Memory Usage Trend");

  // Create data table
  var data = [
    ['Time', 'Usage (GB)'],
    ['T-4', '2.3'],
    ['T-3', '2.5'],
    ['T-2', '2.8'],
    ['T-1', '2.7'],
    ['Now', '2.8']
  ];

  // Create and style table
  var table = slide.insertTable(data.length, data[0].length);
  
  // Fill and style table
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++) {
      var cell = table.getCell(i, j);
      cell.getText().setText(data[i][j]);
      
      if (i === 0) {
        cell.getFill().setSolidFill(theme.primary);
        cell.getText().getTextStyle().setForegroundColor(theme.white);
        cell.getText().getTextStyle().setBold(true);
      } else {
        cell.getFill().setSolidFill(theme.white);
        cell.getText().getTextStyle().setForegroundColor(theme.text);
        if (j === 1) { // Highlight memory values
          cell.getText().getTextStyle().setForegroundColor(theme.error);
        }
      }
    }
  }

  // Position table
  table.setLeft(150);
  table.setTop(100);
}

// --- SLIDE 6: CACHE PERFORMANCE ---
function createCacheSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Cache Performance");

  // Create data table
  var data = [
    ['Type', 'Percentage'],
    ['Hit Rate', '65%'],
    ['Miss Rate', '35%']
  ];

  // Create and style table
  var table = slide.insertTable(data.length, data[0].length);
  
  // Fill and style table
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++) {
      var cell = table.getCell(i, j);
      cell.getText().setText(data[i][j]);
      
      if (i === 0) {
        cell.getFill().setSolidFill(theme.primary);
        cell.getText().getTextStyle().setForegroundColor(theme.white);
        cell.getText().getTextStyle().setBold(true);
      } else {
        cell.getFill().setSolidFill(theme.white);
        cell.getText().getTextStyle().setForegroundColor(theme.text);
        if (j === 1) { // Color percentages
          cell.getText().getTextStyle().setForegroundColor(i === 1 ? theme.success : theme.error);
        }
      }
    }
  }

  // Position table
  table.setLeft(150);
  table.setTop(100);
}

// --- SLIDE 7: ERROR DISTRIBUTION ---
function createErrorSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Error Distribution");

  // Create data table
  var data = [
    ['Type', 'Percentage'],
    ['TypeScript', '40%'],
    ['Memory', '25%'],
    ['Cache', '15%'],
    ['Build', '12%'],
    ['Other', '8%']
  ];

  // Create and style table
  var table = slide.insertTable(data.length, data[0].length);
  
  // Fill and style table
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++) {
      var cell = table.getCell(i, j);
      cell.getText().setText(data[i][j]);
      
      if (i === 0) {
        cell.getFill().setSolidFill(theme.primary);
        cell.getText().getTextStyle().setForegroundColor(theme.white);
        cell.getText().getTextStyle().setBold(true);
      } else {
        cell.getFill().setSolidFill(theme.white);
        cell.getText().getTextStyle().setForegroundColor(theme.text);
        if (j === 1) { // Color percentages
          cell.getText().getTextStyle().setForegroundColor(theme.error);
        }
      }
    }
  }

  // Position table
  table.setLeft(150);
  table.setTop(100);
}

// --- SLIDE 8: OPTIMIZATION TARGETS ---
function createOptimizationSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_ONLY);
  slide.getShapes()[0].getText().setText("Optimization Strategy: The Gap");

  // Data from METRICS-SUMMARY.md (Optimization Targets)
  // Create data table
  var data = [
    ['Metric', 'Current', 'Target'],
    ['Build Time (min)', '13', '5'],
    ['Memory (GB)', '2.8', '2.0'],
    ['Cache Rate (%)', '65', '80'],
    ['Error Rate (%)', '2', '1']
  ];

  // Create and style table
  var table = slide.insertTable(data.length, data[0].length);
  
  // Fill and style table
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++) {
      var cell = table.getCell(i, j);
      cell.getText().setText(data[i][j]);
      
      if (i === 0) {
        cell.getFill().setSolidFill(theme.primary);
        cell.getText().getTextStyle().setForegroundColor(theme.white);
        cell.getText().getTextStyle().setBold(true);
      } else {
        cell.getFill().setSolidFill(theme.white);
        cell.getText().getTextStyle().setForegroundColor(theme.text);
        if (j === 1) { // Color current values
          cell.getText().getTextStyle().setForegroundColor(theme.error);
        } else if (j === 2) { // Color target values
          cell.getText().getTextStyle().setForegroundColor(theme.success);
        }
      }
    }
  }

  // Position table
  table.setLeft(150);
  table.setTop(100);
}

// --- SLIDE 9: PERFORMANCE TIMELINE ---
function createPerformanceSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Build Performance Timeline");

  // Create data table
  var data = [
    ['Phase', 'Duration (s)'],
    ['Pre-build', '60'],
    ['TypeScript', '180'],
    ['Next.js', '300'],
    ['Assets', '240']
  ];

  // Create and style table
  var table = slide.insertTable(data.length, data[0].length);
  
  // Fill and style table
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++) {
      var cell = table.getCell(i, j);
      cell.getText().setText(data[i][j]);
      
      if (i === 0) {
        cell.getFill().setSolidFill(theme.primary);
        cell.getText().getTextStyle().setForegroundColor(theme.white);
        cell.getText().getTextStyle().setBold(true);
      } else {
        cell.getFill().setSolidFill(theme.white);
        cell.getText().getTextStyle().setForegroundColor(theme.text);
        if (j === 1) { // Color durations
          cell.getText().getTextStyle().setForegroundColor(theme.primary);
        }
      }
    }
  }

  // Position table
  table.setLeft(150);
  table.setTop(100);
}

// --- SLIDE 10: RESOURCE TIMELINE ---
function createTimelineSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Resource Usage Timeline");

  // Create data table
  var data = [
    ['Resource', 'Current', 'Target', 'Max'],
    ['CPU (%)', '75', '60', '90'],
    ['Memory (GB)', '2.8', '2.0', '3.0'],
    ['Disk (%)', '45', '40', '50']
  ];

  // Create and style table
  var table = slide.insertTable(data.length, data[0].length);
  
  // Fill and style table
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < data[0].length; j++) {
      var cell = table.getCell(i, j);
      cell.getText().setText(data[i][j]);
      
      if (i === 0) {
        cell.getFill().setSolidFill(theme.primary);
        cell.getText().getTextStyle().setForegroundColor(theme.white);
        cell.getText().getTextStyle().setBold(true);
      } else {
        cell.getFill().setSolidFill(theme.white);
        cell.getText().getTextStyle().setForegroundColor(theme.text);
        if (j === 1) { // Color current values
          cell.getText().getTextStyle().setForegroundColor(theme.error);
        } else if (j === 2) { // Color target values
          cell.getText().getTextStyle().setForegroundColor(theme.success);
        } else if (j === 3) { // Color max values
          cell.getText().getTextStyle().setForegroundColor(theme.warning);
        }
      }
    }
  }

  // Position table
  table.setLeft(150);
  table.setTop(100);
}

// --- SLIDE 12: RISK ASSESSMENT ---
function createRiskSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_TWO_COLUMNS);
  slide.getShapes()[0].getText().setText("Risk Assessment");

  var leftColumn = slide.getShapes()[1];
  var rightColumn = slide.getShapes()[2];

  var risks = [
    "🔴 Build Timeouts",
    "🟡 Memory Leaks",
    "🟡 Cache Invalidation",
    "🟢 Type Errors"
  ];

  var mitigations = [
    "✓ Parallel Processing",
    "✓ GC Optimization",
    "✓ Cache Strategy",
    "✓ Type Checking"
  ];

  leftColumn.getText().setText("Identified Risks:\n" + risks.join("\n"));
  rightColumn.getText().setText("Mitigations:\n" + mitigations.join("\n"));

  // Add speaker notes
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Risk Analysis:\n\n' +
    '- Red: Critical risks needing immediate attention\n' +
    '- Yellow: Medium risks to address in phase 2\n' +
    '- Green: Managed risks with monitoring\n\n' +
    'All risks have defined mitigation strategies'
  );
}

// --- SLIDE 13: NEXT STEPS ---
function createNextStepsSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Immediate Next Steps");
  
  var body = slide.getShapes()[1];
  // Action plan based on BUILD-PROCESS.md
  var steps = [
    "1. Reduce Build Time (13min → 5min):\n   - Parallelize TypeScript compilation\n   - Optimize asset processing\n   - Enable incremental builds",
    "2. Fix Memory Usage (2.8GB → 2.0GB):\n   - Implement GC triggers\n   - Optimize module resolution\n   - Clear unnecessary caches",
    "3. Improve Cache (65% → 80%):\n   - Move to offline package preference\n   - Optimize cache keys\n   - Add more cache layers",
    "4. Next Phase:\n   - Implement automated performance monitoring\n   - Set up error pattern detection\n   - Create self-healing mechanisms"
  ];
  
  body.getText().setText(steps.join("\n\n"));

  // Add speaker notes
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Action Plan Details:\n\n' +
    '1. Build Time Optimization:\n' +
    '   - Start with TypeScript parallelization\n' +
    '   - Implement in phases\n\n' +
    '2. Memory Management:\n' +
    '   - Focus on GC triggers first\n' +
    '   - Monitor impact\n\n' +
    '3. Cache Improvements:\n' +
    '   - Begin with offline packages\n' +
    '   - Measure hit rates\n\n' +
    'Timeline: 2 weeks per phase'
  );
}

// --- SLIDE 14: Q&A ---
function createQASlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Questions & Discussion");

  // Create contact info box
  var shape = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, 200, 200, 300, 150);
  shape.getFill().setSolidFill(theme.primary);
  
  var text = shape.getText();
  text.setText(
    "Contact Information:\n\n" +
    "DevOps Team\n" +
    "devops@dema-group.com\n" +
    "Slack: #build-optimization"
  );
  text.getTextStyle().setForegroundColor(theme.white);

  // Add speaker notes
  slide.getNotesPage().getSpeakerNotesShape().getText().setText(
    'Q&A Session:\n\n' +
    '- Open floor for questions\n' +
    '- Focus on implementation details\n' +
    '- Discuss timeline concerns\n' +
    '- Address resource needs\n\n' +
    'Key Points to Emphasize:\n' +
    '- Phased approach\n' +
    '- Continuous monitoring\n' +
    '- Team support available'
  );
}

/**
 * Helper function to get status color
 */
/**
 * Adds interactive elements to a slide
 */
function addInteractiveElements(slide, deck, theme) {
  // Add help button
  var helpButton = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, 680, 10, 30, 30);
  helpButton.getFill().setSolidFill(theme.info);
  helpButton.getText().setText('?');
  helpButton.getText().getTextStyle().setForegroundColor(theme.white).setBold(true);
  helpButton.getBorder().setTransparent();

  // Add timestamp
  var timestamp = slide.insertTextBox(`Last Updated: ${new Date().toLocaleString()}`);
  timestamp.setLeft(10);
  timestamp.setTop(490);
  timestamp.getText().getTextStyle().setFontSize(8).setForegroundColor(theme.text);
}

/**
 * Adds detailed speaker notes to a slide
 */
function addDetailedNotes(slide, notes) {
  var speakerNotes = slide.getNotesPage().getSpeakerNotesShape();
  var fullNotes = [
    '=== Speaker Notes ===\n',
    `Time Allocation: ${notes.time || '2-3'} minutes\n`,
    '\nKey Points:\n' + notes.points.map(p => `- ${p}`).join('\n'),
    '\nTransitions:\n' + notes.transitions.map(t => `- ${t}`).join('\n'),
    '\nQuestions to Address:\n' + notes.questions.map(q => `- ${q}`).join('\n'),
    '\nResources:\n' + notes.resources.map(r => `- ${r}`).join('\n')
  ].join('\n');

  speakerNotes.getText().setText(fullNotes);
}

/**
 * Gets the appropriate status color
 */
function getStatusColor(status, theme) {
  switch(status.toUpperCase()) {
    case 'CRITICAL': return theme.error;
    case 'WARNING': return theme.warning;
    case 'SUCCESS': return theme.success;
    default: return theme.info;
  }
}