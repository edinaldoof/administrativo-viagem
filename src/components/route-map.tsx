
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';
import { useTheme } from 'next-themes';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};

// Estilos para o modo escuro do mapa
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

interface RouteMapProps {
  origin: string;
  destination: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ origin, destination }) => {
  const { theme } = useTheme();
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const directionsServiceOptions = useMemo<google.maps.DirectionsRequest>(() => ({
    origin,
    destination,
    travelMode: google.maps.TravelMode.DRIVING,
  }), [origin, destination]);

  const directionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === google.maps.DirectionsStatus.OK && result) {
      setDirections(result);
      setError(null);
    } else {
      console.error(`Directions request failed due to ${status}`);
      setError(`Não foi possível encontrar a rota. Verifique os locais de origem e destino.`);
    }
  };

  if (loadError) {
    return <div className="p-4 text-destructive">Erro ao carregar o mapa. Verifique a chave da API.</div>;
  }

  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <div style={containerStyle}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        zoom={3}
        center={{ lat: 0, lng: 0 }} // O zoom e centro serão ajustados pelo DirectionsRenderer
        options={{...mapOptions, styles: theme === 'dark' ? darkMapStyle : []}}
      >
        {!directions && (
          <DirectionsService
            options={directionsServiceOptions}
            callback={directionsCallback}
          />
        )}
        
        {directions && (
          <DirectionsRenderer
            options={{
              directions,
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: theme === 'dark' ? '#f3d19c' : '#1a73e8',
                strokeWeight: 5,
              }
            }}
          />
        )}
      </GoogleMap>
      {error && <div className="absolute bottom-2 left-2 bg-background/80 p-2 rounded-md text-sm text-destructive">{error}</div>}
    </div>
  );
};

export default RouteMap;
