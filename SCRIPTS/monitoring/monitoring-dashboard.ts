import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logger } from '../utils/logger';
import { retry } from '../utils/retry';

interface MetricDefinition {
  name: string;
  category: string;
  type: 'counter' | 'gauge' | 'histogram';
  unit?: string;
  description: string;
  warning?: number;
  critical?: number;
  aggregation?: 'sum' | 'avg' | 'min' | 'max';
}

interface MetricValue {
  timestamp: string;
  value: number;
  labels?: Record<string, string>;
}

interface DashboardWidget {
  id: string;
  type: 'line' | 'bar' | 'gauge' | 'table' | 'status';
  title: string;
  metrics: string[];
  timeRange: string;
  refreshInterval: number;
  warning?: number;
  critical?: number;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface DashboardConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  widgets: DashboardWidget[];
  refreshInterval: number;
  defaultTimeRange: string;
}

interface WidgetData {
  name: string;
  values: MetricValue[];
}

type WidgetWithData = DashboardWidget & { data: WidgetData[] };

export class MonitoringDashboard {
  private static instance: MonitoringDashboard;
  private readonly configPath: string;
  private readonly metricsPath: string;
  private readonly dashboardPath: string;
  private metrics: Map<string, MetricDefinition>;
  private values: Map<string, MetricValue[]>;

  private constructor() {
    const rootPath = process.cwd();
    this.configPath = join(rootPath, 'config', 'monitoring');
    this.metricsPath = join(rootPath, 'logs', 'metrics');
    this.dashboardPath = join(rootPath, 'docs', 'dashboards');
    this.metrics = new Map();
    this.values = new Map();
    this.initializeMonitoring();
  }

  public static getInstance(): MonitoringDashboard {
    if (!MonitoringDashboard.instance) {
      MonitoringDashboard.instance = new MonitoringDashboard();
    }
    return MonitoringDashboard.instance;
  }

