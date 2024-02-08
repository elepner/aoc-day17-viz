type Vertex<T> = T

interface Params<T> {
  getNeighbors(node: Vertex<T>): Iterable<Vertex<T>>;
  getCost(node: Vertex<T>): number;
  getKey(node: Vertex<T>): string;
  isFinish(node: Vertex<T>): boolean;
}

export interface NodeInfo<T> {
  node: Vertex<T>;
  currentCost: number;
}

export type DijkstraStep<T> = {
  type: 'surface-updated';
  surface: Record<string, NodeInfo<T>>;
} | {
  type: 'visited-updated';
  visited: Record<string, boolean>;
} | {
  type: 'current-updated';
  currentId: string;
} | {
  type: 'neighbors-scanned',
  neighbors: T[]
} | {
  type: 'neighbor-picked',
  node: T;
} | {
  type: 'next-neighbor'
}

export function* dijsktra<T>(params: Params<T>, start: Vertex<T>): Generator<DijkstraStep<T>, void, unknown> {
  const surface: Record<string, NodeInfo<T>> = {};
  const visited: Record<string, boolean> = {};

  surface[params.getKey(start)] = {
    currentCost: params.getCost(start),
    node: start
  }

  visited[params.getKey(start)] = true//params.getCost(start);
  yield {
    type: 'visited-updated',
    visited: visited
  };

  let count = 0;
  while (Object.keys(surface).length > 0) {
    count++;
    if (count % 10_000 === 0) {
      console.log('Amount of elements in surface is ' + Object.keys(surface).length)
    }
    const currentKey = Object.keys(surface).reduce((a, b) => surface[a].currentCost < surface[b].currentCost ? a : b);

    yield {
      type: 'current-updated',
      currentId: currentKey
    }

    const currentNode = surface[currentKey].node;
    const currentCost = surface[currentKey].currentCost;

    visited[currentKey] = true//currentCost;
    yield {
      type: 'visited-updated',
      visited
    }
    delete surface[currentKey];
    yield {
      type: 'surface-updated',
      surface
    }
    if (params.isFinish(currentNode)) {
      return;
    }

    const neighbours = Array.from(params.getNeighbors(currentNode));
    yield {
      type: 'neighbors-scanned',
      neighbors: neighbours
    }
    for (const node of neighbours) {
      yield {
        type: 'neighbor-picked',
        node: node
      }
      const key = params.getKey(node);
      const cost = params.getCost(node);

      if (!visited[key] && (!surface[key] || surface[key].currentCost > currentCost + cost)) {
        yield {
          type: 'surface-updated',
          surface: surface
        }
        surface[key] = {
          node: node,
          currentCost: currentCost + cost
        };
      }
      yield {
        type: 'next-neighbor'
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

export type RouteInfo = {
  row: number;
  col: number;
  penalty: number;
  direction: Direction;
}

export function getId(node: RouteInfo) {
  {
    return `${node.row}_${node.col}_${node.direction}_${node.penalty}`;
  }
}

export function getParams(data: number[][]): Params<RouteInfo> {
  let isFirst = true;
  return {
    getCost: (node) => {
      return data[node.row][node.col];
    },
    getNeighbors: function* (node) {
      for (const dir of directions) {
        const current = node;
        if (oppositeMap[dir] === current.direction && !isFirst) {
          isFirst = false;
          continue;
        }
        const [dr, dc] = directionMap[dir];
        const newRow = current.row + dr;

        const newCol = current.col + dc;

        if (!inBounds(data, newRow, newCol)) {
          continue;
        }
        const penalty = dir === current.direction ? current.penalty + 1 : 0;
        if (penalty > 2) {
          continue;
        }
        yield {
          col: newCol,
          row: newRow,
          direction: dir,
          penalty: penalty
        }
      }
    },
    getKey: (node) => {
      return getId(node);
    },
    isFinish: (node) => {
      return node.row === data.length - 1 && node.col === data[0].length - 1
    }
  }
}


function inBounds(input: any[][], row: number, col: number) {
  return between(row, 0, input.length) && between(col, 0, input[0].length);
}

function between(num: number, from: number, to: number) {
  return from <= num && num < to;
}
