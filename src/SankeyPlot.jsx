import React from 'react';
import * as Plot from '@observablehq/plot';
import { sankey } from 'd3-sankey';

export default function SankeyPlot({ height, width, sankeyData }) {
  const containerRef = React.useRef();

  React.useEffect(() => {
    if (containerRef.current) {
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
            .map((l) => Plot.areaY(l, { x: 'x', y1: 'y0', y2: 'y1', curve: 'bump-x', fill: '#000', fillOpacity: 0.1, order: 'value' })),
          Plot.rect(sankeyData.nodes, { x1: 'x0', x2: 'x1', y1: 'y0', y2: 'y1', fill: 'black' }),
          Plot.text(sankeyData.nodes, { x: 'x1', dx: 5, y: (d) => (d.y1 + d.y0) / 2, text: 'name', textAnchor: 'start' }),
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
