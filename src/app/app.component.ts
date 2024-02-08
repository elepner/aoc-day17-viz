import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LavaGridComponent } from "./lava-grid/lava-grid.component";
import { DijkstraStep, NodeInfo, RouteInfo, dijsktra, getParams } from './lava-grid/algo';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
  {{surface | json}}
    <button (click)="nextStep()">Next step</button>
    Last step: {{lastStep() | json}}
    <app-lava-grid [inputData]="inputData" 
    [surface]="surface()"
    [visited]="visited()"
    [currentNodeId]="currentNodeId()"
    [scannedNeighbors]="scannedNeighbors()"
    [currentNeighbor]="currentNeighbor()" ></app-lava-grid>
    
    @for (item of surface() | keyvalue; track $index) {
      <div>
        {{item.key}}: {{item.value | json}}
      </div>
    }
  `,
  styles: [],
  imports: [RouterOutlet, LavaGridComponent, CommonModule]
})
export class AppComponent {
  title = 'day17-angular';
  // inputData = `
  // 2413432311323
  // 3215453535623
  // 3255245654254
  // 3446585845452
  // 4546657867536
  // 1438598798454
  // 4457876987766
  // 3637877979653
  // 4654967986887
  // 4564679986453
  // 1224686865563
  // 2546548887735
  // 4322674655533`.trim().split('\n').map(line => line.trim().split('').map(x => Number(x)));


  inputData = `
  241343
  321545
  `.trim().split('\n').map(line => line.trim().split('').map(x => Number(x)));

  inputParams = getParams(this.inputData);

  currentJob?: Generator<DijkstraStep<RouteInfo>>

  hasNext: boolean = false;

  surface = signal<Record<string, NodeInfo<RouteInfo>>>({});
  visited = signal<Record<string, boolean>>({});
  currentNodeId = signal<string>('');
  scannedNeighbors = signal<RouteInfo[]>([]);
  currentNeighbor = signal<RouteInfo | undefined>(undefined);

  lastStep = signal<DijkstraStep<RouteInfo> | null>(null);

  nextStep() {
    if (!this.currentJob) {
      this.currentJob = dijsktra(this.inputParams, {
        col: 0,
        row: 0,
        direction: 'left',
        penalty: 0
      })
    }
    var step = this.currentJob.next();
    console.log('Processing step', step.value);
    this.processStep(step.value);
    this.hasNext = !step.done;
  }

  processStep(step: DijkstraStep<RouteInfo>) {
    this.lastStep.set(step);
    if (step.type === 'surface-updated') {
      this.surface.set({
        ...step.surface
      })
    }
    else if (step.type === 'current-updated') {
      this.currentNodeId.set(step.currentId)
    }
    else if (step.type === 'neighbors-scanned') {
      this.scannedNeighbors.set(step.neighbors);
    }
    else if (step.type === 'neighbor-picked') {
      this.currentNeighbor.set(step.node);
    }
    else if (step.type === 'next-neighbor') {
      this.currentNeighbor.set(undefined);
    }
    else if (step.type === 'visited-updated') {
      this.visited.set({
        ...step.visited
      })
    }
  }

}
