import React from 'react';
import { getAdditionalFormulasBasedOnFlows, solve, fromString, toString } from './logic';
import _ from 'lodash';
import SankeyPlot from './SankeyPlot.jsx';
import ValuesEditor from './ValuesEditor.jsx';

function deserializeValues(hash) {
  try {
    return JSON.parse(decodeURIComponent(atob(hash)));
  } catch (e) {
    console.error('Failed to deserialize values from URL:', e);
    return null;
  }
}

function App() {
  // Initialize state from URL hash if available, otherwise use defaults
  const [state, setState] = React.useState(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const deserialized = deserializeValues(hash);
      if (deserialized) return deserialized;
    }
    return DEFAULT_STATE;
  });

  console.log('···state', state);

  // Sync state to URL hash when it changes
  React.useEffect(() => {
    const serialized = btoa(encodeURIComponent(JSON.stringify(state)));
    window.history.replaceState(null, '', `#${serialized}`);
  }, [state]);

  // Listen for manual URL hash changes (browser back/forward, manual edit)
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const deserialized = deserializeValues(hash);
        if (deserialized) setState(deserialized);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const valuesRunnable = _.mapValues(state.values, fromString); // Can throw TODO
  const dataSolved = solve({ ...valuesRunnable, ...getAdditionalFormulasBasedOnFlows(state.flows, Object.keys(valuesRunnable)) });
  const sankeyData = adaptData({
    values: dataSolved,
    flows: state.flows,
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
        <ValuesEditor data={state.values} dataSolved={dataSolved} onChange={(values) => setState((s) => ({ ...s, values }))} />
      </main>
    </div>
  );
}

export default App;

function adaptData({ values, flows }) {
  // console.log('···values', values);
  // console.log('···flows', flows);
  const nodes = _.uniq(
    Object.entries(flows)
      .reduce((acc, [key, { from, to }]) => [...acc, from ?? key, to ?? key], [])
      .filter((d) => d)
  ).map((name, i) => ({ node: i, name }));
  const links = Object.entries(flows).map(([key, { from, to }]) => ({
    source: nodes.findIndex((d) => d.name === (from ?? key)),
    target: nodes.findIndex((d) => d.name === (to ?? key)),
    value: values[key],
  }));
  return { nodes, links };
}

const DEFAULT_STATE = {
  values: {
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
  },
  flows: {
    tickets: { to: 'revenue' },
    subsidy: { to: 'revenue' },
    sbb_profit: { from: 'revenue' },
    cost: { from: 'revenue', to: 'cost' },
    rdc_profit: { from: 'cost' },
    per_km_cost: { from: 'cost' },
    fixed_cost: { from: 'cost' },
  },
};
