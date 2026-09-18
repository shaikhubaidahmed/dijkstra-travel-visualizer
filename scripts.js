onload = function () {
  // create a network
  var curr_data;
  var sz;
  var src;
  var dst;
  var config;
  var cities = [
    "Delhi",
    "Mumbai",
    "Gujarat",
    "Goa",
    "Kanpur",
    "Jammu",
    "Hyderabad",
    "Bangalore",
    "Gangtok",
    "Meghalaya",
  ];
  var container = document.getElementById("mynetwork");
  var container2 = document.getElementById("mynetwork2");
  var genNew = document.getElementById("generate-graph");
  var solve = document.getElementById("solve");
  var temptext = document.getElementById("temptext");
  var temptext2 = document.getElementById("temptext2");
  var busIcon = document.getElementById("busIcon");
  var planeIcon = document.getElementById("planeIcon");
  var srcSelect = document.getElementById("srcSelect");
  var dstSelect = document.getElementById("dstSelect");

  function cityLabel(i) {
    return cities[i - 1] || "City " + i;
  }

  function readConfig() {
    const num = (id, fallback) => {
      const v = parseFloat(document.getElementById(id).value);
      return Number.isFinite(v) ? v : fallback;
    };
    let minNodes = Math.max(3, Math.round(num("minNodes", 3)));
    let maxNodes = Math.max(minNodes, Math.round(num("maxNodes", 10)));
    let busMin = Math.max(1, Math.round(num("busMin", 31)));
    let busMax = Math.max(busMin, Math.round(num("busMax", 100)));
    let planeMin = Math.max(1, Math.round(num("planeMin", 1)));
    let planeMax = Math.max(planeMin, Math.round(num("planeMax", 50)));
    let maxHopBack = Math.max(1, Math.round(num("maxHopBack", 3)));
    let extraEdgeRatio =
      Math.min(100, Math.max(0, num("extraEdgeRatio", 50))) / 100;
    let busShareOfExtra =
      Math.min(100, Math.max(0, num("busShareOfExtra", 50))) / 100;
    let nodeColor = document.getElementById("nodeColor").value || "#991133";
    let busColor = document.getElementById("busColor").value || "#ffa500";
    let planeColor = document.getElementById("planeColor").value || "#008000";
    return {
      minNodes,
      maxNodes,
      busMin,
      busMax,
      planeMin,
      planeMax,
      maxHopBack,
      extraEdgeRatio,
      busShareOfExtra,
      nodeColor,
      busColor,
      planeColor,
    };
  }

  function buildVisOptions() {
    return {
      edges: {
        labelHighlightBold: true,
        font: {
          size: 20,
        },
      },
      nodes: {
        font: "12px arial red",
        scaling: {
          label: true,
        },
        shape: "icon",
        icon: {
          face: "FontAwesome",
          code: "",
          size: 40,
          color: config.nodeColor,
        },
      },
    };
  }

  // initialize your network!
  var network = new vis.Network(container);
  var network2 = new vis.Network(container2);

  function createData() {
    config = readConfig();
    network.setOptions(buildVisOptions());
    network2.setOptions(buildVisOptions());
    busIcon.style.color = config.busColor;
    planeIcon.style.color = config.planeColor;

    sz =
      Math.floor(
        Math.random() * (config.maxNodes - config.minNodes + 1)
      ) + config.minNodes;
    let nodes = [];
    for (let i = 1; i <= sz; i++) {
      nodes.push({ id: i, label: cityLabel(i) });
    }
    nodes = new vis.DataSet(nodes);

    let edges = [];
    for (let i = 2; i <= sz; i++) {
      let neigh =
        i - Math.floor(Math.random() * Math.min(i - 1, config.maxHopBack) + 1);
      edges.push({
        type: 0,
        from: i,
        to: neigh,
        color: config.busColor,
        label: String(
          Math.floor(Math.random() * (config.busMax - config.busMin + 1)) +
            config.busMin
        ),
      });
    }

    src = 1;
    dst = sz;

    const extraEdgeCount = Math.max(0, Math.round(sz * config.extraEdgeRatio));
    const busThreshold = Math.round(extraEdgeCount * config.busShareOfExtra);
    const maxAttempts = 10000;
    let attempts = 0;

    for (let i = 1; i <= extraEdgeCount && attempts < maxAttempts; ) {
      attempts++;
      let n1 = Math.floor(Math.random() * sz) + 1;
      let n2 = Math.floor(Math.random() * sz) + 1;
      if (n1 != n2) {
        if (n1 < n2) {
          let tmp = n1;
          n1 = n2;
          n2 = tmp;
        }
        let works = 0;
        for (let j = 0; j < edges.length; j++) {
          if (edges[j]["from"] === n1 && edges[j]["to"] === n2) {
            if (edges[j]["type"] === 0) works = 1;
            else works = 2;
          }
        }

        if (works <= 1) {
          if (works === 0 && i <= busThreshold) {
            edges.push({
              type: 0,
              from: n1,
              to: n2,
              color: config.busColor,
              label: String(
                Math.floor(
                  Math.random() * (config.busMax - config.busMin + 1)
                ) + config.busMin
              ),
            });
          } else {
            edges.push({
              type: 1,
              from: n1,
              to: n2,
              color: config.planeColor,
              label: String(
                Math.floor(
                  Math.random() * (config.planeMax - config.planeMin + 1)
                ) + config.planeMin
              ),
            });
          }
          i++;
        }
      }
    }

    let data = {
      nodes: nodes,
      edges: edges,
    };
    curr_data = data;
  }

  function populateEndpointSelects() {
    srcSelect.innerHTML = "";
    dstSelect.innerHTML = "";
    for (let i = 1; i <= sz; i++) {
      const label = cityLabel(i);

      const opt1 = document.createElement("option");
      opt1.value = i;
      opt1.textContent = label;
      srcSelect.appendChild(opt1);

      const opt2 = document.createElement("option");
      opt2.value = i;
      opt2.textContent = label;
      dstSelect.appendChild(opt2);
    }
    srcSelect.value = src;
    dstSelect.value = dst;
  }

  function updateProblemText() {
    temptext2.innerText =
      "Find least time path from " + cityLabel(src) + " to " + cityLabel(dst);
  }

  srcSelect.onchange = function () {
    src = parseInt(srcSelect.value);
    updateProblemText();
  };

  dstSelect.onchange = function () {
    dst = parseInt(dstSelect.value);
    updateProblemText();
  };

  genNew.onclick = function () {
    createData();
    network.setData(curr_data);
    populateEndpointSelects();
    updateProblemText();
    temptext.style.display = "inline";
    temptext2.style.display = "inline";
    container2.style.display = "none";
  };

  solve.onclick = function () {
    temptext.style.display = "none";
    temptext2.style.display = "none";
    container2.style.display = "inline";
    network2.setData(solveData(sz));
  };

  function dijkstra(graph, sz, src) {
    let vis = Array(sz).fill(0);
    let dist = [];
    for (let i = 1; i <= sz; i++) dist.push([10000, -1]);
    dist[src][0] = 0;

    for (let i = 0; i < sz - 1; i++) {
      let mn = -1;
      for (let j = 0; j < sz; j++) {
        if (vis[j] === 0) {
          if (mn === -1 || dist[j][0] < dist[mn][0]) mn = j;
        }
      }

      vis[mn] = 1;
      for (let j in graph[mn]) {
        let edge = graph[mn][j];
        if (vis[edge[0]] === 0 && dist[edge[0]][0] > dist[mn][0] + edge[1]) {
          dist[edge[0]][0] = dist[mn][0] + edge[1];
          dist[edge[0]][1] = mn;
        }
      }
    }

    return dist;
  }

  function solveData(sz) {
    let data = curr_data;
    let graph = [];
    for (let i = 1; i <= sz; i++) {
      graph.push([]);
    }

    for (let i = 0; i < data["edges"].length; i++) {
      let edge = data["edges"][i];
      if (edge["type"] === 1) continue;
      graph[edge["to"] - 1].push([edge["from"] - 1, parseInt(edge["label"])]);
      graph[edge["from"] - 1].push([edge["to"] - 1, parseInt(edge["label"])]);
    }

    let dist1 = dijkstra(graph, sz, src - 1);
    let dist2 = dijkstra(graph, sz, dst - 1);

    let mn_dist = dist1[dst - 1][0];

    let plane = 0;
    let p1 = -1,
      p2 = -1;
    for (let pos in data["edges"]) {
      let edge = data["edges"][pos];
      if (edge["type"] === 1) {
        let to = edge["to"] - 1;
        let from = edge["from"] - 1;
        let wght = parseInt(edge["label"]);
        if (dist1[to][0] + wght + dist2[from][0] < mn_dist) {
          plane = wght;
          p1 = to;
          p2 = from;
          mn_dist = dist1[to][0] + wght + dist2[from][0];
        }
        if (dist2[to][0] + wght + dist1[from][0] < mn_dist) {
          plane = wght;
          p2 = to;
          p1 = from;
          mn_dist = dist2[to][0] + wght + dist1[from][0];
        }
      }
    }

    let new_edges = [];
    if (plane !== 0) {
      new_edges.push({
        arrows: { to: { enabled: true } },
        from: p1 + 1,
        to: p2 + 1,
        color: config.planeColor,
        label: String(plane),
      });
      new_edges = new_edges.concat(pushEdges(dist1, p1, false));
      new_edges = new_edges.concat(pushEdges(dist2, p2, true));
    } else {
      new_edges = new_edges.concat(pushEdges(dist1, dst - 1, false));
    }
    data = {
      nodes: data["nodes"],
      edges: new_edges,
    };
    return data;
  }

  function pushEdges(dist, curr, reverse) {
    let path_edges = [];
    while (dist[curr][0] != 0) {
      let fm = dist[curr][1];
      if (reverse)
        path_edges.push({
          arrows: { to: { enabled: true } },
          from: curr + 1,
          to: fm + 1,
          color: config.busColor,
          label: String(dist[curr][0] - dist[fm][0]),
        });
      else
        path_edges.push({
          arrows: { to: { enabled: true } },
          from: fm + 1,
          to: curr + 1,
          color: config.busColor,
          label: String(dist[curr][0] - dist[fm][0]),
        });
      curr = fm;
    }
    return path_edges;
  }

  genNew.click();
};
