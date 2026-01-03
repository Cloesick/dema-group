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
  animations: {
    entry: SlidesApp.TransitionType.FADE,
    charts: SlidesApp.TransitionType.SLIDE,
    diagrams: SlidesApp.TransitionType.DISSOLVE
  },
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
  // Create presentation with custom settings
  var deck = SlidesApp.create('DEMA Group Portal - Optimization Strategy');
  deck.setPageHeight(PRESENTATION_CONFIG.layout.margins.top + PRESENTATION_CONFIG.layout.chartSize.height + PRESENTATION_CONFIG.layout.margins.bottom);
  deck.setPageWidth(PRESENTATION_CONFIG.layout.margins.left + PRESENTATION_CONFIG.layout.chartSize.width + PRESENTATION_CONFIG.layout.margins.right);

  // Remove default first slide
  var slides = deck.getSlides();
  if (slides.length > 0) { slides[0].remove(); }

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
  var progress = createProgressBar(deck, theme);
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

  // Apply transitions
  applyTransitions(deck);

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
function createProgressBar(deck, theme) {
  var slide = deck.getSlides()[0];
  var bar = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, 0, 0, 0, 5);
  bar.getFill().setSolidFill(theme.accent);

  return {
    updateProgress: function(percent) {
      bar.setWidth(deck.getPageWidth() * percent);
    },
    remove: function() {
      bar.remove();
    }
  };
}

/**
 * Applies transitions to all slides
 */
function applyTransitions(deck) {
  deck.getSlides().forEach((slide, index) => {
    const transition = slide.getTransition();
    if (index === 0) {
      transition.setType(PRESENTATION_CONFIG.animations.entry);
    } else if (slide.getShapes().some(s => s.getPageElementType() === SlidesApp.PageElementType.SHEETS_CHART)) {
      transition.setType(PRESENTATION_CONFIG.animations.charts);
    } else {
      transition.setType(PRESENTATION_CONFIG.animations.diagrams);
    }
  });
}

/**
 * Adds navigation buttons to all slides
 */
function addNavigation(deck, theme) {
  deck.getSlides().forEach((slide, index) => {
    if (index > 0) { // Skip first slide
      var prevButton = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, 10, slide.getPageHeight() - 40, 30, 30);
      var nextButton = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, slide.getPageWidth() - 40, slide.getPageHeight() - 40, 30, 30);
      
      prevButton.getFill().setSolidFill(theme.primary);
      nextButton.getFill().setSolidFill(theme.primary);
      
      prevButton.getText().setText('←');
      nextButton.getText().setText('→');
      
      [prevButton, nextButton].forEach(btn => {
        btn.getText().getInputStyle().setForegroundColor(theme.white).setBold(true);
        btn.getBorder().setTransparent();
      });
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
  
  title.getText().setText("DEMA Group Portal: Build Optimization"); //
  title.getText().getInputStyle().setForegroundColor(theme.white).setBold(true);
  
  var date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  subtitle.getText().setText(`Status: CRITICAL | Build Optimization Strategy\n${date}`);
  subtitle.getText().getInputStyle().setForegroundColor(theme.accent);

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
    textRange.getParagraphs()[0].getRange().getInputStyle().setFontSize(32).setBold(true).setForegroundColor(theme.primary);
    textRange.getParagraphs()[2].getRange().getInputStyle().setForegroundColor(theme.primary).setFontSize(12);
    textRange.getParagraphs()[3].getRange().getInputStyle().setForegroundColor(statusColor).setFontSize(12).setBold(true);
  }
}

// --- SLIDE 3: METRICS CHART ---
function createMetricsSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_ONLY);
  slide.getShapes()[0].getText().setText("Build Time Distribution");
  
  // Data from METRICS-SUMMARY.md
  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Task")
    .addColumn(Charts.ColumnType.NUMBER, "Percentage")
    .addRow(["TypeScript Compilation", 25])
    .addRow(["Next.js Build", 35])
    .addRow(["Asset Optimization", 20])
    .addRow(["Pre-build Tasks", 10])
    .addRow(["Error Handling", 5])
    .addRow(["Deployment", 5])
    .build();

  var chart = Charts.newPieChart()
    .setDataTable(data)
    .setOption('title', 'Time Allocation (Total: 13 mins)')
    .setOption('colors', [theme.primary, theme.accent, '#808080', '#A9A9A9', '#D3D3D3', '#C0C0C0'])
    .build();

  slide.insertSheetsChart(chart, 150, 100, 450, 350);
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
    shape.getText().setText(step.text).getInputStyle().setForegroundColor(theme.white);
  });

  // Add arrows
  addArrow(slide, 150, 125, 200, 125, theme);
  addArrow(slide, 300, 125, 350, 125, theme);
  addArrow(slide, 450, 125, 500, 125, theme);
  addArrow(slide, 400, 150, 400, 200, theme);
}

function addArrow(slide, x1, y1, x2, y2, theme) {
  var arrow = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, x1, y1, x2, y2);
  arrow.setWeight(2).setForegroundColor(theme.accent);
  arrow.getEndArrow().setType(SlidesApp.ArrowType.FILLED);
}

