'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  WorkflowDefinition, 
  WorkflowNode, 
  WorkflowEdge,
  getWorkflow 
} from '@/lib/workflows/definitions';

// Custom Node Components
const StartNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-green-100 border-2 border-green-500">
    <div className="flex">
      <div className="rounded-full w-3 h-3 bg-green-500 mt-1 mr-2"></div>
      <div>
        <div className="font-bold text-green-800">{data.label}</div>
        <div className="text-xs text-green-600">{data.description}</div>
      </div>
    </div>
  </div>
);

const ProcessNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-blue-100 border-2 border-blue-500">
    <div className="flex">
      <div className="rounded-full w-3 h-3 bg-blue-500 mt-1 mr-2"></div>
      <div>
        <div className="font-bold text-blue-800">{data.label}</div>
        <div className="text-xs text-blue-600">{data.description}</div>
        {data.assignee && (
          <div className="text-xs text-blue-500 mt-1">
            Assignee: {data.assignee}
          </div>
        )}
        {data.estimatedDuration && (
          <div className="text-xs text-blue-500">
            Est: {data.estimatedDuration}h
          </div>
        )}
      </div>
    </div>
  </div>
);

const DecisionNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-yellow-100 border-2 border-yellow-500 transform rotate-45">
    <div className="transform -rotate-45">
      <div className="font-bold text-yellow-800">{data.label}</div>
      <div className="text-xs text-yellow-600">{data.description}</div>
    </div>
  </div>
);

const EndNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-red-100 border-2 border-red-500">
    <div className="flex">
      <div className="rounded-full w-3 h-3 bg-red-500 mt-1 mr-2"></div>
      <div>
        <div className="font-bold text-red-800">{data.label}</div>
        <div className="text-xs text-red-600">{data.description}</div>
      </div>
    </div>
  </div>
);

const SubprocessNode = ({ data }: { data: any }) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-purple-100 border-2 border-purple-500">
    <div className="flex">
      <div className="rounded-full w-3 h-3 bg-purple-500 mt-1 mr-2"></div>
      <div>
        <div className="font-bold text-purple-800">{data.label}</div>
        <div className="text-xs text-purple-600">{data.description}</div>
        {data.assignee && (
          <div className="text-xs text-purple-500 mt-1">
            Assignee: {data.assignee}
          </div>
        )}
        {data.estimatedDuration && (
          <div className="text-xs text-purple-500">
            Est: {data.estimatedDuration}h
          </div>
        )}
      </div>
    </div>
  </div>
);

// Node types mapping
const nodeTypes: NodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  end: EndNode,
  subprocess: SubprocessNode,
};

// Convert workflow definition to React Flow nodes and edges
function convertWorkflowToFlow(workflow: WorkflowDefinition) {
  const nodes: Node[] = workflow.nodes.map((node: WorkflowNode) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      ...node.data,
      label: node.label,
      description: node.description,
    },
  }));

  const edges: Edge[] = workflow.edges.map((edge: WorkflowEdge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: edge.type || 'default',
    data: edge.data,
    animated: edge.type === 'conditional',
    style: edge.type === 'conditional' 
      ? { stroke: '#f59e0b', strokeWidth: 2 }
      : { stroke: '#6b7280', strokeWidth: 2 },
  }));

  return { nodes, edges };
}

interface WorkflowViewerProps {
  workflowType: 'payment' | 'draw' | 'inspection';
  className?: string;
}

export function WorkflowViewer({ workflowType, className }: WorkflowViewerProps) {
  const workflow = getWorkflow(workflowType);
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => convertWorkflowToFlow(workflow),
    [workflow]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className={`h-[600px] w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#f3f4f6" gap={20} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'start': return '#10b981';
              case 'end': return '#ef4444';
              case 'decision': return '#f59e0b';
              case 'subprocess': return '#8b5cf6';
              default: return '#3b82f6';
            }
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Panel position="top-left">
          <Card className="w-80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{workflow.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">{workflow.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {workflow.type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  v{workflow.version}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {workflow.nodes.length} nodes • {workflow.edges.length} edges
              </div>
            </CardContent>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
}

interface WorkflowStatusProps {
  workflowType: 'payment' | 'draw' | 'inspection';
  currentStep?: string;
  progress?: number;
}

export function WorkflowStatus({ workflowType, currentStep, progress = 0 }: WorkflowStatusProps) {
  const workflow = getWorkflow(workflowType);
  
  const currentNode = workflow.nodes.find(node => node.id === currentStep);
  const totalSteps = workflow.nodes.filter(node => 
    node.type === 'process' || node.type === 'subprocess'
  ).length;
  
  const completedSteps = Math.floor((progress / 100) * totalSteps);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Workflow Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{workflow.name}</span>
            <span>{completedSteps}/{totalSteps} steps</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {currentNode && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium text-sm">{currentNode.label}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {currentNode.description}
            </div>
            {currentNode.data.assignee && (
              <div className="text-xs text-muted-foreground mt-1">
                Assignee: {currentNode.data.assignee}
              </div>
            )}
            {currentNode.data.estimatedDuration && (
              <div className="text-xs text-muted-foreground">
                Est. Duration: {currentNode.data.estimatedDuration}h
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs">
            View Full Workflow
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            Export Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface WorkflowLegendProps {
  className?: string;
}

export function WorkflowLegend({ className }: WorkflowLegendProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm">Workflow Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded"></div>
          <span className="text-sm">Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
          <span className="text-sm">Process</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-500 rounded transform rotate-45"></div>
          <span className="text-sm">Decision</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-100 border-2 border-purple-500 rounded"></div>
          <span className="text-sm">Subprocess</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-500 rounded"></div>
          <span className="text-sm">End</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-4 h-0.5 bg-gray-400"></div>
          <span className="text-sm">Default Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-amber-400"></div>
          <span className="text-sm">Conditional Flow</span>
        </div>
      </CardContent>
    </Card>
  );
}
