import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';

export interface TrackingState {
  progressPercentage: number;
  currentLat: number;
  currentLng: number;
  currentStopIndex: number; // 0..N-1 for intermediate stops, N for destination
  currentStopName: string;
  nextStopName: string;
  previousStopName: string;
  coveredKm: number;
  remainingKm: number;
  totalKm: number;
  speedKmH: number;
  status: string;
  lastUpdatedSec: number;
  isPlaying: boolean;
  stopStatuses: { [key: number]: 'completed' | 'current' | 'upcoming' };
  stopETAs: { [key: number]: string };
  isArrived: boolean;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

@Injectable({
  providedIn: 'root'
})
export class RouteTrackingService {
  private stateSubject = new BehaviorSubject<TrackingState>({
    progressPercentage: 0,
    currentLat: 0,
    currentLng: 0,
    currentStopIndex: 0,
    currentStopName: '',
    nextStopName: '',
    previousStopName: '',
    coveredKm: 0,
    remainingKm: 0,
    totalKm: 0,
    speedKmH: 62,
    status: 'On Time',
    lastUpdatedSec: 0,
    isPlaying: false,
    stopStatuses: {},
    stopETAs: {},
    isArrived: false
  });

  public state$: Observable<TrackingState> = this.stateSubject.asObservable();

  private currentPositionSubject = new BehaviorSubject<[number, number]>([0, 0]);
  public currentPosition$: Observable<[number, number]> = this.currentPositionSubject.asObservable();

  private currentStopSubject = new BehaviorSubject<string>('');
  public currentStop$: Observable<string> = this.currentStopSubject.asObservable();

  private nextStopSubject = new BehaviorSubject<string>('');
  public nextStop$: Observable<string> = this.nextStopSubject.asObservable();

  private completedStopsSubject = new BehaviorSubject<string[]>([]);
  public completedStops$: Observable<string[]> = this.completedStopsSubject.asObservable();

  private remainingStopsSubject = new BehaviorSubject<string[]>([]);
  public remainingStops$: Observable<string[]> = this.remainingStopsSubject.asObservable();

  private journeyProgressSubject = new BehaviorSubject<number>(0);
  public journeyProgress$: Observable<number> = this.journeyProgressSubject.asObservable();

  private coveredDistanceSubject = new BehaviorSubject<number>(0);
  public coveredDistance$: Observable<number> = this.coveredDistanceSubject.asObservable();

  private remainingDistanceSubject = new BehaviorSubject<number>(0);
  public remainingDistance$: Observable<number> = this.remainingDistanceSubject.asObservable();

  private etaSubject = new BehaviorSubject<string>('');
  public eta$: Observable<string> = this.etaSubject.asObservable();

  private timerSub?: Subscription;

  private polylinePoints: [number, number][] = [];
  private cumulativeKm: number[] = [];
  private totalKm: number = 200;
  private currentTravelledKm: number = 0;

  private stops: any[] = [];
  private stopCumulativeKm: number[] = [];
  private departureName: string = 'Delhi';
  private arrivalName: string = 'Jaipur';
  private speedTimerCount: number = 0;

  initializeSimulation(
    polyline: [number, number][],
    stops: any[],
    totalKm: number,
    departureName: string,
    arrivalName: string
  ): void {
    this.stopSimulation();
    this.polylinePoints = polyline || [];
    this.stops = stops || [];
    this.departureName = departureName || 'Delhi';
    this.arrivalName = arrivalName || 'Jaipur';
    this.currentTravelledKm = 0;

    // 1. Precompute cumulative distance along polyline
    this.cumulativeKm = [0];
    if (this.polylinePoints.length > 1) {
      for (let i = 0; i < this.polylinePoints.length - 1; i++) {
        const p1 = this.polylinePoints[i];
        const p2 = this.polylinePoints[i + 1];
        const segDist = haversineKm(p1[0], p1[1], p2[0], p2[1]);
        this.cumulativeKm.push(this.cumulativeKm[i] + segDist);
      }
    }

    const calculatedDist = this.cumulativeKm[this.cumulativeKm.length - 1] || 1;
    this.totalKm = totalKm > 0 ? totalKm : Math.round(calculatedDist);

    // Scale cumulativeKm array so last element equals totalKm
    const scaleFactor = this.totalKm / calculatedDist;
    this.cumulativeKm = this.cumulativeKm.map(d => d * scaleFactor);

    // 2. Map stops to cumulative distances along polyline
    this.stopCumulativeKm = [];
    this.stops.forEach((stop) => {
      let closestIdx = 0;
      let minDistance = Infinity;
      this.polylinePoints.forEach((p, idx) => {
        const d = haversineKm(stop.lat, stop.lng, p[0], p[1]);
        if (d < minDistance) {
          minDistance = d;
          closestIdx = idx;
        }
      });
      this.stopCumulativeKm.push(this.cumulativeKm[closestIdx] || 0);
    });

    // 3. Emit initial state
    this.updateTrackingState();
  }

