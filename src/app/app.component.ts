import { Component, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { LavaGridComponent } from "./lava-grid/lava-grid.component";
import { DijkstraStep, NodeInfo, RouteInfo, dijsktra, getParams } from './lava-grid/algo';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, filter, finalize, interval, takeUntil, takeWhile } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
  {{surface | json}}
    <button (click)="nextStep()">Next step</button>
    @if(!autoPlaySub) {
      <button (click)="autoPlay()">Auto</button>
    }
    @else {
      <button (click)="autoPlaySub.unsubscribe()">Cancel</button>
    }
    
    Last step: {{lastStep()?.type | json}}
    <app-lava-grid [inputData]="inputData" 
    [surface]="surface()"
    [visited]="visited()"
    [currentNodeId]="currentNodeId()"
    [scannedNeighbors]="scannedNeighbors()"
    [currentNeighbor]="currentNeighbor()" ></app-lava-grid>
    
    @for (item of sortedSurface(); track $index) {
      <div>
        {{item[0]}}: {{item[1] | json}}
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
  2413432311
  3215453535
  3255245654
  3446585845
  4546657867
  1438598798
`.trim().split('\n').map(line => line.trim().split('').map(x => Number(x)));


  // inputData = `
  // 241343
  // 321545
  // `.trim().split('\n').map(line => line.trim().split('').map(x => Number(x)));

  inputParams = getParams(this.inputData);

  currentJob?: Generator<DijkstraStep<RouteInfo>>

  hasNext = signal<boolean>(false);

  surface = signal<Record<string, NodeInfo<RouteInfo>>>({});

  sortedSurface = computed(() => {
    const eintries = Object.entries(this.surface()).sort((a, b) => {
      return a[1].currentCost - b[1].currentCost
    })
    return eintries;
  })

  visited = signal<Record<string, boolean>>({});
  currentNodeId = signal<string>('');
  scannedNeighbors = signal<RouteInfo[]>([]);
  currentNeighbor = signal<RouteInfo | undefined>(undefined);

  lastStep = signal<DijkstraStep<RouteInfo> | null>(null);

  autoPlaySub?: Subscription


  autoPlay() {
    this.autoPlaySub = interval(24).pipe(
      finalize(() => {
        this.autoPlaySub = undefined;
      })
    ).subscribe(() => {
      this.nextStep();
    });
  }

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
    this.hasNext.set(!step.done);
    if (step.done) {
      this.autoPlaySub?.unsubscribe();
    }
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
      });
    } else if (step.type === 'complete-cycle') {
      this.currentNeighbor.set(undefined)
      this.scannedNeighbors.set([]);;
    }
  }

}
