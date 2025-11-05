import React from 'react';
import { getAdditionalFormulasBasedOnFlows, solve, fromString } from './logic';
import _ from 'lodash';
import SankeyPlot from './SankeyPlot.jsx';
import ValuesEditor from './ValuesEditor.jsx';
import { useUrlState } from './useUrlState';

function App() {
  const [state, setState] = useUrlState({ values: {}, flows: {} });

  console.log('···state', state);

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
        {Object.keys(state.flows).length > 0 && <SankeyPlot height={400} width={800} sankeyData={sankeyData} />}
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

// http://localhost:5173/dynasankey/#JTdCJTIydmFsdWVzJTIyJTNBJTdCJTIyc2VhdHMlMjIlM0ElMjIzNTAlMjIlMkMlMjJvY2N1cGFuY3klMjIlM0ElMjIwLjclMjIlMkMlMjJhdmdfdGlja2V0X3ByaWNlJTIyJTNBJTIyMTM3LjM4JTIyJTJDJTIydGlja2V0cyUyMiUzQSUyMmF2Z190aWNrZXRfcHJpY2UlMjAqJTIwc2VhdHMlMjAqJTIwb2NjdXBhbmN5JTIyJTJDJTIyc3Vic2lkeSUyMiUzQSUyMjMyMjAwJTIyJTJDJTIycmRjX3Byb2ZpdCUyMiUzQSUyMihwZXJfa21fY29zdCUyMCUyQiUyMGZpeGVkX2Nvc3QpJTIwKiUyMDAuMSUyMiUyQyUyMmRpc3RhbmNlJTIyJTNBJTIyMTM4MCUyMiUyQyUyMnBlcl9rbV9jb3N0JTIyJTNBJTIyZGlzdGFuY2UlMjAqJTIwMjglMjIlMkMlMjJjb2FjaGVzJTIyJTNBJTIyMTAlMjIlMkMlMjJmaXhlZF9jb3N0JTIyJTNBJTIyY29hY2hlcyUyMColMjAxZTMlMjIlN0QlMkMlMjJmbG93cyUyMiUzQSU3QiUyMnRpY2tldHMlMjIlM0ElN0IlMjJ0byUyMiUzQSUyMnJldmVudWUlMjIlN0QlMkMlMjJzdWJzaWR5JTIyJTNBJTdCJTIydG8lMjIlM0ElMjJyZXZlbnVlJTIyJTdEJTJDJTIyc2JiX3Byb2ZpdCUyMiUzQSU3QiUyMmZyb20lMjIlM0ElMjJyZXZlbnVlJTIyJTdEJTJDJTIyY29zdCUyMiUzQSU3QiUyMmZyb20lMjIlM0ElMjJyZXZlbnVlJTIyJTJDJTIydG8lMjIlM0ElMjJjb3N0JTIyJTdEJTJDJTIycmRjX3Byb2ZpdCUyMiUzQSU3QiUyMmZyb20lMjIlM0ElMjJjb3N0JTIyJTdEJTJDJTIycGVyX2ttX2Nvc3QlMjIlM0ElN0IlMjJmcm9tJTIyJTNBJTIyY29zdCUyMiU3RCUyQyUyMmZpeGVkX2Nvc3QlMjIlM0ElN0IlMjJmcm9tJTIyJTNBJTIyY29zdCUyMiU3RCU3RCU3RA==
