import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren, computed, input } from '@angular/core';
import { getParams } from './algo';
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
    return getParams(grid);
  })

  readonly levels = [0, 1, 2];
  readonly directions = directions;

  ngAfterViewInit(): void {

    const res = this.cellEls.toArray().map(el => el.nativeElement);
    console.log(res);

    let rectWrapper = this.wrapperEl.nativeElement.getBoundingClientRect();

    const element1 = res[0];
    const element2 = res[42];

    let rect1 = element1.getBoundingClientRect();
    let rect2 = element2.getBoundingClientRect();

    setTimeout(() => {
      this.lines.push([rect1, rect2].map(
        (r) => ([r.left + r.width / 2 - rectWrapper.left, r.top + r.height / 2 - rectWrapper.top])) as any
      )
    })
  }

  lines: Array<[Vector, Vector]> = [];

  makeOneSvg() {

  }
}
