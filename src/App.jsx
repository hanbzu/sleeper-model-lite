import React from 'react';
import { getAdditionalFormulasBasedOnFlows, solve, fromString, toString } from './logic';
import _ from 'lodash';
import SankeyPlot from './SankeyPlot.jsx';
import ValuesEditor from './ValuesEditor.jsx';

// Utility functions for URL synchronization
function serializeValues(values) {
  const json = JSON.stringify(_.mapValues(values, toString));
  return btoa(encodeURIComponent(json));
}

function deserializeValues(hash) {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(hash)));
    return _.mapValues(parsed, fromString);
  } catch (e) {
    console.error('Failed to deserialize values from URL:', e);
    return null;
  }
}

function App() {
  // Initialize state from URL hash if available, otherwise use defaults
  const [values, setValues] = React.useState(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const deserialized = deserializeValues(hash);
      if (deserialized) return deserialized;
    }
    return DEFAULT_VALUES;
  });

  console.log('···values', values);

  // Sync values to URL hash when values change
  React.useEffect(() => {
    const serialized = serializeValues(values);
    window.history.replaceState(null, '', `#${serialized}`);
  }, [values]);

  // Listen for manual URL hash changes (browser back/forward, manual edit)
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const deserialized = deserializeValues(hash);
        if (deserialized) {
          setValues(deserialized);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const flows = {
    tickets: { to: 'revenue' },
    subsidy: { to: 'revenue' },
    sbb_profit: { from: 'revenue' },
    cost: { from: 'revenue', to: 'cost' },
    rdc_profit: { from: 'cost' },
    per_km_cost: { from: 'cost' },
    fixed_cost: { from: 'cost' },
  };

  const dataSolved = solve({ ...values, ...getAdditionalFormulasBasedOnFlows(flows, Object.keys(values)) });
  const sankeyData = adaptData({
    values: dataSolved,
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
        <ValuesEditor data={values} dataSolved={dataSolved} onChange={setValues} />
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

const DEFAULT_VALUES = {
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
