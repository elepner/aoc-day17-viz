import { Component, computed, input } from '@angular/core';
interface Cell {
  rowNum: number;
  colNum: number;
}
@Component({
  selector: 'app-lava-grid',
  standalone: true,
  imports: [],
  templateUrl: './lava-grid.component.html',
  styleUrls: [`./lava-grid.component.css`]
})
export class LavaGridComponent {
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

  readonly levels = [0, 1, 2];
}
