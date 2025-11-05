import _ from 'lodash';
import SankeyPlot from './SankeyPlot.jsx';
import ValuesEditor from './ValuesEditor.jsx';
import FlowsEditor from './FlowsEditor.jsx';
import { useUrlState } from './useUrlState';
import prepareData from './logic/prepareData.js';

function App() {
  const [state, setState] = useUrlState(EMPTY_STATE);
  const { sankeyData, dataSolved, error } = prepareData(state);

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
        <h1>
          <input
            type="text"
            maxLength={50}
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            style={{ border: 'none', padding: 0, width: '100%', font: 'inherit' }}
          />
        </h1>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          <input
            type="text"
            maxLength={150}
            value={state.description}
            onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
            style={{ border: 'none', padding: 0, width: '100%', font: 'inherit' }}
          />
        </p>
      </header>

      <main>
        {error ? <span style={{ color: 'red' }}>{error}</span> : <SankeyPlot height={400} width={800} sankeyData={sankeyData} />}
        <ValuesEditor data={state.values} dataSolved={dataSolved} onChange={(values) => setState((s) => ({ ...s, values }))} />
        <FlowsEditor data={state.flows} onChange={(flows) => setState((s) => ({ ...s, flows }))} />
        <button style={{ marginTop: 100 }} onClick={() => setState(EXAMPLE_STATE)}>
          Load example
        </button>
      </main>
    </div>
  );
}

export default App;

const EMPTY_STATE = {
  title: 'Click to change title',
  description: 'Click to change description',
  values: {},
  flows: {},
};

const EXAMPLE_STATE = {
  title: 'Simplified sleeper model',
  description: 'Lorem ipsum',
  values: {
    seats: 350,
    occupancy: 0.7,
    avg_ticket_price: 137.38,
    tickets: 'avg_ticket_price * seats * occupancy',
    subsidy: 32200,
    rdc_profit: '(per_km_cost + fixed_cost) * 0.1',
    distance: 1380,
    per_km_cost: 'distance * 28',
    coaches: 10,
    fixed_cost: 'coaches * 1000',
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
