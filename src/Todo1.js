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

  let links = [];
  let _links = [];
  let nodes = [];
  let _nodes = [];
  let rawdatanode= [];
  let rawdatalink= [];

  if (data.links) {
    links = data.links.map((d) => ({ ...d }));//Create an array with name links (this array contains every link)
  }

  if (data._links) {
    _links = data._links.map((d) => ({ ...d }));//Create an array with name links (this array contains every link)
    links.push(..._links); //add a copy of _links to links
    links.forEach((link, index)=> link.id=index)
    // console.log("links concatenated:", links)
  }

  if (data.nodes) {
    nodes = data.nodes.map((d) => ({ ...d }));//Create an array with name links (this array contains every link)
  }

  if (data._nodes) {
    _nodes = data._nodes.map((d) => ({ ...d }));//Create an array with name links (this array contains every link)
    nodes.push(..._nodes);
    // console.log("nodes concatenated:", nodes)
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

    // console.log("links", links);
    // console.log("_links", _links);

    rawdatalink = RemoveLinks(_links, links);
    // console.log("rawdatalink", rawdatalink);
    _links = rawdatalink
    _nodes = RemoveNodes(_nodes, nodes);
    
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

  let node = svg
    .append("g")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .selectAll()
    .data(nodes)
    .join("circle")
    .attr("r", 5)
    .attr("fill", (d) => color(d.group))
  .on("click", (_event, target) => {
    console.log(target);
    const children = GetVisibleChildren(target.id);
    const _children = GetInvisibleChildren(target.id);
    const vlinks= GetVisibleLinks(target.id);
    console.log("VisibleLinks: ", vlinks)
    const invlinks=  GetInvisibleLinks(target.id)
    if (_children.length!=0) {
      MakeChildrenVisible(target.id);
      MakeLinksVisible(target.id)

      console.log("nodes visible", nodes)
      // CheckVisible(target.id);
    }
    else{
      MakeChildrenInvisible(target.id);
      MakeLinksInvisible(target.id)

      console.log("nodes invisible", _nodes)
      // CheckInvisible(target.id);
    }


  //   simulation.force("link", d3.forceLink(links).id((d) => d.id)))
  // const childrenlinks = getChildrenLinks(target);


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


    node.data(nodes, (d)=>d.id).join(
      (enter) =>
        enter
          .append("circle")
          .attr("r", 5)
          .attr("fill", (d) => color(d.group)),
      (update) => update,
      (exit) => exit.remove()
    );

    link.data(links, (d)=>d.id).join(
      (enter) =>
        enter
          .append("g")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6),
      (update) => update,
      (exit) => exit.remove()
    );
    // //console.log(node.data());
    // const nodeExit = node.exit();

    // node.exit().remove();

    // const nodeEnter = node.enter()
    //   .append("g")
    //   .attr("stroke", "#fff")
    //   .attr("stroke-width", 1.5)
    //   .join("circle")
    //   .attr("r", 5)
    //   .attr("fill", (d) => color(d.group))
    //   // .on(click)

    // node = nodeEnter.merge(node);

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
  });
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

  // console.log("Links", links);
  // console.log("_Links", _links);
  // console.log("Links[0]", links[0].source.id);
  // console.log("_Links[0]", _links[0].source);


  // const GetVisibleLinks = (data) => 
  //   links.filter((link) => link.source.id === data);
  
  const GetVisibleLinks = (data) => {
    const filteredLinks = links.filter((linkk) => linkk.source.id === data);
    console.log("Filtered links:", filteredLinks);
    return filteredLinks;
  };
  

  function GetInvisibleLinks(data) {
    return _links
      .filter((link) => { //cheking if the data was touched or not (we use that in the other codes)
        return link.source.id === data
      }); //Return an array that contains every _link.source where the name it's equal the data 
  }

  function GetVisibleParent(data){ // we are only interessed in the links that this node has with their target
    console.log("seeing the data in getvisibleparent", data); 
    let eachtarget = [];
    let k =0
    let i=0;
    let j=0;
    let result =[]
    // console.log("dataused",dataused)
    
    for (k; k < data.length; k++) {
      eachtarget.push(data[k].target.id);
    }
    
    eachtarget;
    console.log("eachtarget", eachtarget);

    result = links.filter(link => eachtarget.includes(link.target.id));

    console.log("result", result)
    return result
  }

  function GetInvisibleParent(data){ // we are only interessed in the links that this node has with their target
    return _links
      .filter((link)=>{
        return link.target.id===data;
      })
  }

  const GetVisibleChildren = (data) => {
    // Aqui, em cada link, estamos aplicando uma função map que, para cada link encontrado, procura um nó cujo id seja igual ao id do target do link
    let a;
    let b;
    b = GetVisibleLinks(data)
    a =  GetVisibleLinks(data)
    .map((linkk) => nodes.find((nodee) => nodee.id === linkk.target.id));
    console.log("value of a:",a)
    return a
  }
  

  function GetInvisibleChildren(data) {// First we made an functoin in the link
    return GetInvisibleLinks(data)     // where we made an filter in the invisible nodes where 
      .map((link) => _nodes.find((node) => node.id === link.target)); //the node.id it's equal of the link target
  }

  function RemoveNodes(nodesToRemove, nodesDataset) {
    let nodesremoved= []
    let noderemovecopy = nodesToRemove.slice(); // Creating an copy to maninpulate the data 
    noderemovecopy.forEach(node => {
      // console.log("Dataset 0:", nodesDataset[0]);
      // console.log("Node.id", node.id);
      
      let index=-1;//Defining the first value of index
      let i=0;
      while (i<nodesDataset.length && index==-1) {
        if (nodesDataset[i].id===node.id) {
          index= i;
        }
        i++;
      }
      while(index >= 0){
        index = -1;
        i=0;
        while (i<nodesDataset.length && index==-1) { //achar a nova primeira posição
          if (nodesDataset[i].id===node.id) {
            index= i;
            nodesremoved.push(nodesDataset[index]);
            nodesDataset.splice(index, 1);
          }
          i++;
        }
      }
      
    })
    return nodesremoved
  }

  function RemoveLinks(linksToRemove, linksDataset){
    console.debug("linkstoRemove: ", linksToRemove);
    console.debug("linksDataset: ", linksDataset);
    let linksremoved = [];
    let copilinksremoved;
    let linkremovecopy = linksToRemove.slice(); // Creating an copy to maninpulate the data 
    linkremovecopy.forEach(target => {
      // console.debug("Dataset 0:", linksDataset[0]);
      // console.debug("target", target);
      let index=-1;//Defining the first value of index
      let i=0;
      // console.debug("linksDataset.length:", linksDataset.length)

      while (i<linksDataset.length && index==-1) {
        // console.debug("Aqui estamos dentro do while para pegar o primeiro valor do index")
        // console.log("Vendo como checar detro do link")
        // console.log("\n linkdDataset[i].target.id", linksDataset[i].target.id)// accessing the name of each link name (this way it's used to access data that was alredy modified)
        // console.log("\n target.target.id", target.target.id)// accesing the nid of each target (this way is used to access that already modified)
        // console.log("\n \n target.target", target.target);// accessing data that was not modified
        // console.log("\n \n target.source", target.source);// accessing data that wasn't modified
        // console.log("\n linkdDataset[i].target", linksDataset[i].target); //accssing data that was not modified
        // console.log("\n linkdDataset[i].source", linksDataset[i].source)//accessing data that was not modified
        if (((linksDataset[i].target===target.target) && (linksDataset[i].source===target.source))) { //with that if we cover that data that was manipulated and the one that was'nt
          index= i;
          // console.log("A GENTE TA DENTRO DO IF, ENTÃO OS VALORES A SEGUIR DEVEM, OBRIGATORIAMENTE SEREM IGUAIS \n \n \n")
          // console.log("linksDataset[i].target", linksDataset[i].target)
          // console.log("target.target", target.target);
          // console.log("linksDataset[i].source", linksDataset[i].source)
          // console.log("target.source", target.source)
          // console.log("Deu certo, index mudou");
        }
        // console.debug("linkdsDataset[i]: ", linksDataset[i]);
        // console.debug("target: ", target);
        // console.debug("index: ", index)
        i++;
      }

      while(index >= 0){
        index = -1;
        i=0;
        while (i<linksDataset.length && index==-1) { //find the new first position
          if (((linksDataset[i].target===target.target) && (linksDataset[i].source===target.source))) {
            // console.log("AGORA CHEGOU A PARTE DE CORTAR OS ARRAYS \n \n \n \n \n")
            
            // console.debug("Dentro do if \n \n" )
            // console.debug("id do Source", target.source)
            // console.debug("id do target", target.target)
            // console.debug("Source base", linksDataset[i].source)
            // console.debug("Target base", linksDataset[i].target)
            index= i;
            linksremoved.push(linksDataset[i]);
            linksDataset.splice(index, 1);// deleting only the element of the index
            copilinksremoved= linksremoved;
          }
          i++;
        }
      }

    })
    // console.log("Dataset após remove:", linksDataset);
    // console.log("os links que eram pra ser removidos", linksToRemove)
    // console.log("links removidos",linksremoved)
     return copilinksremoved
  }

  function RemoveEveryVisibleLinks(data){ //here we are goit to passa every link that the removed children has from links to _links
    // the data passed is an array that contais every children
    console.log("data", data)
    let k=0
    let c;
    let linkscontained=[]
    console.log("links before", links)

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < links.length; j++) {
        if (((data[i].source.id===links[j].source.id)|| data[i].source.id===links[j].target.id)||
        ((data[i].target.id===links[j].source.id)|| data[i].target.id===links[j].target.id)) {
          linkscontained.push(links[j])          
        }
      }
      
    }
    
    c = RemoveLinks(linkscontained, links)
    console.log("links after", links)
    return c
  }

  function RemoveEveryInvisibleLinks(data){ //here we are goit to passa every link that the removed children has from links to _links
    // the data passed is an array that contais every children
    console.log("data", data)
    let k=0
    let linkscontained=[]
    // console.log("links before", links)

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < _links.length; j++) {
        if ((data[i].id===_links[j].source.id)|| data[i].id===_links[j].target.id) {
          linkscontained.push(_links[j])          
        }
      }
      
    }
    
    RemoveLinks(linkscontained, _links)
    // console.log("links after", links)
    return linkscontained
  }

  function MakeChildrenVisible(data){ //making the invisible visible 
    let _children= GetInvisibleChildren(data);
    // console.log("nodes ", nodes);
    // console.log("_children", _children)
    nodes.push(..._children);
    // console.log("nodes", nodes) //adding every attribute that children has
    RemoveNodes(_children, _nodes);
    // RemoveLinks(_children, _links)
    console.log("End of MakeChildrenVisible", _nodes);
  }

  function MakeChildrenInvisible(data){ //making the visible invisible
    console.log("starting MakeCHildrenInvisible \n \n \n \n \n");
    console.log("data", data)
    let children= GetVisibleChildren(data);
    console.log("children", children)
    _nodes.push(...children); //adding every attribute that children has
    RemoveNodes(children, nodes);
    MakeLinksInvisible(data);
    console.log("_nodes", _nodes);
    console.log("_links", _links)
    console.log("nodes", nodes);
    console.log("links", links);
    console.log("End of MakeChildrenInvisible", nodes);
  }


  function MakeLinksVisible(data){ //we call an invisible link and make it visible
    console.log("calling getinvisiblelinks")
    let _childrenlinks = GetInvisibleLinks(data);
    // console.log("_childrenlinks", _childrenlinks)
    // console.log("links",  links)
    links.push(..._childrenlinks); //adding every invisible link in the visible one
    // console.log("links", links)
    RemoveLinks(_childrenlinks, _links);
    console.log("End of MakeLinksVisble", _links)
  }

  function MakeLinksInvisible(data){ //we call a visible link and make it invisible
    console.log("starginf makelinksinvisible \n \n \n \n")
    console.log("data", data);
    console.log("calling getvisiblelinks")
    let childrenlinks = GetVisibleLinks(data);
    let childrennodes= GetVisibleChildren(data)
    console.log("childrenlinks", childrenlinks)
    console.log("links",  links)
    _links.push(...childrenlinks); //adding every invisible link in the visible one
    console.log("_links", _links)
    RemoveEveryVisibleLinks(childrenlinks)
    console.log("links após remoção", links)
    console.log("End of MakeLinksInvisble")
  }

  function CheckVisible (data){ // see in _links if everything (source and target)  are  visible and if so make the link visible
    _links.forEach(_link => {
      if ((((_link.target.id=== data.target.id) && (_links.source.id=== data.source.id)) || 
           ((_link.target.id=== data.target) && (_links.source.id=== data.source)))) {
        MakeLinksVisible(data)
      }
    });
  }

  function CheckInvisible (data){ //see in links if everithyng (source and target) are invisible
    links.forEach(link => {
      if ((((link.target.id=== data.target.id) && (links.source.id=== data.source.id)) || 
           ((link.target.id=== data.target) && (links.source.id=== data.source)))) {
        MakeLinksInvisible(data)
      }
    });
  }


