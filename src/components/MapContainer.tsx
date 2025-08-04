import { useEffect } from 'react';
import { Map as GoogleMap, Marker, useMap } from '@vis.gl/react-google-maps';
import type { TripDetail } from '../pages/ScheduleMap';

interface MapContainerProps {
    selectedDay: number;
    tripGroupByOrder: Map<number, TripDetail[]>;
    defaultCenter: { lat: number; lng: number };
}

function MapContainer({
    selectedDay,
    tripGroupByOrder,
    defaultCenter,
}: MapContainerProps) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const firstPlace = tripGroupByOrder.get(selectedDay)?.[0];
        if (firstPlace) {
            map.panTo({ lat: firstPlace.placeLat, lng: firstPlace.placeLng });
        }
    }, [map, selectedDay]);

    return (
        <GoogleMap
            defaultCenter={defaultCenter}
            defaultZoom={15}
            disableDefaultUI
        >
            {tripGroupByOrder.get(selectedDay)?.map((place, index) => (
                <Marker
                    key={index}
                    position={{ lat: place.placeLat, lng: place.placeLng }}
                    title={place.placeName}
                    label={{
                        text: `${place.orderInDay}`,
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                    }}
                    icon={{
                        path: "M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 8,0 -16,0",
                        scale: 1,
                        fillColor: '#0000FF',
                        fillOpacity: 1,
                    }}
                />
            ))}
        </GoogleMap>
    );
}

export default MapContainer;