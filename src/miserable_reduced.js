const miserables = {
    nodes: [
        { id: "OldMan", group: 1, visible: true },
        { id: "Valjean", group: 2, visible: true },
        { id: "Mme.deR", group: 2, visible: true },
        { id: "Gervais", group: 2, visible: true },
        { id: "VictorHugo", group: 28, visible: true },
        // { id: null, group: 35, visible: true }
    ],
    links: [
        { source: "Mme.deR", target: "Valjean", value: 1, visible: true },
        { source: "Gervais", target: "Valjean", value: 1, visible: true },
        { source: "VictorHugo", target: "OldMan", value: 1, visible: true },
        { source: "VictorHugo", target: "Mme.deR", value: 1, visible: true },
        { source: "VictorHugo", target: "Gervais", value: 1, visible: true },

    ],
};