// testing functions

// console.log("GetVisibleChildren( VictorHugo ):", GetVisibleChildren("VictorHugo"));
// console.log("testing node.id")
// console.log("GetInvisibleChildren( B ):", GetInvisibleChildren("Blanck"));
console.log("GetVisibleLinks(VictorHugo):", GetVisibleLinks("VictorHugo"));
// console.log("GetVisibleParents:",GetVisibleParent("Valjean"));
// console.log("GetVisibleLinks(VictorHugo):", GetVisibleLinks({id: "VictorHugo"}));
// console.log("GetInvisibleLinks(Blanck):", GetInvisibleLinks("Blanck"));
// console.log("Testing remove nodes", RemoveNodes(GetVisibleChildren("VictorHugo"), nodes));
// console.log("Testing removelinks: ", RemoveLinks(GetVisibleParent("Valjean"), links));
// console.log("Testing remove links", RemoveLinks(_links, links));
// console.log("Testing RemoveEveryVisisbleLink", RemoveEveryVisibleLinks(GetVisibleChildren("VictorHugo")))
// console.log("Testinf making links invisible do F: ", MakeLinksVisible("F"));
// console.log("Testing MakeVisible function with VictorHugo: ",MakeLinksInvisible("VictorHugo") )
// console.log("Children visible", MakeChildrenVisible("C"))
// console.log("Seeing the structure of _nodes", _nodes)
// console.log("Seeing the structure of nodes", nodes)
// console.log("Seeing the structure of _links", _links)
// console.log("Seeing the structure of links", links)
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

