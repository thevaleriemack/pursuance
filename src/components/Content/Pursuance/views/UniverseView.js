// UniverseView.js

import React from 'react';
import { InteractiveForceGraph, ForceGraphNode, ForceGraphLink } from 'react-vis-force';
import './UniverseView.css';

const makeNodes = (n) => {
    <ForceGraphNode
      node={{ id: n.id, label: n.label }}
      className={n.className}
      fill={n.color}
      opacity={n.opacity}
      stroke={n.stroke}
      strokeWidth={n.strokeWidth}
      r={n.radius}
      labelClass={n.labelClass}
    />
  }

const divStyle = {
  color: 'white'
};

const UniverseView = ({ match: { params: { pursuanceId } } }) => {

  return (
    <InteractiveForceGraph
      simulationOptions={{ height: 300, width: 300 }}
      labelAttr="label"
      onSelectNode={(node) => console.log(node)}
      highlightDependencies
    >
      <ForceGraphNode
        node={{ id: pursuanceId, label: pursuanceId }}
        fill="red"
        r={10}
        stroke={"none"}
        labelClass="text"
      />
      <ForceGraphNode node={{ id: 'second-node', label: 'Second node' }} fill="blue" />
      <ForceGraphLink link={{ source: pursuanceId, target: 'second-node' }} />
    </InteractiveForceGraph>
  )
};



export default UniverseView;