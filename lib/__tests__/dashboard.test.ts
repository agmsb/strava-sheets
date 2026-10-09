import { describe, it, expect, beforeEach } from 'vitest';
// @ts-ignore
import codeApp from '../../code.js';

const { onOpen, setupDashboardSheet } = codeApp;

describe('Dashboard Sheet Apps Script Logic', () => {
  let sheetsMap: Record<string, any>;
  let insertedCharts: any[];
  let alertLogs: string[];
  let createdMenus: any[];

  beforeEach(() => {
    sheetsMap = {};
    insertedCharts = [];
    alertLogs = [];
    createdMenus = [];

    const mockSheet = (name: string) => {
      const rangesMap: Record<string, any> = {};
      return {
        getName: () => name,
        getRange: (rowOrA1: any, col?: number, numRows?: number, numCols?: number) => {
          const key = typeof rowOrA1 === 'string' ? rowOrA1 : `${rowOrA1}:${col}:${numRows}:${numCols}`;
          if (!rangesMap[key]) {
            rangesMap[key] = {
              values: [] as any[],
              formulas: [] as any[],
              fontWeight: 'normal',
              numberFormat: '',
              setValues(v: any[]) { this.values = v; return this; },
              setFormulas(f: any[]) { this.formulas = f; return this; },
              setFontWeight(fw: string) { this.fontWeight = fw; return this; },
              setNumberFormat(nf: string) { this.numberFormat = nf; return this; },
            };
          }
          return rangesMap[key];
        },
        _getRangesMap: () => rangesMap,
        newChart: () => {
          const chartData = {
            chartType: null as any,
            ranges: [] as any[],
            options: {} as Record<string, any>,
            position: null as any,
          };
          const builder = {
            setChartType(type: any) { chartData.chartType = type; return builder; },
            addRange(range: any) { chartData.ranges.push(range); return builder; },
            setOption(key: string, val: any) { chartData.options[key] = val; return builder; },
            setPosition(r: number, c: number, ox: number, oy: number) { chartData.position = { r, c, ox, oy }; return builder; },
            build() { return chartData; },
          };
          return builder;
        },
        insertChart: (chart: any) => {
          insertedCharts.push(chart);
        },
      };
    };

    const mockSpreadsheet = {
      getSheetByName: (name: string) => sheetsMap[name] || null,
      insertSheet: (name: string) => {
        const s = mockSheet(name);
        sheetsMap[name] = s;
        return s;
      },
    };

    const mockMenu = (title: string) => {
      const items: any[] = [];
      const subMenus: any[] = [];
      const menuObj = {
        title,
        items,
        subMenus,
        addItem(name: string, fn: string) { items.push({ name, fn }); return menuObj; },
        addSubMenu(sub: any) { subMenus.push(sub); return menuObj; },
        addSeparator() { return menuObj; },
        addToUi() { createdMenus.push(menuObj); return menuObj; },
      };
      return menuObj;
    };

    const mockUi = {
      createMenu: (title: string) => mockMenu(title),
      alert: (msg: string) => { alertLogs.push(msg); },
    };

    (globalThis as any).SpreadsheetApp = {
      getActiveSpreadsheet: () => mockSpreadsheet,
      getUi: () => mockUi,
    };

    (globalThis as any).Charts = {
      ChartType: {
        COLUMN: 'COLUMN',
        LINE: 'LINE',
      },
    };
  });

  it('registers "Create dashboard sheet" command in application menu', () => {
    onOpen();
    expect(createdMenus).toHaveLength(1);
    const mainSubMenus = createdMenus[0].subMenus;
    const setupMenu = mainSubMenus.find((m: any) => m.title === 'Setup');
    expect(setupMenu).toBeDefined();
    const dashboardItem = setupMenu.items.find((i: any) => i.name === 'Create dashboard sheet');
    expect(dashboardItem).toBeDefined();
    expect(dashboardItem.fn).toBe('setupDashboardSheet');
  });

  it('creates the Dashboard sheet with formulas and embedded charts if it does not exist', () => {
    setupDashboardSheet();

    expect(sheetsMap['Dashboard']).toBeDefined();
    const dashboardSheet = sheetsMap['Dashboard'];

    // KPI headers
    const headerRange = dashboardSheet.getRange(1, 1, 1, 4);
    expect(headerRange.values).toEqual([
      ['Total Distance (mi)', 'Total Elevation (ft)', 'Total Rides', 'Average Speed (mph)']
    ]);
    expect(headerRange.fontWeight).toBe('bold');

    // KPI formulas
    const formulaRange = dashboardSheet.getRange(2, 1, 1, 4);
    expect(formulaRange.formulas).toEqual([[
      '=SUM(raw_data!D2:D)',
      '=SUM(raw_data!E2:E)',
      '=COUNTA(raw_data!A2:A)',
      '=IFERROR(AVERAGE(raw_data!F2:F), 0)'
    ]]);

    // KPI formatting
    expect(dashboardSheet.getRange(2, 1).numberFormat).toBe('0.0');
    expect(dashboardSheet.getRange(2, 2).numberFormat).toBe('#,##0');
    expect(dashboardSheet.getRange(2, 3).numberFormat).toBe('#,##0');
    expect(dashboardSheet.getRange(2, 4).numberFormat).toBe('0.0');

    // Check inserted charts
    expect(insertedCharts).toHaveLength(2);

    const distanceChart = insertedCharts[0];
    expect(distanceChart.chartType).toBe('COLUMN');
    expect(distanceChart.options.title).toBe('Monthly Distance');
    expect(distanceChart.options.hAxis).toEqual({ title: 'Date' });
    expect(distanceChart.options.vAxis).toEqual({ title: 'Distance (mi)' });
    expect(distanceChart.position).toEqual({ r: 4, c: 1, ox: 0, oy: 0 });

    const elevationChart = insertedCharts[1];
    expect(elevationChart.chartType).toBe('LINE');
    expect(elevationChart.options.title).toBe('Elevation Trend');
    expect(elevationChart.options.hAxis).toEqual({ title: 'Date' });
    expect(elevationChart.options.vAxis).toEqual({ title: 'Elevation (ft)' });
    expect(elevationChart.position).toEqual({ r: 4, c: 8, ox: 0, oy: 0 });

    expect(alertLogs).toContain('Successfully created the "Dashboard" sheet with summary KPIs and charts.');
  });

  it('alerts user and avoids duplicate setup when Dashboard sheet already exists', () => {
    setupDashboardSheet(); // First run creates
    alertLogs.length = 0;
    insertedCharts.length = 0;

    setupDashboardSheet(); // Second run alerts

    expect(alertLogs).toContain('The sheet "Dashboard" already exists.');
    expect(insertedCharts).toHaveLength(0);
  });
});
