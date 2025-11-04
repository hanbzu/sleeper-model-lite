import { sankey } from 'd3-sankey';
import { useState, useEffect, useRef } from 'react';
import yaml from 'js-yaml';
import { getAdditionalFormulasBasedOnFlows, solve } from './logic';
import * as Plot from '@observablehq/plot';
import _ from 'lodash';
import SankeyPlot from './SankeyPlot.jsx';

function adaptData({ values, flows }) {
  console.log('···values', values);
  console.log('···flows', flows);
  const nodes = _.uniq(
    Object.entries(flows)
      .reduce((acc, [key, { from, to }]) => [...acc, from ?? `_${key}-from`, to ?? `_${key}-to`], [])
      .filter((d) => d)
  ).map((name, i) => ({ node: i, name }));
  const links = Object.entries(flows).map(([key, { from, to }]) => ({
    source: nodes.findIndex((d) => d.name === (from ?? `_${key}-from`)),
    target: nodes.findIndex((d) => d.name === (to ?? `_${key}-to`)),
    value: values[key],
  }));
  return { nodes, links };
}

function App() {
  const values = {
    seats: 350,
    occupancy: 0.7,
    avg_ticket_price: 137.38,
    tickets: (d) => d.avg_ticket_price * d.seats * d.occupancy,
    subsidy: 32200,
    rdc_profit: (d) => (d.per_km_cost + d.fixed_cost) * 0.1,
    distance: 1380,
    per_km_cost: (d) => d.distance * 28,
    coaches: 10,
    fixed_cost: (d) => d.coaches * 1000,
  };

  const flows = {
    tickets: { to: 'revenue' },
    subsidy: { to: 'revenue' },
    sbb_profit: { from: 'revenue' },
    cost: { from: 'revenue', to: 'cost' },
    rdc_profit: { from: 'cost' },
    per_km_cost: { from: 'cost' },
    fixed_cost: { from: 'cost' },
  };

  const sankeyData = adaptData({
    values: solve({ ...values, ...getAdditionalFormulasBasedOnFlows({ flows, values }) }),
    flows,
  });
  console.log('sankeyData', sankeyData);

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#333' }}>Sleeper model lite</h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>Sankey diagram solver and flow analyzer</p>
      </header>

      <main>
        <SankeyPlot height={400} width={800} sankeyData={sankeyData} />
      </main>
    </div>
  );
}

export default App;
