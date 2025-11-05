import React from 'react';
import _ from 'lodash';
import styles from './ValuesEditor.module.css';
import TrashIcon from './assets/icons/TrashIcon';

export default function ValuesEditor({ data, dataSolved = {}, onChange }) {
  const [newKey, setNewKey] = React.useState();

  return (
    <div className={styles.container}>
      <div className={styles.entriesList}>
        {Object.entries(data).map(([key, value], i) => (
          <div key={i} className={styles.entryRow}>
            <span>{key}</span>
            <span className={styles.equals}>=</span>
            <ValueEditor value={value} solvedValue={dataSolved[key]} onChange={(newValue) => onChange({ ...data, [key]: newValue })} />
            <button onClick={() => onChange(_.omit(data, key))} className={styles.removeButton}>
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {newKey && (
        <div key="new" className={styles.entryRow}>
          <span>{newKey}</span>
          <span className={styles.equals}>=</span>
          <ValueEditor
            initialValue={true}
            onChange={(newValue) => {
              onChange({ ...data, [newKey]: newValue });
              setNewKey(null);
            }}
          />
        </div>
      )}
      {!newKey && (
        <div className={styles.addButtonContainer}>
          <button onClick={() => setNewKey(prompt('variable name? no spaces please'))} className={styles.addButton}>
            Add Variable
          </button>
        </div>
      )}
    </div>
  );
}

function ValueEditor({ value, solvedValue, initialValue = false, onChange }) {
  const [pendingEdits, setPendingEdits] = React.useState(initialValue ? '' : null);
  function onEdit() {
    setPendingEdits(value);
  }
  function onSave() {
    try {
      onChange(pendingEdits);
      setPendingEdits(null);
    } catch (err) {
      alert(`Error in expression:\n${err.message}`);
    }
  }

  return pendingEdits === null ? (
    <span onClick={onEdit} style={{ cursor: 'pointer' }}>
      {solvedValue ?? value}
    </span>
  ) : (
    <>
      <input
        type="text"
        maxLength={100}
        value={pendingEdits}
        onChange={(e) => setPendingEdits(e.target.value)}
        className={styles.valueInput}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
          else if (e.key === 'Escape') setPendingEdits(null);
        }}
        autoFocus
        spellCheck="false"
      />

      <button onClick={onSave}>save</button>
      <button onClick={() => setPendingEdits(null)}>cancel</button>
    </>
  );
}
