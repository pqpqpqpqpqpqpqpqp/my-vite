import { useEffect } from 'react';
import { Map as GoogleMap, Marker, useMap } from '@vis.gl/react-google-maps';
import type { MapContainerProps } from '../types';

function MapContainer({
    selectedDayTrips,
    focusedPlace,
    defaultCenter,
}: MapContainerProps) {
    const map = useMap();

    useEffect(() => {
        console.log('map 로드', map);
    }, [map]);

    useEffect(() => {
        if(!selectedDayTrips) return;
        map?.panTo({ lat: selectedDayTrips[0].placeLat, lng: selectedDayTrips[0].placeLng });
    }, [map, selectedDayTrips]);

    useEffect(() => {
        map?.panTo({ lat: focusedPlace.placeLat, lng: focusedPlace.placeLng })
    }, [focusedPlace])

    return (
        <GoogleMap
            defaultCenter={defaultCenter}
            defaultZoom={15}
            disableDefaultUI
        >
            {selectedDayTrips?.map((place, index) => (
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
                    onClick={() => map?.panTo({ lat: place.placeLat, lng: place.placeLng })}
                />
            ))}
            {focusedPlace && (
                <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-2xl p-4 w-49/50 z-10 flex space-x-4">
                    <div className="w-18 h-24 flex-shrink-0 bg-amber-300 rounded-xl overflow-hidden">
                    </div>

                    <div className="flex flex-col">
                        <div className="text-xl font-semibold text-gray-900 mb-1">
                            {focusedPlace.placeName}
                        </div>
                        <div className="text-sm text-gray-600">
                            {focusedPlace.placeMemo || '메모가 없습니다.'}
                        </div>
                    </div>
                </div>
            )}
        </GoogleMap>
    );
}

export default MapContainer;