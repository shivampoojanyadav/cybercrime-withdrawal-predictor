import React, { useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

cytoscape.use(dagre);

const elements = [
  // Nodes
  { data: { id: 'c1', type: 'complaint', label: 'SIH-0F3A2B1C', amount: '₹74,886' } },
  { data: { id: 'w1', type: 'wallet', label: 'Suspect Acc (ICICI)', account: 'XXXX1234' } },
  { data: { id: 'm1', type: 'mule', label: 'Mule 1 (HDFC)', account: 'XXXX9876' } },
  { data: { id: 'm2', type: 'mule', label: 'Mule 2 (SBI)', account: 'XXXX4567' } },
  { data: { id: 'a1', type: 'atm', label: 'ATM - Delhi Sector 4' } },
  { data: { id: 'a2', type: 'atm', label: 'ATM - Noida Phase 2' } },

  // Edges
  { data: { source: 'c1', target: 'w1', label: 'Transfer' } },
  { data: { source: 'w1', target: 'm1', label: 'Split' } },
  { data: { source: 'w1', target: 'm2', label: 'Split' } },
  { data: { source: 'm1', target: 'a1', label: 'Withdrawal' } },
  { data: { source: 'm2', target: 'a2', label: 'Withdrawal' } },
];

const stylesheet = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'color': '#E8F4FD',
      'font-family': 'Rajdhani',
      'font-size': '12px',
      'text-valign': 'bottom',
      'text-margin-y': 6,
      'text-background-color': '#020B18',
      'text-background-opacity': 0.8,
      'text-background-padding': '2px',
    } as any,
  },
  {
    selector: 'node[type="complaint"]',
    style: {
      'shape': 'ellipse',
      'background-color': '#FF6B2B',
      'width': 24,
      'height': 24,
    } as any,
  },
  {
    selector: 'node[type="wallet"]',
    style: {
      'shape': 'hexagon',
      'background-color': '#00D4FF',
      'width': 28,
      'height': 28,
    } as any,
  },
  {
    selector: 'node[type="mule"]',
    style: {
      'shape': 'triangle',
      'background-color': '#FF3333', // Assuming red for mule
      'width': 24,
      'height': 24,
    } as any,
  },
  {
    selector: 'node[type="atm"]',
    style: {
      'shape': 'rectangle',
      'background-color': '#FFFFFF',
      'width': 20,
      'height': 20,
    } as any,
  },
  {
    selector: 'edge',
    style: {
      'width': 1.5,
      'line-color': '#4A7A9B',
      'target-arrow-color': '#4A7A9B',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'line-style': 'dashed',
      'line-dash-pattern': [4, 4],
    } as any,
  }
];

const NetworkGraph: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeClick = (event: any) => {
    const node = event.target;
    setSelectedNode(node.data());
  };

  return (
    <div className="w-full h-full relative bg-base overflow-hidden flex">
      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 z-10 w-[240px] bg-surface border border-custom p-4 flex flex-col gap-4">
        <h2 className="font-display font-bold text-primary text-sm tracking-widest">NETWORK CONTROLS</h2>
        
        <div className="flex flex-col gap-1">
          <label className="font-display text-xs text-muted">Case ID Filter</label>
          <input type="text" className="bg-base border border-custom text-primary px-2 py-1 font-data text-xs focus:outline-none focus:border-primary" placeholder="All Cases" />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="font-display text-xs text-muted">Amount Threshold (₹)</label>
          <input type="number" className="bg-base border border-custom text-primary px-2 py-1 font-data text-xs focus:outline-none focus:border-primary" placeholder="0" defaultValue="10000" />
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 w-full h-full">
        <CytoscapeComponent 
          elements={elements} 
          style={{ width: '100%', height: '100%' }}
          stylesheet={stylesheet}
          layout={{ name: 'dagre', rankDir: 'TB', spacingFactor: 1.5 }}
          cy={(cy: any) => {
            cy.on('tap', 'node', handleNodeClick);
            cy.on('tap', (e: any) => {
              if (e.target === cy) {
                setSelectedNode(null);
              }
            });
          }}
        />
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="w-[320px] h-full absolute right-0 top-0 bg-surface border-l border-custom z-20 flex flex-col"
          >
             <div className="p-4 border-b border-custom flex justify-between items-center bg-base">
                <div>
                  <div className="font-data text-xs text-muted uppercase">NODE DETAILS</div>
                  <div className="font-data text-sm text-primary">{selectedNode.id}</div>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-muted hover:text-primary transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div>
                  <div className="font-display text-xs text-muted">TYPE</div>
                  <div className="font-display text-lg text-primary uppercase">{selectedNode.type}</div>
                </div>
                <div>
                  <div className="font-display text-xs text-muted">LABEL</div>
                  <div className="font-display text-base text-primary">{selectedNode.label}</div>
                </div>
                {selectedNode.amount && (
                  <div>
                    <div className="font-display text-xs text-muted">AMOUNT</div>
                    <div className="font-data text-lg text-warning">{selectedNode.amount}</div>
                  </div>
                )}
                {selectedNode.account && (
                  <div>
                    <div className="font-display text-xs text-muted">ACCOUNT/WALLET</div>
                    <div className="font-data text-base text-primary">{selectedNode.account}</div>
                  </div>
                )}
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkGraph;
