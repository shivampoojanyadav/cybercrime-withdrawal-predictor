import { useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

const elements = [
  { data: { id: 'victim', label: `Victim\nSIH-1029`, type: 'victim' } },
  { data: { id: 'mule1', label: `Mule Acc\nHDFC`, type: 'mule' } },
  { data: { id: 'mule2', label: `Mule Acc\nSBI`, type: 'mule' } },
  { data: { id: 'atm1', label: `ATM\nDelhi Sector 4`, type: 'atm' } },
  { data: { source: 'victim', target: 'mule1', label: '₹125,000' } },
  { data: { source: 'victim', target: 'mule2', label: '₹120,000' } },
  { data: { source: 'mule1', target: 'atm1', label: 'Withdrawal' } },
  { data: { source: 'mule2', target: 'atm1', label: 'Withdrawal' } },
];

const stylesheet = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'color': '#F8FAFC',
      'font-family': 'Plus Jakarta Sans, sans-serif',
      'font-size': '11px',
      'font-weight': '600',
      'text-wrap': 'wrap',
      'text-valign': 'bottom',
      'text-margin-y': 8,
      'border-width': 2,
    } as any,
  },
  {
    selector: 'node[type="victim"]',
    style: { 
      'background-color': '#1E293B',
      'border-color': '#f59e0b',
      'shape': 'ellipse',
      'width': 50, 'height': 50
    } as any,
  },
  {
    selector: 'node[type="mule"]',
    style: { 
      'background-color': '#1E293B',
      'border-color': '#ef4444', 
      'shape': 'hexagon',
      'width': 60, 'height': 60
    } as any,
  },
  {
    selector: 'node[type="atm"]',
    style: { 
      'background-color': '#3b82f6',
      'border-color': '#2563eb',
      'shape': 'round-rectangle',
      'width': 70, 'height': 40
    } as any,
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#334155',
      'target-arrow-color': '#334155',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': '10px',
      'font-weight': 'bold',
      'color': '#94a3b8',
      'text-background-color': '#151E32',
      'text-background-opacity': 1,
      'text-background-padding': '3px',
      'text-background-shape': 'roundrectangle',
      'source-endpoint': 'outside-to-node',
      'target-endpoint': 'outside-to-node',
    } as any,
  }
];

export default function Network() {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-main">Network Trace</h2>
        <div className="text-sm text-muted">Tracking money flow to withdrawal points</div>
      </div>
      
      <div className="flex-1 card flex overflow-hidden">
        <div className="flex-1 relative bg-base">
          <CytoscapeComponent 
            elements={elements} 
            style={{ width: '100%', height: '100%' }}
            stylesheet={stylesheet}
            layout={{ name: 'dagre', rankDir: 'TB' }}
            cy={(cy: any) => {
              cy.on('tap', 'node', (e: any) => setSelectedNode(e.target.data()));
              cy.on('tap', (e: any) => { if (e.target === cy) setSelectedNode(null); });
            }}
          />
        </div>
        
        {selectedNode && (
          <div className="w-72 border-l border-custom p-6 bg-surface shrink-0">
            <h3 className="font-semibold text-main mb-4 border-b border-custom pb-2">Node Details</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <div className="text-muted text-xs">ID</div>
                <div className="text-main">{selectedNode.id}</div>
              </div>
              <div>
                <div className="text-muted text-xs">Type</div>
                <div className="text-main capitalize">{selectedNode.type}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}