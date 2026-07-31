import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { url } from '../../config';
import { ThemeService } from '../../service/theme.service';
import { RouteTrackingService, TrackingState } from '../../service/route-tracking.service';
import * as L from 'leaflet';

export interface RouteStop {
  name: string;
  locationName: string;
  lat: number;
  lng: number;
  timeOffset: string;
  type: string;
}

export interface RouteMapData {
  routeName: string;
  departure: { name: string; lat: number; lng: number; label: string };
  arrival: { name: string; lat: number; lng: number; label: string };
  distanceKm: number;
  durationFormatted: string;
  totalStops: number;
  stops: RouteStop[];
  polyline: [number, number][];
  busDetails: {
    operatorName: string;
    busType: string;
    rating: number | string;
  };
}

@Component({
  selector: 'app-route-details',
  standalone: false,
  templateUrl: './route-details.html',
  styleUrl: './route-details.css',
})
export class RouteDetails implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  departure: string = 'Delhi';
  arrival: string = 'Jaipur';
  busId: string = '';
  date: string = '';

  mapData: RouteMapData | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  isDevMode: boolean = true;

  trackingState: TrackingState | null = null;
  private trackingSub?: Subscription;

  private map: L.Map | null = null;
  private polylineLayer: L.Polyline | null = null;
  private markersLayer: L.LayerGroup = L.layerGroup();
  private liveBusMarker: L.Marker | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    public themeService: ThemeService,
    public trackingService: RouteTrackingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.departure = params['depart'] || params['departure'] || 'Delhi';
      this.arrival = params['arrival'] || 'Jaipur';
      this.busId = params['busId'] || '';
      this.date = params['date'] || '';

      this.fetchRouteData();
    });

    this.trackingSub = this.trackingService.state$.subscribe((state) => {
      this.trackingState = state;
      if (this.liveBusMarker && state.currentLat && state.currentLng) {
        this.liveBusMarker.setLatLng([state.currentLat, state.currentLng]);
        this.liveBusMarker.setPopupContent(`
          <div class="p-1">
            <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">Live Bus Position</span>
            <h4 class="font-extrabold text-slate-900 text-sm mt-1">${this.mapData?.busDetails?.operatorName || 'Tedbus Express'}</h4>
            <p class="text-xs text-slate-600 mt-0.5">${state.currentStopName}</p>
            <p class="text-xs text-slate-500 font-semibold mt-0.5">Speed: ${state.speedKmH} km/h • ${state.coveredKm} / ${state.totalKm} km</p>
          </div>
        `);
      }
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    if (this.mapData && !this.isLoading) {
      this.initLeafletMap();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  ngOnDestroy(): void {
    if (this.trackingSub) {
      this.trackingSub.unsubscribe();
    }
    this.trackingService.stopSimulation();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  fetchRouteData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const apiUrl = `${url}routes/map-details/${encodeURIComponent(this.departure)}/${encodeURIComponent(this.arrival)}${this.busId ? '?busId=' + this.busId : ''}`;

    this.http.get<RouteMapData>(apiUrl).subscribe({
      next: (data) => {
        this.mapData = data;
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initLeafletMap(), 100);
      },
      error: (err) => {
        console.error('Error loading route map data:', err);
        this.mapData = this.getFallbackRouteData(this.departure, this.arrival);
        this.isLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initLeafletMap(), 100);
      },
    });
  }

  private initLeafletMap(): void {
    if (!this.mapData || !this.mapContainer) return;

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const containerEl = this.mapContainer.nativeElement;
    const depLat = this.mapData.departure.lat;
    const depLng = this.mapData.departure.lng;

    this.map = L.map(containerEl, {
      center: [depLat, depLng],
      zoom: 7,
      zoomControl: true,
    });

    // Free OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    this.markersLayer.clearLayers();

    // Source Marker (Green Pin)
    const sourceIcon = L.divIcon({
      className: 'custom-leaflet-marker source-marker',
      html: `<div class="marker-badge bg-emerald-500 text-white shadow-lg flex items-center justify-center rounded-full p-1.5 border-2 border-white w-9 h-9">
              <span class="material-icons text-lg">trip_origin</span>
            </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const sourceMarker = L.marker([depLat, depLng], { icon: sourceIcon })
      .bindPopup(`
        <div class="p-1">
          <span class="text-xs font-bold uppercase tracking-wider text-emerald-600">Starting Point</span>
          <h4 class="font-extrabold text-slate-900 text-sm mt-0.5">${this.mapData.departure.name}</h4>
          <p class="text-xs text-slate-600 mt-1">${this.mapData.departure.label}</p>
        </div>
      `);
    this.markersLayer.addLayer(sourceMarker);

    // Destination Marker (Red Pin)
    const destLat = this.mapData.arrival.lat;
    const destLng = this.mapData.arrival.lng;
    const destIcon = L.divIcon({
      className: 'custom-leaflet-marker dest-marker',
      html: `<div class="marker-badge bg-red-500 text-white shadow-lg flex items-center justify-center rounded-full p-1.5 border-2 border-white w-9 h-9">
              <span class="material-icons text-lg">place</span>
            </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const destMarker = L.marker([destLat, destLng], { icon: destIcon })
      .bindPopup(`
        <div class="p-1">
          <span class="text-xs font-bold uppercase tracking-wider text-red-600">Destination</span>
          <h4 class="font-extrabold text-slate-900 text-sm mt-0.5">${this.mapData.arrival.name}</h4>
          <p class="text-xs text-slate-600 mt-1">${this.mapData.arrival.label}</p>
        </div>
      `);
    this.markersLayer.addLayer(destMarker);

    // Intermediate Stop Markers
    if (this.mapData.stops && this.mapData.stops.length > 0) {
      this.mapData.stops.forEach((stop, index) => {
        const isRest = stop.type === 'rest';
        const stopIcon = L.divIcon({
          className: 'custom-leaflet-marker stop-marker',
          html: `<div class="marker-badge ${isRest ? 'bg-amber-500' : 'bg-indigo-600'} text-white shadow-md flex items-center justify-center rounded-full border-2 border-white w-7 h-7">
                  <span class="text-xs font-bold">${index + 1}</span>
                </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const stopMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .bindPopup(`
            <div class="p-1">
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${isRest ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'}">
                  ${isRest ? 'Rest Stop' : 'En-Route Stop'}
                </span>
                <span class="text-xs text-slate-500 font-semibold">${stop.timeOffset}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm">${stop.name}</h4>
              <p class="text-xs text-slate-600 mt-0.5">${stop.locationName}</p>
            </div>
          `);
        this.markersLayer.addLayer(stopMarker);
      });
    }

    // Polyline Route Line
    if (this.mapData.polyline && this.mapData.polyline.length > 0) {
      this.polylineLayer = L.polyline(this.mapData.polyline, {
        color: '#ef4444',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '1, 2'
      }).addTo(this.map);

      this.map.fitBounds(this.polylineLayer.getBounds(), {
        padding: [50, 50],
      });
    }

    // Live Bus Marker Animation Icon
    const liveBusIcon = L.divIcon({
      className: 'custom-leaflet-marker live-bus-marker',
      html: `<div class="relative flex items-center justify-center">
              <div class="absolute -inset-2 rounded-full bg-red-500/30 animate-ping"></div>
              <div class="relative bg-red-600 text-white shadow-2xl flex items-center justify-center rounded-full p-2 border-2 border-white w-10 h-10 transition-all duration-300 ease-linear">
                <span class="material-icons text-xl">directions_bus</span>
              </div>
            </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    this.liveBusMarker = L.marker([depLat, depLng], { icon: liveBusIcon, zIndexOffset: 1000 })
      .bindPopup(`
        <div class="p-1">
          <span class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">Live Bus Position</span>
          <h4 class="font-extrabold text-slate-900 text-sm mt-1">${this.mapData.busDetails.operatorName}</h4>
          <p class="text-xs text-slate-600 mt-0.5">Speed: 62 km/h • Status: On Time</p>
        </div>
      `);
    this.markersLayer.addLayer(this.liveBusMarker);

    // Initialize & auto-start distance-based tracking simulation
    this.trackingService.initializeSimulation(
      this.mapData.polyline,
      this.mapData.stops,
      this.mapData.distanceKm,
      this.mapData.departure.name,
      this.mapData.arrival.name
    );
    this.trackingService.startSimulation();

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 150);
  }

  toggleTrackingPlayPause(): void {
    if (this.trackingState?.isPlaying) {
      this.trackingService.pauseSimulation();
    } else {
      this.trackingService.startSimulation();
    }
  }

  resetTracking(): void {
    this.trackingService.resetSimulation();
  }

  goBack(): void {
    if (this.departure && this.arrival && this.date) {
      this.router.navigate(['/select-bus'], {
        queryParams: { depart: this.departure, arrival: this.arrival, date: this.date }
      });
    } else {
      this.router.navigate(['/select-bus']);
    }
  }

  private getFallbackRouteData(dep: string, arr: string): RouteMapData {
    return {
      routeName: `${dep} to ${arr}`,
      departure: { name: dep || 'Delhi', lat: 28.6139, lng: 77.2090, label: `${dep || 'Delhi'} Central ISBT` },
      arrival: { name: arr || 'Jaipur', lat: 26.9124, lng: 75.7873, label: `${arr || 'Jaipur'} Main Stand` },
      distanceKm: 270,
      durationFormatted: '5 hrs 30 mins',
      totalStops: 4,
      stops: [
        { name: 'Gurgaon', locationName: 'IFFCO Chowk', lat: 28.4595, lng: 77.0266, timeOffset: '+1.0 hr', type: 'pickup' },
        { name: 'Dharuhera', locationName: 'Flyover Junction', lat: 28.2056, lng: 76.7946, timeOffset: '+1.8 hrs', type: 'stopover' },
        { name: 'Neemrana', locationName: 'Midway Rest Plaza', lat: 27.9890, lng: 76.3812, timeOffset: '+2.5 hrs', type: 'rest' },
        { name: 'Kotputli', locationName: 'Bypass Stand', lat: 27.7027, lng: 76.2023, timeOffset: '+3.5 hrs', type: 'stopover' }
      ],
      polyline: [
        [28.6139, 77.2090],
        [28.4595, 77.0266],
        [28.2056, 76.7946],
        [27.9890, 76.3812],
        [27.7027, 76.2023],
        [26.9124, 75.7873]
      ],
      busDetails: {
        operatorName: 'Tedbus Express Partner',
        busType: 'A/C Sleeper (2+1)',
        rating: 4.8
      }
    };
  }
}
