interface Vertex<T> {
  data: T;
}

interface Params<T> {
  getNeighbors(node: Vertex<T>): Iterable<Vertex<T>>;
  getCost(node: Vertex<T>): number;
  getKey(node: Vertex<T>): string;
  isFinish(node: Vertex<T>): boolean;
}

interface NodeInfo<T> {
  node: Vertex<T>;
  currentCost: number;
}
function dijsktra<T>(params: Params<T>, start: Vertex<T>) {
  const surface: Record<string, NodeInfo<T>> = {};
  const visited: Record<string, number> = {};

  surface[params.getKey(start)] = {
    currentCost: params.getCost(start),
    node: start
  }

  visited[params.getKey(start)] = params.getCost(start);
  let count = 0;
  while (Object.keys(surface).length > 0) {
    count++;
    if (count % 10_000 === 0) {
      console.log('Amount of elements in surface is ' + Object.keys(surface).length)
    }
    const currentKey = Object.keys(surface).reduce((a, b) => surface[a].currentCost < surface[b].currentCost ? a : b);
    const currentNode = surface[currentKey].node;
    const currentCost = surface[currentKey].currentCost;

    visited[currentKey] = currentCost;
    delete surface[currentKey];
    if (params.isFinish(currentNode)) {
      return currentCost;
    }
    const neighbours = params.getNeighbors(currentNode);
    for (const node of neighbours) {
      const key = params.getKey(node);
      const cost = params.getCost(node);

      if (!visited[key] && (!surface[key] || surface[key].currentCost > currentCost + cost)) {
        surface[key] = {
          node: node,
          currentCost: currentCost + cost
        };
      }
    }
  }
  throw new Error('Could not find finish')
}

const directions = ['up', 'down', 'left', 'right'] as const;

type Direction = typeof directions[number];
const directionMap: { [p in Direction]: [number, number] } = {
  down: [1, 0],
  up: [-1, 0],
  left: [0, -1],
  right: [0, 1]
}

const oppositeMap: { [p in Direction]: Direction } = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
}

type RouteInfo = {
  row: number;
  col: number;
  penalty: number;
  direction: Direction;
}

export function getParams(data: number[][]): Params<RouteInfo> {
  return {
    getCost: (node) => {
      return data[node.data.row][node.data.col];
    },
    getNeighbors: function* (node) {
      for (const dir of directions) {
        const current = node.data;
        if (oppositeMap[dir] === current.direction) {
          continue;
        }
        const [dc, dr] = directionMap[dir];
        const newCol = current.col + dc;
        const newRow = current.row + dr;

        if (!inBounds(data, newCol, newRow)) {
          continue;
        }
        const penalty = dir === current.direction ? current.penalty + 1 : 0;
        if (penalty > 2) {
          continue;
        }
        yield {
          data: {
            col: newCol,
            row: newRow,
            direction: dir,
            penalty: penalty
          }
        }
      }
    },
    getKey: (node) => {
      const data = node.data
      return `${data.row}_${data.col}_${data.direction}_${data.penalty}`;
    },
    isFinish: (node) => {
      return node.data.row === data.length - 1 && node.data.col === data[0].length - 1
    }
  }
}

function inBounds(input: any[][], row: number, col: number) {
  return between(row, 0, input.length) && between(col, 0, input[0].length);
}

function between(num: number, from: number, to: number) {
  return from <= num && num < to;
}
