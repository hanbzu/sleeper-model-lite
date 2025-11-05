import React from 'react';
import styles from './FlowsEditor.module.css';
import TrashIcon from './assets/icons/TrashIcon';
import _ from 'lodash';

export default function FlowsEditor({ data = {}, onChange }) {
  // Get all unique nodes mentioned in the flows
  const getAllNodes = () => {
    return _.uniq(
      Object.values(data)
        .flatMap((flow) => [flow.from, flow.to])
        .filter(Boolean)
        .sort()
    );
  };

  const handleAddFlow = () => {
    const id = prompt('Enter flow ID:');
    if (!id || !id.trim()) return;
    if (data && data[id]) {
      alert('Flow ID already exists!');
      return;
    }
    onChange({ ...data, [id]: {} });
  };

  const handleDeleteFlow = (id) => {
    const newData = { ...data };
    delete newData[id];
    onChange(newData);
  };

  const handleUpdateFlow = (id, field, value) => {
    onChange({
      ...data,
      [id]: {
        ...data[id],
        [field]: value === '' ? undefined : value,
      },
    });
  };

  const handleAddNewNode = (flowId, field) => {
    const newNode = prompt('Enter new node name:');
    if (!newNode || !newNode.trim()) return;
    handleUpdateFlow(flowId, field, newNode);
  };

  const nodes = getAllNodes();
  const flows = Object.entries(data || {});

  return (
    <div className="container">
      <div className="header">
        <h2>Flows Editor</h2>
        <button onClick={handleAddFlow} className="btn">
          Add Flow
        </button>
      </div>

      <div className="list">
        {flows.length === 0 ? (
          <div className="empty-state">No flows yet. Click "Add Flow" to create one.</div>
        ) : (
          flows.map(([id, flow]) => (
            <div key={id} className={styles.flowItem}>
              <div className={styles.flowId}>{id}</div>

              <div className={styles.flowField}>
                <label>From:</label>
                <select value={flow.from || ''} onChange={(e) => handleUpdateFlow(id, 'from', e.target.value)} className={styles.select}>
                  <option value="">-- None --</option>
                  {nodes.map((node) => (
                    <option key={node} value={node}>
                      {node}
                    </option>
                  ))}
                </select>
                <button onClick={() => handleAddNewNode(id, 'from')} className={styles.addNodeButton} title="Add new node">
                  +
                </button>
              </div>

              <div className={styles.flowField}>
                <label>To:</label>
                <select value={flow.to || ''} onChange={(e) => handleUpdateFlow(id, 'to', e.target.value)} className={styles.select}>
                  <option value="">-- None --</option>
                  {nodes.map((node) => (
                    <option key={node} value={node}>
                      {node}
                    </option>
                  ))}
                </select>
                <button onClick={() => handleAddNewNode(id, 'to')} className={styles.addNodeButton} title="Add new node">
                  +
                </button>
              </div>

              <button onClick={() => handleDeleteFlow(id)} className="btn-icon" title="Delete flow">
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const EXAMPLE_FLOWS = {
  tickets: { to: 'revenue' },
  subsidy: { to: 'revenue' },
  sbb_profit: { from: 'revenue' },
  cost: { from: 'revenue', to: 'cost' },
  rdc_profit: { from: 'cost' },
  per_km_cost: { from: 'cost' },
  fixed_cost: { from: 'cost' },
};
