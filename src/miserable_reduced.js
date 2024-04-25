const miserables = {
    nodes: [
        { id: "OldMan", group: 1 },
        { id: "Valjean", group: 2 },
        { id: "Mme.deR", group: 2 },
        { id: "Gervais", group: 2 },
        { id: "VictorHugo", group: 28 },
        // { id: null, group: 35 }
    ],
    links: [
        { source: "Mme.deR", target: "Valjean", value: 1 },
        { source: "Gervais", target: "Valjean", value: 1 },
        { source: "VictorHugo", target: "OldMan", value: 1 },
        { source: "VictorHugo", target: "Mme.deR", value: 1 },
        { source: "VictorHugo", target: "Gervais", value: 1 },

    ],
    _nodes:  [
        { id: 'Blanck', group: 4 },
        { id: 'C', group: 4 },
        { id: 'D', group: 4 },
        { id: 'F', group: 4 },
      ],
    _links:  [
        { source: 'Blanck', target: 'C' },
        { source: 'Blanck', target: 'D' },
      ],
};
