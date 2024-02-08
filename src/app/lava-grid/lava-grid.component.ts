import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, QueryList, ViewChild, ViewChildren, computed, input, signal } from '@angular/core';
import { NodeInfo, RouteInfo, getId, getParams } from './algo';
import { CommonModule } from '@angular/common';
interface Cell {
  rowNum: number;
  colNum: number;
  weight: number;
}

const directions = ['up', 'down', 'left', 'right'] as const;

type Direction = typeof directions[number];
const directionMap: { [p in Direction]: [number, number] } = {
  down: [1, 0],
  up: [-1, 0],
  left: [0, -1],
  right: [0, 1]
}
type Vector = [number, number];

@Component({
  selector: 'app-lava-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lava-grid.component.html',
  styleUrls: [`./lava-grid.component.css`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LavaGridComponent implements AfterViewInit {

  readonly legend = [
    { class: 'visited', label: 'Visited Nodes' },
    { class: 'surface', label: 'Current Queue' },
    { class: 'isCurrentNeighbor', label: 'Checking neighbor' },
    { class: 'isScannedNeighbor', label: 'Scanned neighbors' },
    { class: 'isCurrent', label: 'Element picked from queue' }
  ]

  @ViewChildren('lavaCell')
  cellEls!: QueryList<ElementRef<HTMLElement>>

  @ViewChild('wrapper')
  wrapperEl!: ElementRef<HTMLDivElement>;

  surface = input<Record<string, NodeInfo<RouteInfo>>>({});
  visited = input<Record<string, boolean>>({});
  currentNodeId = input<string>();
  scannedNeighbors = input<RouteInfo[]>([]);
  currentNeighbor = input<RouteInfo>();

  inputData = input<number[][]>([]);


  rowCols = computed(() => {
    return this.inputData().map((row, i) => row.map((weight, j) => {
      return {
        rowNum: i,
        colNum: j,
        weight: weight
      } satisfies Cell;
    }))
  })

  params = computed(() => {
    const grid = this.rowCols().map((row) => {
      return row.map(() => 42)
    })

    return getParams(grid);
  })

  readonly levels = [0, 1, 2];
  readonly directions = directions;

  ngAfterViewInit(): void {

    const res = this.cellEls.toArray().map(el => el.nativeElement);
    const cellsMap = res.reduce((acc, el) => {
      acc[el.id] = el;
      return acc;
    }, {} as Record<string, HTMLElement>);


    const rectWrapper = this.wrapperEl.nativeElement.getBoundingClientRect();

    const lines: Array<[Vector, Vector]> = [];
    for (const row of this.rowCols()) {

      for (const cell of row) {
        if (cell.colNum !== 1 || cell.rowNum !== 1) continue;
        for (const direction of directions) {
          for (const penalty of this.levels) {
            const startNode = {
              col: cell.colNum,
              row: cell.rowNum,
              direction: direction,
              penalty: penalty
            };
            const start = cellsMap[toId(startNode)];
            if (!start) {
              console.log(`Missing start! ${toId(startNode)}`, startNode)
              continue;
            }
            const neighbours = Array.from(this.params().getNeighbors(startNode));
            console.log('Found N neighbours: ', neighbours, 'of', startNode)
            for (const neighbour of neighbours) {

              console.log({ startNode, end: neighbour })
              const end = cellsMap[toId(neighbour)];
              if (!end) {
                console.log(`Missing end! ${toId(neighbour)}`, neighbour)

                continue;
              }
              lines.push(makeLine(start, end, rectWrapper))
            }
          }
        }
      }
    }
    setTimeout(() => {
      // this.lines = lines
    })
  }

  lines: Array<[Vector, Vector]> = [];

  getInfo(row: number, col: number, penalty: number, direction: Direction) {
    const id = toId({
      col: col,
      row: row,
      direction: direction,
      penalty: penalty
    });
    const cn = this.currentNeighbor()
    const result = {
      visited: this.visited()[id],
      surface: this.surface()[id],
      isCurrentNeighbor: cn && toId(cn) === id,
      isScannedNeighbor: this.scannedNeighbors().map(toId).some(x => x === id),
      isCurrent: this.currentNodeId() === id,

    }

    return result;
  }

}

function makeLine(element1: HTMLElement, element2: HTMLElement, relativeTo: DOMRect): [Vector, Vector] {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  return [
    [rect1.left + rect1.width / 2 - relativeTo.left, rect1.top + rect1.height / 2 - relativeTo.top],
    [rect2.left + rect2.width * 0.2 - relativeTo.left, rect2.top + rect2.height * 0.2 - relativeTo.top],

  ]
  // return [rect1, rect2].map(
  //   (r) => ([r.left + r.width / 2 - relativeTo.left, r.top + r.height / 2 - relativeTo.top])) as any

}

function toId(route: RouteInfo) {
  return getId(route);
}
