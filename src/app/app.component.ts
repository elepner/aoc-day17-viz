import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LavaGridComponent } from "./lava-grid/lava-grid.component";
import { DijkstraStep, NodeInfo, RouteInfo, dijsktra, getParams } from './lava-grid/algo';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <button>Next step</button>
    <app-lava-grid [inputData]="inputData"></app-lava-grid>
    <router-outlet />
  `,
  styles: [],
  imports: [RouterOutlet, LavaGridComponent]
})
export class AppComponent {
  title = 'day17-angular';
  inputData = `
  2413432311323
  3215453535623
  3255245654254
  3446585845452
  4546657867536
  1438598798454
  4457876987766
  3637877979653
  4654967986887
  4564679986453
  1224686865563
  2546548887735
  4322674655533`.trim().split('\n').map(line => line.trim().split('').map(x => Number(x)));

  inputParams = getParams(this.inputData);

  currentJob?: Generator<DijkstraStep<RouteInfo>>

  hasNext: boolean = false;

  surface: Record<string, NodeInfo<RouteInfo>> = {};
  visited: Record<string, boolean> = {};
  currentNodeId?: string;
  scannedNeighbors: RouteInfo[] = [];
  currentNeighbor?: RouteInfo;

  nextStep() {
    if (!this.currentJob) {
      this.currentJob = dijsktra(this.inputParams, {
        col: 0,
        row: 0,
        direction: 'up',
        penalty: 0
      })
    }
    var step = this.currentJob.next();
    this.hasNext = !step.done;
  }

  processStep(step: DijkstraStep<RouteInfo>) {
    if (step.type === 'surface-updated') {
      this.surface = {
        ...step.surface
      }
    }
    else if (step.type === 'current-updated') {
      this.currentNodeId = step.currentId
    }
    else if (step.type === 'neighbors-scanned') {
      this.scannedNeighbors = step.neighbors;
    }
    else if (step.type === 'neighbor-picked') {
      this.currentNeighbor = step.node;
    }
    else if (step.type === 'next-neighbor') {
      this.currentNeighbor = undefined;
    }
    else if (step.type === 'visited-updated') {
      this.visited = {
        ...step.visited
      }
    }
  }

}
