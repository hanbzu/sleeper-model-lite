import { sankey } from 'd3-sankey';
import { useState, useEffect, useRef } from 'react';
import yaml from 'js-yaml';
import { result, flows } from './logic';
import * as Plot from '@observablehq/plot';
import _ from 'lodash';

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

function ObservablePlotComponent() {
  const containerRef = useRef();
  const height = 400;
  const width = 800;

  useEffect(() => {
    if (containerRef.current) {
      const sankeyData = adaptData({ values: result, flows });
      console.log('sankeyData', sankeyData);

      sankey()
        .nodeWidth(2)
        .nodePadding(height / sankeyData.nodes.length)
        .size([width, height])(sankeyData);

      const plot = Plot.plot({
        marks: [
          sankeyData.links
            .map((l) => [
              { x: l.source.x1, y0: l.y0 + l.width / 2, y1: l.y0 - l.width / 2 },
              { x: l.target.x0, y0: l.y1 + l.width / 2, y1: l.y1 - l.width / 2 },
            ])
            .map((link) =>
              Plot.areaY(link, {
                x: 'x',
                y1: 'y0',
                y2: 'y1',
                curve: 'bump-x',
                fill: '#000',
                fillOpacity: 0.1,
                order: 'value',
              })
            ),
          Plot.rect(sankeyData.nodes, { x1: 'x0', x2: 'x1', y1: 'y0', y2: 'y1', fill: 'black' }),
          Plot.text(sankeyData.nodes, {
            x: 'x1',
            dx: 5,
            y: (d) => (d.y1 + d.y0) / 2,
            text: 'name',
            textAnchor: 'start',
          }),
        ],
        x: { axis: null },
        y: { axis: null },
        width: width,
        height: height,
        marginTop: 20,
        marginRight: 40,
      });
      containerRef.current.append(plot);
      return () => plot.remove();
    }
  });

  return <div ref={containerRef} />;
}

function App() {
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
        <ObservablePlotComponent />
      </main>
    </div>
  );
}

export default App;
