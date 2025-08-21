import { useEffect, useRef } from "react";
import { Map as GoogleMap, Marker, useMap, ControlPosition, InfoWindow } from "@vis.gl/react-google-maps";
import type { TripPlanMapProps } from "../../types/trip";

export default function TripPlanMap({
    tripDetailDataGroupingDay,
    selectedDay,
    focusedPlace,
    setFocusedPlace
}: TripPlanMapProps) {
    const map = useMap();
    const polylineRef = useRef<google.maps.Polyline | null>(null);

    const tripDetailDataSelectedDay = tripDetailDataGroupingDay.get(selectedDay);

    useEffect(() => {
        if (!map) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        const path = tripDetailDataSelectedDay?.map(place => ({
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
    }, [map, tripDetailDataSelectedDay]);

    useEffect(() => {
        if (!focusedPlace || !map) return;

        map?.panTo({
            lat: focusedPlace.placeLat,
            lng: focusedPlace.placeLng
        });
    }, [focusedPlace, map]);

    return (
        <GoogleMap
            defaultCenter={{
                lat: tripDetailDataSelectedDay?.[0]?.placeLat ?? 40.7580,
                lng: tripDetailDataSelectedDay?.[0]?.placeLng ?? -73.9855,
            }}
            defaultZoom={15}
            disableDefaultUI
            zoomControl
            zoomControlOptions={{
                position: ControlPosition.RIGHT_TOP
            }}
        >
            {tripDetailDataSelectedDay?.map((place, index) => (
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
                        fillColor: "#EF4444",
                        fillOpacity: 1,
                        strokeColor: "#FCA5A5",
                        strokeWeight: 2,
                    }}
                    onClick={() => setFocusedPlace(place)}
                />
            ))}

            {focusedPlace && (
                <InfoWindow
                    position={{ lat: focusedPlace.placeLat, lng: focusedPlace.placeLng }}
                    headerContent={<div className="font-semibold text-base">{focusedPlace.placeName}</div>}
                >
                    <div className="text-sm font-medium text-gray-600">
                        {focusedPlace.placeMemo || '메모가 없습니다.'}
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
}
