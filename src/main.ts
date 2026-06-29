/* Entry point — wires every chart/module to the page.
   Theme-dependent SVG charts (flows, bar, dumbbell) redraw on theme change;
   DOM/CSS-variable charts (table, grid, matrix, breakdown) render once. */
import { renderFlows, initFlowPanel } from './charts/flow';
import { renderBar } from './charts/bar';
import { initTable } from './charts/table';
import { renderGrid } from './charts/grid';
import { renderDumbbell, initDumbbell } from './charts/dumbbell';
import { renderPersonParty } from './charts/personParty';
import { renderBreakdown } from './charts/breakdown';
import { fillText } from './ui/text';
import { initTheme } from './ui/theme';
import { initNav } from './ui/nav';

function renderThemed(): void {
  renderFlows();
  renderBar();
  renderDumbbell();
}

function boot(): void {
  fillText();
  initFlowPanel();
  initTable();
  renderGrid();
  initDumbbell();
  renderPersonParty();
  renderBreakdown();
  // initTheme triggers the first themed render (flows + bar + dumbbell)
  initTheme(renderThemed);
  initNav();
}

boot();
