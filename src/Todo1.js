// TODO: move simulation, node, and links to an update function
// node.enter() should include code for drawing new nodes https://d3js.org/d3-selection/joining#selection_enter
// node.merge() or .join() is maybe necessary as well https://d3js.org/d3-selection/joining#selection_join ; https://d3js.org/d3-selection/joining#selection_join
// node.exit() should include .remove() https://d3js.org/d3-selection/joining#selection_exit
// look at example https://observablehq.com/@d3/collapsible-tree for how this is done with trees


import * as d3 from "d3";

// Copyright 2021-2023 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/force-directed-graph
function ForceGraph(
  data = {},
  {
    nodeId = (d) => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeTitle, // given d in nodes, a title string
    nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
    nodeStroke = "#fff", // node stroke color
    nodeStrokeWidth = 1.5, // node stroke width, in pixels
    nodeStrokeOpacity = 1, // node stroke opacity
    nodeRadius = 5, // node radius, in pixels
    nodeStrength,
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkStroke = "#999", // link stroke color
    linkStrokeOpacity = 0.6, // link stroke opacity
    linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
    linkStrokeLinecap = "round", // link stroke linecap
    linkStrength,
    colors = d3.schemeTableau10, // an array of color strings, for the node groups
    width = 1000, // outer width, in pixels
    height = 1000, // outer height, in pixels
    invalidation, // when this promise resolves, stop the simulation
  } = {}
) {
  // Specify the color scale.
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // The force simulation mutates links and nodes, so create a copy
  // so that re-evaluating this cell produces the same result.

  let links;
  let _links;
  let nodes;
  let _nodes;

  if (data.links && data.nodes && data._links && data._nodes) {
    links = data.links.map((d) => ({ ...d }));//Create an array with name links (this array contains every link)
    _links = data._links.map((d) => ({ ...d })); // we will use when the id gets set off
    nodes = data.nodes.map((d) => ({ ...d }));//Create an array with name nodes(this array contais every node)
    _nodes = data._nodes.map((d) => ({ ...d })); // we will use when the id gets sets off
  }
  else {
    return
  }
  //console.debug(nodes);
  //console.debug(links);
  //console.debug(getVisibleNodes(nodes));
  //console.debug(getVisibleLinks(links));
  // Create a simulation with several forces.
  const simulation = d3
    .forceSimulation(nodes)
    .force(
      "link",
      d3.forceLink(links).id((d) => d.id) //here the nodes get named
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2)) // here made all the nodes stay in the same position
    .on("tick", ticked);

  // Create the SVG container.
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto;");

  // Add a line for each link, and a circle for each node.
  const link = svg
    .append("g")
    .attr("stroke", "#999")
    .attr("stroke-opacity", 0.6)
    .selectAll()
    .data(links)
    .join("line")
    .attr("stroke-width", (d) => Math.sqrt(d.value));

  const node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(nodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", (d) => color(d.group))
  // .on("click", (_event, target) => {
  //   console.log(target);
  //   const children = getChildren(target);
  //   const childrenlinks = getChildrenLinks(target);
  //   // TODO: see if you can hide nodes from the simulation when they are invisible and vice versa
  //   // - Try to rely on id/_id for now
  //   children.forEach((child) => { // can name whathever i want

  //     // node.filter((node) => node.index == child.index).join();
  //     // node.filter((node) => node.index == child.index).remove();
  //     console.log(child);
  //   });
  //   console.log(nodes);

  //   childrenlinks.forEach((link) => { // can name whathever i want


  //     // node.filter((node) => node.index == child.index).join();
  //     // node.filter((node) => node.index == child.index).remove();
  //     console.log(link);
  //   });


  //   node.data(getVisibleNodes(nodes)).join(
  //     (enter) =>
  //       enter
  //         .append("circle")
  //         .attr("r", 5)
  //         .attr("fill", (d) => color(d.group)),
  //     (update) => update,
  //     (exit) => exit.remove()
  //   );
  //   //console.log(node.data());

  //   link.data(getVisibleLinks(links)).join(
  //     (enter) =>
  //       enter.append("line").attr("stroke-width", (d) => Math.sqrt(d.value)),
  //     (update) => update,
  //     (exit) => exit.remove()
  //   );
  //   console.log(link.data());

  //   simulation.force(
  //     "link",
  //     d3.forceLink(links).id((d) => d.id) //here the nodes get named
  //   );
  // });
  // console.log(nodes);


  node.append("title").text((d) => d.id);

  // Add a drag behavior.
  node.call(
    d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
  );

  // Set the position attributes of links and nodes each time the simulation ticks.
  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  }

  // Reheat the simulation when drag starts, and fix the subject position.
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  // Update the subject (dragged node) position during drag.
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  // Restore the target alpha so the simulation cools after dragging ends.
  // Unfix the subject position now that it’s no longer being dragged.
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }


  /**
 * Get the child nodes of a node in a graph.
 * @param {string} id - the id of the node
 * @param {{
 *  nodes: Array<{
  *    id: string,
  *    group: number }>,
  *  links: Array<{
  *    source: string,
  *    target: string,
  *    value: number
  *  }>}} graph - an object with nodes and links to search within
  * @returns {Array<string>} - returns an array of strings of the child node ids
  */
  // function getChildren(d) {
  //   //console.debug(d);
  //   const children = [];
  //   getChildrenLinks(d).forEach((link) => {
  //     children.push(link.target); // uptaded the array function to show only the id and the visibility
  //   });
  //   // console.info("end of function");
  //   // console.debug(children);
  //   return children;
  // }


  /**
 * Add a set of nodes and their adjacent links to the graph.
 * @param {
 *  nodes: Array<{
  *    id: string,
  *    group: number }>,
  *  links: Array<{
  *    source: string,
  *    target: string,
  *    value: number
  *  }>} graph - an object with nodes and links to add to the d3 graph
  */
  // function getChildrenLinks(d) {
  //   const childLinks = [];
  //   links.forEach((link) => {
  //     if (d.id === link.source.id || d._id === link.source.id) {
  //       childLinks.push(link); // uptaded the array function to show only the id and the visibility
  //     }
  //   });
  //   // console.info("end of function");
  //   return childLinks;
  // }

  // function getVisibleNodes(nodes) {
  //   return nodes.filter((d) => d.visible); //here we create an new array again 
  // }
  // console.log(links)

  // TODO: call update here

  function GetVisibleLinks(data) {
    return links.filter((link) => link.source.id === data); // Return an array that contains every link.source where the name it's equal at thee input
  }

  function GetInvisibleLinks(data) {
    return _links
      .filter((link) => link.source === data); //Return an array that contains every _link.source where the name it's equal the data 
  }

  function GetVisibleChildren(data) {
    return links
      .filter((link) => link.source.id === data) //Create an array where the link.source it's equal of the data
      .map((link) => nodes.find((node) => node.id === link.target.id))// Here in each link we are appling an map function that stands for every link we find an node which that id it's equal of the link target)      
  }

  function GetInvisibleChildren(data) {
    return _links // will return the invisible links 
      .filter((link) => link.source === data) // same thing as the other one, create an array that contains every link.source that it's equal of the data
      .map((link) => _nodes.find((node) => node.id === link.target)); // First we made an functoin in the link where we made an filter in the invisible nodes where the node.id it's equal of the link target
  }
  // testing functions

  console.log("GetVisibleChildren( VictorHugo ):", GetVisibleChildren("VictorHugo"));
  console.log("GetInvisibleChildren( B ):", GetInvisibleChildren("Blanck"));
  console.log("GetVisibleLinks():", GetVisibleLinks("Gervais"));
  console.log("GetInvisibleLinks( B ):", GetInvisibleLinks("Blanck"));

  return svg.node();
}








// create graph
const graph = ForceGraph(miserables, {
  nodeId: (d) => d.id,
  nodeGroup: (d) => d.group,
  nodeTitle: (d) => `${d.id}\n${d.group}`,
  linkStrokeWidth: (l) => Math.sqrt(l.value),
  width: 1200,
  height: 800,
});

// get container div and attach graph to it
const container = document.getElementById("container");
container.append(graph);