// --- SLIDE 5: MEMORY USAGE ---
function createMemorySlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Memory Usage Trend");

  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Time")
    .addColumn(Charts.ColumnType.NUMBER, "Usage (GB)")
    .addRow(["T-4", 2.3])
    .addRow(["T-3", 2.5])
    .addRow(["T-2", 2.8])
    .addRow(["T-1", 2.7])
    .addRow(["Now", 2.8])
    .build();

  var chart = Charts.newLineChart()
    .setDataTable(data)
    .setOption('title', 'Memory Usage Over Time')
    .setOption('colors', [theme.error])
    .setOption('vAxis', {title: 'GB Used', viewWindow: {min: 0, max: 4}})
    .build();

  slide.insertSheetsChart(chart, 100, 100, 500, 300);
}

// --- SLIDE 6: CACHE PERFORMANCE ---
function createCacheSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Cache Performance");

  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Type")
    .addColumn(Charts.ColumnType.NUMBER, "Percentage")
    .addRow(["Hit Rate", 65])
    .addRow(["Miss Rate", 35])
    .build();

  var chart = Charts.newPieChart()
    .setDataTable(data)
    .setOption('title', 'Cache Hit/Miss Rate')
    .setOption('colors', [theme.success, theme.error])
    .build();

  slide.insertSheetsChart(chart, 100, 100, 500, 300);
}

// --- SLIDE 7: ERROR DISTRIBUTION ---
function createErrorSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Error Distribution");

  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Type")
    .addColumn(Charts.ColumnType.NUMBER, "Percentage")
    .addRow(["TypeScript", 40])
    .addRow(["Memory", 25])
    .addRow(["Cache", 15])
    .addRow(["Build", 12])
    .addRow(["Other", 8])
    .build();

  var chart = Charts.newPieChart()
    .setDataTable(data)
    .setOption('title', 'Error Types')
    .setOption('colors', [theme.primary, theme.error, theme.warning, theme.accent, theme.info])
    .build();

  slide.insertSheetsChart(chart, 100, 100, 500, 300);
}

// --- SLIDE 8: OPTIMIZATION TARGETS ---
function createOptimizationSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_ONLY);
  slide.getShapes()[0].getText().setText("Optimization Strategy: The Gap");

  // Data from METRICS-SUMMARY.md (Optimization Targets)
  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Metric")
    .addColumn(Charts.ColumnType.NUMBER, "Current")
    .addColumn(Charts.ColumnType.NUMBER, "Target")
    .addRow(["Build Time (min)", 13, 5])
    .addRow(["Memory (GB)", 2.8, 2.0])
    .addRow(["Cache Rate (%)", 65, 80])
    .addRow(["Error Rate (%)", 2, 1])
    .build();

  var chart = Charts.newColumnChart()
    .setDataTable(data)
    .setOption('title', 'Current vs Target Performance')
    .setOption('colors', ['#FF3D00', '#00C853']) // Red for Current, Green for Target
    .build();

  slide.insertSheetsChart(chart, 100, 100, 500, 300);
}

// --- SLIDE 9: PERFORMANCE TIMELINE ---
function createPerformanceSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Build Performance Timeline");

  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Phase")
    .addColumn(Charts.ColumnType.NUMBER, "Duration (s)")
    .addRow(["Pre-build", 60])
    .addRow(["TypeScript", 180])
    .addRow(["Next.js", 300])
    .addRow(["Assets", 240])
    .build();

  var chart = Charts.newBarChart()
    .setDataTable(data)
    .setOption('title', 'Phase Duration')
    .setOption('colors', [theme.primary])
    .setOption('hAxis', {title: 'Seconds'})
    .build();

  slide.insertSheetsChart(chart, 100, 100, 500, 300);
}

// --- SLIDE 10: RESOURCE TIMELINE ---
function createTimelineSlide(deck, theme) {
  var slide = deck.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
  slide.getShapes()[0].getText().setText("Resource Usage Timeline");

  var data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Resource")
    .addColumn(Charts.ColumnType.NUMBER, "Current")
    .addColumn(Charts.ColumnType.NUMBER, "Target")
    .addColumn(Charts.ColumnType.NUMBER, "Max")
    .addRow(["CPU (%)", 75, 60, 90])
    .addRow(["Memory (GB)", 2.8, 2.0, 3.0])
    .addRow(["Disk (%)", 45, 40, 50])
    .build();

  var chart = Charts.newColumnChart()
    .setDataTable(data)
    .setOption('title', 'Resource Usage')
    .setOption('colors', [theme.error, theme.success, theme.warning])
    .build();

  slide.insertSheetsChart(chart, 100, 100, 500, 300);
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
  text.getInputStyle().setForegroundColor(theme.white);

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
function addInteractiveElements(slide, theme) {
  // Add help button
  var helpButton = slide.insertShape(SlidesApp.ShapeType.ROUND_RECTANGLE, slide.getPageWidth() - 40, 10, 30, 30);
  helpButton.getFill().setSolidFill(theme.info);
  helpButton.getText().setText('?');
  helpButton.getText().getInputStyle().setForegroundColor(theme.white).setBold(true);
  helpButton.getBorder().setTransparent();

  // Add timestamp
  var timestamp = slide.insertTextBox(`Last Updated: ${new Date().toLocaleString()}`)
    .setLeft(10)
    .setTop(slide.getPageHeight() - 20);
  timestamp.getText().getInputStyle().setFontSize(8).setForegroundColor(theme.text);
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