import { useEffect } from "react";
import type { MapPin } from "../models/map.pin.model";
import "leaflet/dist/leaflet.css";

interface MapLabels {
  details: string;
  navigation: string;
  legend: string;
  food: string;
  accommodation: string;
  activities: string;
  services: string;
  parking: string;
  resort: string;
}

interface MapComponentProps {
  pins: MapPin[];
  labels: MapLabels;
}

type PinCategory = "food" | "accommodation" | "activities" | "services";

const smetoviPin: MapPin = {
  type: "Spomenik",
  title: "Spomenik Smetovi",
  location: [44.24541, 17.96368],
  img: "/images/smetovi-spomenik.jpg",
};

const categoryIcons: Record<PinCategory, string> = {
  food: '<i class="fas fa-utensils" aria-hidden="true"></i>',
  accommodation: '<i class="fas fa-bed" aria-hidden="true"></i>',
  activities: '<i class="fas fa-hiking" aria-hidden="true"></i>',
  services: '<i class="fas fa-info" aria-hidden="true"></i>',
};

function getCategory(type: string): PinCategory {
  const normalizedType = type.toLocaleLowerCase();

  if (normalizedType.includes("restoran")) return "food";
  if (
    normalizedType.includes("dom") ||
    normalizedType.includes("villa") ||
    normalizedType.includes("kuća")
  ) {
    return "accommodation";
  }
  if (
    normalizedType.includes("park") ||
    normalizedType.includes("klub") ||
    normalizedType.includes("skijalište")
  ) {
    return "activities";
  }

  return "services";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function MapComponent({ pins, labels }: MapComponentProps) {
  useEffect(() => {
    let mapInstance: import("leaflet").Map | undefined;

    async function loadLeaflet() {
      if (typeof window === "undefined") return;

      const L = await import("leaflet");
      const mapElement = document.getElementById("map");

      if (!mapElement || mapElement.dataset.initialized === "true") return;
      mapElement.dataset.initialized = "true";

      mapInstance = L.map(mapElement, {
        center: [44.24541, 17.97368],
        zoom: 14,
        minZoom: 10,
        maxZoom: 18,
        maxBounds: [
          [43.907629, 17.272634],
          [44.552763, 18.600762],
        ],
        maxBoundsViscosity: 1,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstance);

      const makeIcon = (category: PinCategory) =>
        L.divIcon({
          html: `<span class="map-pin__shape">${categoryIcons[category]}</span>`,
          iconSize: [42, 46],
          iconAnchor: [21, 46],
          popupAnchor: [0, -44],
          className: `map-pin map-pin--${category}`,
        });

      const parkingIcon = L.divIcon({
        html: '<span class="map-pin__shape"><i class="fas fa-square-parking" aria-hidden="true"></i></span>',
        iconSize: [42, 46],
        iconAnchor: [21, 46],
        popupAnchor: [0, -44],
        className: "map-pin map-pin--parking",
      });

      const monumentIcon = L.icon({
        iconUrl: "/monument-icon.svg",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -38],
        className: "monument-icon",
      });

      const parkingCoords: L.LatLngExpression[] = [
        [44.242332, 17.973421],
        [44.242019, 17.973013],
        [44.242054, 17.973692],
        [44.241919, 17.974494],
        [44.2421, 17.975521],
        [44.242202, 17.975709],
        [44.242325, 17.975749],
        [44.242419, 17.975663],
        [44.242463, 17.975473],
      ];

      const parkingPopup = `
        <article class="map-popup">
          <img src="/images/parking.jpg" alt="${escapeHtml(labels.parking)}" />
          <div class="map-popup__body">
            <strong>${escapeHtml(labels.parking)}</strong>
          </div>
        </article>
      `;

      L.polygon(parkingCoords, {
        color: "#2563eb",
        weight: 2,
        fillColor: "#3b82f6",
        fillOpacity: 0.22,
      })
        .addTo(mapInstance)
        .bindPopup(parkingPopup);

      L.marker([44.242175, 17.974411], { icon: parkingIcon })
        .addTo(mapInstance)
        .bindPopup(parkingPopup);

      pins.forEach((pin) => {
        const title = escapeHtml(pin.title);
        const type = escapeHtml(pin.type);
        const path = pin.path ? escapeHtml(pin.path) : "";
        const mapUrl = pin.mapUrl ? escapeHtml(pin.mapUrl) : "";
        const image = escapeHtml(pin.img || "/smetovi-logo.png");

        const popupContent = `
          <article class="map-popup">
            <img src="${image}" alt="${title}" />
            <div class="map-popup__body">
              <span class="map-popup__type">${type}</span>
              <strong>${title}</strong>
              <div class="map-popup__actions">
                ${path ? `<a href="${path}">${escapeHtml(labels.details)}</a>` : ""}
                ${
                  mapUrl
                    ? `<a href="${mapUrl}" target="_blank" rel="noreferrer" class="map-popup__directions">${escapeHtml(labels.navigation)} <span aria-hidden="true">↗</span></a>`
                    : ""
                }
              </div>
            </div>
          </article>
        `;

        L.marker(pin.location, { icon: makeIcon(getCategory(pin.type)) })
          .addTo(mapInstance!)
          .bindPopup(popupContent);
      });

      L.marker(smetoviPin.location, { icon: monumentIcon })
        .addTo(mapInstance)
        .bindPopup(
          `
            <article class="map-popup">
              <img src="${smetoviPin.img}" alt="${escapeHtml(labels.resort)}" />
              <div class="map-popup__body">
                <strong>${escapeHtml(labels.resort)}</strong>
              </div>
            </article>
          `
        );

      const markerBounds = L.latLngBounds([
        ...pins.map((pin) => pin.location),
        smetoviPin.location,
        [44.242175, 17.974411] as [number, number],
      ]);

      mapInstance.fitBounds(markerBounds, {
        paddingTopLeft: [40, 110],
        paddingBottomRight: [40, 70],
        maxZoom: 15,
        animate: false,
      });
      mapInstance.setZoom(16, { animate: false });
    }

    loadLeaflet();

    return () => {
      mapInstance?.remove();
      const mapElement = document.getElementById("map");
      delete mapElement?.dataset.initialized;
    };
  }, [labels, pins]);

  const legendItems: Array<{
    category: PinCategory | "parking";
    label: string;
  }> = [
    { category: "food", label: labels.food },
    { category: "accommodation", label: labels.accommodation },
    { category: "activities", label: labels.activities },
    { category: "services", label: labels.services },
    { category: "parking", label: labels.parking },
  ];

  return (
    <div className="map-shell">
      <div id="map" className="map-canvas" />

      <aside className="map-legend" aria-label={labels.legend}>
        <strong>{labels.legend}</strong>
        <ul>
          {legendItems.map((item) => (
            <li key={item.category}>
              <span
                className={`map-legend__symbol map-legend__symbol--${item.category}`}
                aria-hidden="true"
              />
              {item.label}
            </li>
          ))}
        </ul>
      </aside>

      <style>
        {`
          .map-shell,
          .map-canvas {
            width: 100%;
            height: 100vh;
            min-height: 520px;
          }

          .map-shell {
            position: relative;
            font-family: "Atkinson", sans-serif;
          }

          .leaflet-top {
            margin-top: 72px;
          }

          .leaflet-popup-content {
            width: 240px !important;
            margin: 0 !important;
          }

          .leaflet-popup-content-wrapper {
            overflow: hidden;
            padding: 0 !important;
            border-radius: 12px !important;
          }

          .leaflet-popup-close-button {
            top: 6px !important;
            right: 6px !important;
            width: 28px !important;
            height: 28px !important;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.92) !important;
            color: #082f49 !important;
            font-size: 22px !important;
            line-height: 25px !important;
          }

          .map-popup img {
            display: block;
            width: 100%;
            height: 130px;
            object-fit: cover;
          }

          .map-popup__body {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 14px;
            text-align: left;
          }

          .map-popup__type {
            margin-bottom: 3px;
            color: #d65c13;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .map-popup strong {
            color: #082f49;
            font-family: "Exo2", sans-serif;
            font-size: 16px;
            line-height: 1.3;
          }

          .map-popup__actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px;
            width: 100%;
            margin-top: 12px;
          }

          .map-popup__actions a {
            border-radius: 6px;
            background: #082f49;
            padding: 7px 8px;
            color: white !important;
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            text-decoration: none;
          }

          .map-popup__actions .map-popup__directions {
            background: #ea580c;
          }

          .map-pin {
            display: block !important;
            border: 0 !important;
            background: transparent !important;
          }

          .map-pin__shape {
            display: grid !important;
            width: 36px;
            height: 36px;
            place-items: center;
            border: 3px solid white !important;
            border-radius: 50% 50% 50% 0;
            box-shadow: 0 3px 9px rgba(15, 23, 42, 0.32);
            color: white;
            font-size: 15px;
            transform: rotate(-45deg);
          }

          .map-pin__shape i {
            transform: rotate(45deg);
          }

          .map-pin--food .map-pin__shape {
            background: #ea580c;
          }

          .map-pin--accommodation .map-pin__shape {
            background: #7c3aed;
          }

          .map-pin--activities .map-pin__shape {
            background: #16835f;
          }

          .map-pin--services .map-pin__shape {
            background: #0369a1;
          }

          .map-pin--parking .map-pin__shape {
            background: #2563eb;
          }

          .map-legend {
            position: absolute;
            z-index: 500;
            bottom: 24px;
            left: 16px;
            max-width: 230px;
            border: 1px solid rgba(8, 47, 73, 0.12);
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.94);
            padding: 12px 14px;
            color: #334a55;
            box-shadow: 0 8px 24px rgba(8, 47, 73, 0.16);
            backdrop-filter: blur(8px);
          }

          .map-legend > strong {
            color: #082f49;
            font-family: "Exo2", sans-serif;
            font-size: 14px;
          }

          .map-legend ul {
            display: grid;
            gap: 5px;
            margin: 8px 0 0;
            padding: 0;
            list-style: none;
          }

          .map-legend li {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            line-height: 1.35;
          }

          .map-legend__symbol {
            flex: 0 0 10px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
          }

          .map-legend__symbol--food {
            background: #ea580c;
          }

          .map-legend__symbol--accommodation {
            background: #7c3aed;
          }

          .map-legend__symbol--activities {
            background: #16835f;
          }

          .map-legend__symbol--services {
            background: #0369a1;
          }

          .map-legend__symbol--parking {
            background: #2563eb;
          }

          @media (max-width: 640px) {
            .leaflet-top {
              margin-top: 68px;
            }

            .map-legend {
              right: 10px;
              bottom: 18px;
              left: 10px;
              display: flex;
              max-width: none;
              align-items: center;
              gap: 10px;
              overflow-x: auto;
              padding: 9px 11px;
              white-space: nowrap;
            }

            .map-legend > strong {
              display: none;
            }

            .map-legend ul {
              display: flex;
              gap: 12px;
              margin: 0;
            }

            .map-legend li {
              flex: 0 0 auto;
            }

            .leaflet-popup-content {
              width: min(230px, calc(100vw - 54px)) !important;
            }
          }
        `}
      </style>
    </div>
  );
}
