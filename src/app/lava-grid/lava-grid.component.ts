import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren, computed, input } from '@angular/core';
import { RouteInfo, getParams } from './algo';
import { CommonModule } from '@angular/common';
interface Cell {
  rowNum: number;
  colNum: number;
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
  styleUrls: [`./lava-grid.component.css`]
})
export class LavaGridComponent implements AfterViewInit {

  @ViewChildren('lavaCell')
  cellEls!: QueryList<ElementRef<HTMLElement>>

  @ViewChild('wrapper')
  wrapperEl!: ElementRef<HTMLDivElement>;

  rows = input<number>(0);
  cols = input<number>(0);

  rowCols = computed(() => {
    var result: Cell[][] = [];
    for (let i = 0; i < this.rows(); i++) {
      result.push([])
      for (let j = 0; j < this.cols(); j++) {
        result.at(-1)!.push({
          colNum: j,
          rowNum: i,
        })
      }
    }
    return result;
  })

  params = computed(() => {
    const grid = this.rowCols().map((row) => {
      return row.map(() => 42)
    })
    console.log('CALC grid', this.rowCols(), 'Grid:', grid)
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
    console.log(cellsMap);

    const rectWrapper = this.wrapperEl.nativeElement.getBoundingClientRect();

    const lines: Array<[Vector, Vector]> = [];
    for (const row of this.rowCols()) {
      for (const cell of row) {
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
            for (const neighbour of this.params().getNeighbors({
              data: startNode
            })) {
              const end = cellsMap[toId(neighbour.data)];
              if (!end) {
                console.log(`Missing end! ${toId(neighbour.data)}`, neighbour.data)

                continue;
              }
            }
          }
        }
      }
    }

    const allCells = this.rowCols()
      .flatMap(x => x.flatMap(y => y))
      .filter(cell => cell.colNum === 1 && cell.colNum === 1)
      .flatMap(cell => directions.map((dir) => {
        return this.levels.flatMap((level) => {
          return {
            col: cell.colNum,
            row: cell.rowNum,
            direction: dir,
            penalty: level
          }
        })
      }))
      .flatMap(x => x)
      .map((data) => {
        return {
          start: data,
          ends: Array.from(this.params().getNeighbors({
            data: data
          })).map(x => x.data)
        }
      });

    console.log(allCells)



    const element1 = res[0];
    const element2 = res[1];
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    // this.lines.push([rect1, rect2].map(
    //   (r) => ([r.left + r.width / 2 - rectWrapper.left, r.top + r.height / 2 - rectWrapper.top])) as any
    // )

    setTimeout(() => {
      allCells.forEach((cell) => {
        const element1 = cellsMap[toId(cell.start)];
        const rect1 = element1.getBoundingClientRect();

        cell.ends.forEach((end) => {
          const element2 = cellsMap[toId(end)];
          if (!element2) {
            console.log('Missing element', end);
            return
          }
          const rect2 = element2.getBoundingClientRect();
          this.lines.push([rect1, rect2].map(
            (r) => ([r.left + r.width / 2 - rectWrapper.left, r.top + r.height / 2 - rectWrapper.top])) as any
          )
        })
      })

    })
  }

  lines: Array<[Vector, Vector]> = [];

}

function makeLine(element1: HTMLElement, element2: HTMLElement, relativeTo: DOMRect) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  return [rect1, rect2].map(
    (r) => ([r.left + r.width / 2 - relativeTo.left, r.top + r.height / 2 - relativeTo.top])) as any

}

function toId(route: RouteInfo) {
  return `${route.row}_${route.col}_${route.penalty}_${route.direction}`;
}

function fromDirection(id: string): RouteInfo {
  const split = id.split('_');
  return {
    row: Number(split[0]),
    col: Number(split[1]),
    penalty: Number(split[2]),
    direction: split[3] as any
  }
}