  private initializeMonitoring(): void {
    // Load metric definitions
    const definitionsPath = join(this.configPath, 'metrics.json');
    try {
      const definitions = JSON.parse(readFileSync(definitionsPath, 'utf8'));
      for (const def of definitions) {
        this.metrics.set(def.name, def);
      }
    } catch (error) {
      logger.error('Failed to load metric definitions', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }

    // Create dashboard directories
    try {
      writeFileSync(join(this.dashboardPath, '.gitkeep'), '');
    } catch {
      // Directory already exists
    }
  }

  public async recordMetric(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): Promise<void> {
    const metric = this.metrics.get(name);
    if (!metric) {
      throw new Error(`Unknown metric: ${name}`);
    }

    const metricValue: MetricValue = {
      timestamp: new Date().toISOString(),
      value,
      labels
    };

    // Store in memory
    if (!this.values.has(name)) {
      this.values.set(name, []);
    }
    this.values.get(name)!.push(metricValue);

    // Write to disk
    await this.persistMetric(name, metricValue);

    // Check thresholds
    await this.checkThresholds(metric, value);
  }

  private async persistMetric(
    name: string,
    value: MetricValue
  ): Promise<void> {
    const metricFile = join(this.metricsPath, `${name}.json`);
    await retry.retry(async () => {
      writeFileSync(
        metricFile,
        JSON.stringify(value) + '\n',
        { flag: 'a' }
      );
    });
  }

  private async checkThresholds(
    metric: MetricDefinition,
    value: number
  ): Promise<void> {
    if (metric.critical !== undefined && value >= metric.critical) {
      logger.error(`Metric ${metric.name} exceeded critical threshold`, {
        metadata: {
          metric: metric.name,
          value,
          threshold: metric.critical
        }
      });
    } else if (metric.warning !== undefined && value >= metric.warning) {
      logger.warn(`Metric ${metric.name} exceeded warning threshold`, {
        metadata: {
          metric: metric.name,
          value,
          threshold: metric.warning
        }
      });
    }
  }

  public async generateDashboard(config: DashboardConfig): Promise<void> {
    logger.info('Generating dashboard', {
      metadata: { dashboard: config.id }
    });

    const dashboard = {
      timestamp: new Date().toISOString(),
      config,
      widgets: await Promise.all(
        config.widgets.map(widget => this.generateWidget(widget))
      )
    };

    const htmlContent = this.generateHtml(dashboard);
    const cssContent = this.generateCss();
    const jsContent = this.generateJs(dashboard);

    // Write dashboard files
    const basePath = join(this.dashboardPath, config.id);
    writeFileSync(`${basePath}.html`, htmlContent);
    writeFileSync(`${basePath}.css`, cssContent);
    writeFileSync(`${basePath}.js`, jsContent);

    logger.info('Dashboard generated successfully', {
      metadata: { dashboard: config.id }
    });
  }

  private async generateWidget(
    widget: DashboardWidget
  ): Promise<WidgetWithData> {
    const data = await Promise.all(
      widget.metrics.map(async metric => ({
        name: metric,
        values: await this.getMetricValues(metric, widget.timeRange)
      }))
    );

    return {
      ...widget,
      data
    };
  }

  private async getMetricValues(
    metric: string,
    timeRange: string
  ): Promise<MetricValue[]> {
    const values = this.values.get(metric) || [];
    const cutoff = this.calculateCutoff(timeRange);
    return values.filter(v => new Date(v.timestamp) >= cutoff);
  }

  private calculateCutoff(timeRange: string): Date {
    const now = new Date();
    const match = timeRange.match(/^(\d+)([mhd])$/);
    if (!match) {
      throw new Error(`Invalid time range: ${timeRange}`);
    }

    const [, amount, unit] = match;
    switch (unit) {
      case 'm':
        now.setMinutes(now.getMinutes() - parseInt(amount));
        break;
      case 'h':
        now.setHours(now.getHours() - parseInt(amount));
        break;
      case 'd':
        now.setDate(now.getDate() - parseInt(amount));
        break;
    }

    return now;
  }

  private generateHtml(dashboard: { config: DashboardConfig; widgets: WidgetWithData[] }): string {
    return `<!DOCTYPE html>
<html>
<head>
  <title>${dashboard.config.name}</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="${dashboard.config.id}.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/moment"></script>
</head>
<body>
  <div class="dashboard">
    <header>
      <h1>${dashboard.config.name}</h1>
      <p>${dashboard.config.description}</p>
      <div class="controls">
        <select id="timeRange">
          <option value="15m">Last 15 minutes</option>
          <option value="1h">Last hour</option>
          <option value="6h">Last 6 hours</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
        </select>
        <button id="refresh">Refresh</button>
      </div>
    </header>
    <main>
      ${dashboard.widgets.map(widget => this.generateWidgetHtml(widget)).join('\n')}
    </main>
  </div>
  <script src="${dashboard.config.id}.js"></script>
</body>
</html>`;
  }

  private generateWidgetHtml(widget: WidgetWithData): string {
    return `
<div class="widget" id="widget-${widget.id}"
     style="grid-area: ${widget.layout.y + 1} / ${widget.layout.x + 1} / span ${widget.layout.h} / span ${widget.layout.w}">
  <div class="widget-header">
    <h3>${widget.title}</h3>
    <span class="widget-refresh"></span>
  </div>
  <div class="widget-content">
    ${widget.type === 'table' ? this.generateTableHtml(widget) : '<canvas></canvas>'}
  </div>
</div>`;
  }

  private generateTableHtml(widget: WidgetWithData): string {
    return `
<table>
  <thead>
    <tr>
      <th>Metric</th>
      <th>Value</th>
      <th>Time</th>
    </tr>
  </thead>
  <tbody>
    ${widget.data.map(metric => metric.values[metric.values.length - 1]).map(value => 
      `<tr><td>${value.name}</td><td>${value.value}</td><td>${new Date(value.timestamp).toLocaleString()}</td></tr>`
    ).join('\n')}
  </tbody>
</table>`;
  }

  private generateCss(): string {
    return `
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1rem;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.controls {
  display: flex;
  gap: 1rem;
}

main {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  gap: 1rem;
  overflow: auto;
}

.widget {
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.widget-content {
  flex: 1;
  position: relative;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.5rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.status-ok { color: #00c853; }
.status-warning { color: #ffd600; }
.status-critical { color: #d50000; }

select, button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

button:hover {
  background: #f5f5f5;
}`;
  }

  private generateJs(dashboard: { config: DashboardConfig; widgets: WidgetWithData[] }): string {
    return `
const dashboard = ${JSON.stringify(dashboard)};
const widgets = new Map();

function initializeWidgets() {
  for (const widget of dashboard.widgets) {
    const element = document.getElementById(\`widget-\${widget.id}\`);
    const canvas = element.querySelector('canvas');
    
    switch (widget.type) {
      case 'line':
        widgets.set(widget.id, createLineChart(canvas, widget));
        break;
      case 'bar':
        widgets.set(widget.id, createBarChart(canvas, widget));
        break;
      case 'gauge':
        widgets.set(widget.id, createGaugeChart(canvas, widget));
        break;
      case 'table':
        updateTable(element, widget);
        break;
      case 'status':
        updateStatus(element, widget);
        break;
    }
  }
}

function createLineChart(canvas, widget) {
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: widget.data[0].values.map(v => moment(v.timestamp).format('HH:mm:ss')),
      datasets: widget.data.map(metric => ({
        label: metric.name,
        data: metric.values.map(v => v.value),
        borderColor: getColor(metric.name),
        fill: false
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { type: 'time', time: { unit: 'minute' } },
        y: { beginAtZero: true }
      }
    }
  });
}

function createBarChart(canvas, widget) {
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: widget.data[0].values.map(v => moment(v.timestamp).format('HH:mm:ss')),
      datasets: widget.data.map(metric => ({
        label: metric.name,
        data: metric.values.map(v => v.value),
        backgroundColor: getColor(metric.name)
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function createGaugeChart(canvas, widget) {
  const ctx = canvas.getContext('2d');
  const value = widget.data[0].values[widget.data[0].values.length - 1].value;
  const max = widget.critical || 100;
  
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [value, max - value],
        backgroundColor: [getStatusColor(value, widget), '#eee']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      circumference: 180,
      rotation: -90,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      }
    }
  });
}

function updateTable(element, widget) {
  const tbody = element.querySelector('tbody');
  tbody.innerHTML = widget.data
    .map(metric => metric.values[metric.values.length - 1])
    .map(value => 
      `<tr><td>${value.name}</td><td>${value.value}</td><td>${new Date(value.timestamp).toLocaleString()}</td></tr>`
    ).join('\\n');
}

function updateStatus(element, widget) {
  const value = widget.data[0].values[widget.data[0].values.length - 1].value;
  const status = getStatus(value, widget);
  element.querySelector('.widget-content').innerHTML = 
    `<div class="status-${status.toLowerCase()}"><h2>${value}</h2><p>${status}</p></div>`;
}

function getStatus(value, widget) {
  if (widget.critical && value >= widget.critical) return 'CRITICAL';
  if (widget.warning && value >= widget.warning) return 'WARNING';
  return 'OK';
}

function getStatusColor(value, widget) {
  if (widget.critical && value >= widget.critical) return '#d50000';
  if (widget.warning && value >= widget.warning) return '#ffd600';
  return '#00c853';
}

function getColor(name) {
  const colors = [
    '#2196f3', '#f44336', '#4caf50', '#ff9800', '#9c27b0',
    '#00bcd4', '#ff5722', '#8bc34a', '#3f51b5', '#e91e63'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function updateWidgets() {
  for (const [id, chart] of widgets) {
    const widget = dashboard.widgets.find(w => w.id === id);
    if (!widget) continue;

    switch (widget.type) {
      case 'line':
      case 'bar':
        updateChart(chart, widget);
        break;
      case 'gauge':
        updateGauge(chart, widget);
        break;
      case 'table':
        updateTable(document.getElementById(\`widget-\${id}\`), widget);
        break;
      case 'status':
        updateStatus(document.getElementById(\`widget-\${id}\`), widget);
        break;
    }
  }
}

async function refreshData() {
  const timeRange = document.getElementById('timeRange').value;
  const response = await fetch(\`/api/metrics?timeRange=\${timeRange}\`);
  const data = await response.json();
  
  for (const widget of dashboard.widgets) {
    widget.data = data.filter(d => widget.metrics.includes(d.name));
  }
  
  updateWidgets();
}

document.getElementById('refresh').addEventListener('click', refreshData);
document.getElementById('timeRange').addEventListener('change', refreshData);

// Auto-refresh
setInterval(refreshData, dashboard.config.refreshInterval * 1000);

// Initialize
initializeWidgets();`;
  }
}

// Export singleton instance
export const monitoring = MonitoringDashboard.getInstance();
