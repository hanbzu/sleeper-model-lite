import _ from 'lodash';
import styles from './ValuesEditor.module.css';

export default function ValuesEditor({ data, onChange }) {
  const entries = Object.entries(data);

  const handleKeyChange = (oldKey, newKey) => {
    if (oldKey === newKey) return;

    const newData = { ...data };
    const value = newData[oldKey];
    delete newData[oldKey];
    newData[newKey] = value;
    onChange(newData);
  };

  const handleValueChange = (key, newValue) => {
    onChange({
      ...data,
      [key]: newValue,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.addButtonContainer}>
        <button
          onClick={() => {
            let newKey = 'new_variable';
            let counter = 1;

            while (data[newKey]) {
              newKey = `new_variable_${counter}`;
              counter++;
            }

            onChange({
              ...data,
              [newKey]: '',
            });
          }}
          className={styles.addButton}
        >
          Add Variable
        </button>
      </div>

      <div className={styles.entriesList}>
        {entries.map(([key, value]) => (
          <div key={key} className={styles.entryRow}>
            <input type="text" value={key} onChange={(e) => handleKeyChange(key, e.target.value)} className={styles.keyInput} />
            <span className={styles.equals}>=</span>
            <input type="text" value={value} onChange={(e) => handleValueChange(key, e.target.value)} className={styles.valueInput} />
            <button onClick={() => onChange(_.omit(data, key))} className={styles.removeButton}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {entries.length === 0 && <div className={styles.emptyState}>No variables defined. Click "Add Variable" to create one.</div>}
    </div>
  );
}
