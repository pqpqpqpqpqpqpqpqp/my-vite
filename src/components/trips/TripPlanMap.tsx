import { useEffect, useRef } from "react";
import { Map as GoogleMap, Marker, useMap, ControlPosition } from "@vis.gl/react-google-maps";
import type { TripPlanMapProps } from "../../types/trip";

export default function TripPlanMap({
    selectedDayTrips,
    focusedPlace,
    setFocusedPlace
}: TripPlanMapProps) {

    const map = useMap();
    const polylineRef = useRef<google.maps.Polyline | null>(null);

    useEffect(() => {
        if (!map) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        const path = selectedDayTrips.map(place => ({
            lat: place.placeLat,
            lng: place.placeLng
        }));

        const lineSymbol = {
            path: "M 0,-1 0,1",
            strokeOpacity: 1,
            scale: 4,
        };

        const polyline = new google.maps.Polyline({
            path,
            strokeColor: "#EF4444",
            strokeOpacity: 0,
            strokeWeight: 4,
            icons: [{
                icon: lineSymbol,
                offset: "0",
                repeat: "20px",
            }],
        });

        polyline.setMap(map);
        polylineRef.current = polyline;

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
    }, [map, selectedDayTrips]);

    useEffect(() => {
        map?.panTo({
            lat: focusedPlace.placeLat,
            lng: focusedPlace.placeLng
        })
    }, [focusedPlace, map])

    return (
        <GoogleMap
            defaultCenter={{ lat: selectedDayTrips[0].placeLat, lng: selectedDayTrips[0].placeLng }}
            defaultZoom={15}
            disableDefaultUI
            zoomControl={true}
            zoomControlOptions={{
                position: ControlPosition.RIGHT_TOP
            }}
        >
            {selectedDayTrips.map((place, index) => (
                <Marker
                    key={index}
                    position={{ lat: place.placeLat, lng: place.placeLng }}
                    title={place.placeName}
                    label={{
                        text: `${place.orderInDay}`,
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold',
                    }}
                    icon={{
                        path: "M 0,0 m -8,0 a 8,8 0 1,0 16,0 a 8,8 0 1,0 -16,0",
                        scale: 1.5,
                        fillColor: "#EF4444", // 레드
                        fillOpacity: 1,
                        strokeColor: "#FCA5A5", // 연한 핑크 테두리
                        strokeWeight: 2,
                    }}
                    onClick={() => setFocusedPlace(place)}
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
};