  startSimulation(): void {
    if (this.stateSubject.value.isPlaying) return;

    // If already arrived, reset to start before playing again
    if (this.currentTravelledKm >= this.totalKm) {
      this.currentTravelledKm = 0;
    }

    this.stateSubject.next({
      ...this.stateSubject.value,
      isPlaying: true
    });

    this.timerSub = interval(200).subscribe(() => {
      this.stepSimulation();
    });
  }

  pauseSimulation(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }
    this.stateSubject.next({
      ...this.stateSubject.value,
      isPlaying: false
    });
  }

  resetSimulation(): void {
    this.pauseSimulation();
    this.currentTravelledKm = 0;
    this.updateTrackingState();
  }

  stopSimulation(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }
  }

  private stepSimulation(): void {
    if (this.totalKm <= 0 || !this.polylinePoints.length) return;

    // Advance distance smoothly
    const stepKm = 1.2;
    this.currentTravelledKm += stepKm;

    if (this.currentTravelledKm >= this.totalKm) {
      this.currentTravelledKm = this.totalKm;
      this.pauseSimulation();
    }

    this.updateTrackingState();
  }

  /**
   * Derives ALL tracking metrics (position, current stop, next stop, ETAs, progress, distances)
   * strictly from the current travelled distance along the polyline.
   */
  private updateTrackingState(): void {
    if (!this.polylinePoints.length) return;

    const currentTravelled = Math.min(this.totalKm, Math.max(0, this.currentTravelledKm));
    const isArrived = currentTravelled >= this.totalKm;

    // 1. Calculate continuous lat/lng on polyline with exact terminal snap
    let currentLat = this.polylinePoints[0][0];
    let currentLng = this.polylinePoints[0][1];

    if (isArrived) {
      // Snap marker directly to the final arrival coordinate!
      const lastPoint = this.polylinePoints[this.polylinePoints.length - 1];
      currentLat = lastPoint[0];
      currentLng = lastPoint[1];
    } else if (this.cumulativeKm.length > 1) {
      let segIdx = 0;
      for (let i = 0; i < this.cumulativeKm.length - 1; i++) {
        if (currentTravelled >= this.cumulativeKm[i] && currentTravelled <= this.cumulativeKm[i + 1]) {
          segIdx = i;
          break;
        }
        if (i === this.cumulativeKm.length - 2) {
          segIdx = i;
        }
      }

      const segStartDist = this.cumulativeKm[segIdx];
      const segEndDist = this.cumulativeKm[segIdx + 1] || (segStartDist + 0.001);
      const segLen = segEndDist - segStartDist;
      const t = segLen > 0 ? Math.min(1, Math.max(0, (currentTravelled - segStartDist) / segLen)) : 0;

      const p1 = this.polylinePoints[segIdx];
      const p2 = this.polylinePoints[segIdx + 1] || p1;

      currentLat = p1[0] + t * (p2[0] - p1[0]);
      currentLng = p1[1] + t * (p2[1] - p1[1]);
    }

    // 2. Distance Stats & Progress
    const progressPercentage = isArrived ? 100 : Math.min(99, Math.round((currentTravelled / this.totalKm) * 100));
    const coveredKm = isArrived ? this.totalKm : Math.round(currentTravelled);
    const remainingKm = isArrived ? 0 : Math.max(0, Math.round(this.totalKm - currentTravelled));

    // 3. Stop Detection & Timeline Synchronization
    const stopCount = this.stops.length;
    const stopStatuses: { [key: number]: 'completed' | 'current' | 'upcoming' } = {};
    const stopETAs: { [key: number]: string } = {};
    const completedNames: string[] = [this.departureName];
    const remainingNames: string[] = [];
    const now = new Date();

    if (isArrived) {
      // All intermediate stops completed!
      this.stops.forEach((stop, idx) => {
        stopStatuses[idx] = 'completed';
        stopETAs[idx] = 'Passed';
        completedNames.push(stop.name);
      });
      completedNames.push(this.arrivalName);

      const newState: TrackingState = {
        progressPercentage: 100,
        currentLat,
        currentLng,
        currentStopIndex: stopCount,
        currentStopName: this.arrivalName,
        nextStopName: 'None',
        previousStopName: this.stops[stopCount - 1]?.name || this.departureName,
        coveredKm: this.totalKm,
        remainingKm: 0,
        totalKm: this.totalKm,
        speedKmH: 0,
        status: 'Completed',
        lastUpdatedSec: 0,
        isPlaying: false,
        stopStatuses,
        stopETAs,
        isArrived: true
      };

      this.stateSubject.next(newState);
      this.currentPositionSubject.next([currentLat, currentLng]);
      this.currentStopSubject.next(this.arrivalName);
      this.nextStopSubject.next('None');
      this.completedStopsSubject.next(completedNames);
      this.remainingStopsSubject.next([]);
      this.journeyProgressSubject.next(100);
      this.coveredDistanceSubject.next(this.totalKm);
      this.remainingDistanceSubject.next(0);
      this.etaSubject.next('Arrived');
      return;
    }

    // On-journey state calculation:
    let currentStopIdx = 0;
    if (stopCount > 0) {
      if (currentTravelled < this.stopCumulativeKm[0]) {
        currentStopIdx = 0;
      } else {
        let foundIdx = stopCount - 1;
        for (let s = 0; s < stopCount - 1; s++) {
          if (currentTravelled >= this.stopCumulativeKm[s] && currentTravelled < this.stopCumulativeKm[s + 1]) {
            foundIdx = s + 1;
            break;
          }
        }
        currentStopIdx = foundIdx;
      }

      for (let j = 0; j < stopCount; j++) {
        if (j < currentStopIdx) {
          stopStatuses[j] = 'completed';
          completedNames.push(this.stops[j].name);
        } else if (j === currentStopIdx) {
          if (currentTravelled >= this.stopCumulativeKm[j] + 2.0 && j === stopCount - 1) {
            stopStatuses[j] = 'completed';
            completedNames.push(this.stops[j].name);
          } else {
            stopStatuses[j] = 'current';
            remainingNames.push(this.stops[j].name);
          }
        } else {
          stopStatuses[j] = 'upcoming';
          remainingNames.push(this.stops[j].name);
        }

        if (stopStatuses[j] === 'completed') {
          stopETAs[j] = 'Passed';
        } else if (stopStatuses[j] === 'current' && Math.abs(currentTravelled - this.stopCumulativeKm[j]) < 2.0) {
          stopETAs[j] = 'At Stop';
        } else {
          const remKmToStop = Math.max(0, this.stopCumulativeKm[j] - currentTravelled);
          const etaMinutes = Math.max(1, Math.round((remKmToStop / 62) * 60));
          const etaDate = new Date(now.getTime() + etaMinutes * 60000);
          const hours = etaDate.getHours();
          const mins = String(etaDate.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const formattedHour = hours % 12 || 12;
          stopETAs[j] = `ETA ${formattedHour}:${mins} ${ampm}`;
        }
      }
    }

    remainingNames.push(this.arrivalName);

    let currentStopName = `Departing ${this.departureName}`;
    let nextStopName = this.stops[0]?.name || this.arrivalName;
    let prevStopName = this.departureName;

    if (stopCount > 0) {
      if (stopStatuses[currentStopIdx] === 'current') {
        currentStopName = this.stops[currentStopIdx].name;
        nextStopName = this.stops[currentStopIdx + 1]?.name || this.arrivalName;
        prevStopName = currentStopIdx > 0 ? this.stops[currentStopIdx - 1].name : this.departureName;
      } else if (stopStatuses[stopCount - 1] === 'completed') {
        currentStopName = `Approaching ${this.arrivalName}`;
        nextStopName = this.arrivalName;
        prevStopName = this.stops[stopCount - 1].name;
      }
    }

    this.speedTimerCount = (this.speedTimerCount + 1) % 5;
    const speedKmH = 58 + ((coveredKm * 2 + this.speedTimerCount) % 11);

    const newState: TrackingState = {
      progressPercentage,
      currentLat,
      currentLng,
      currentStopIndex: currentStopIdx,
      currentStopName,
      nextStopName,
      previousStopName: prevStopName,
      coveredKm,
      remainingKm,
      totalKm: this.totalKm,
      speedKmH,
      status: 'On Time',
      lastUpdatedSec: 2,
      isPlaying: this.stateSubject.value.isPlaying,
      stopStatuses,
      stopETAs,
      isArrived: false
    };

    this.stateSubject.next(newState);
    this.currentPositionSubject.next([currentLat, currentLng]);
    this.currentStopSubject.next(currentStopName);
    this.nextStopSubject.next(nextStopName);
    this.completedStopsSubject.next(completedNames);
    this.remainingStopsSubject.next(remainingNames);
    this.journeyProgressSubject.next(progressPercentage);
    this.coveredDistanceSubject.next(coveredKm);
    this.remainingDistanceSubject.next(remainingKm);
    this.etaSubject.next(stopETAs[currentStopIdx] || 'On Schedule');
  }
}
