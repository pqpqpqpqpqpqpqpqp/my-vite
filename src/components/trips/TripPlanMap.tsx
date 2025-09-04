import { useState, useEffect, useRef } from "react";
import { Map as GoogleMap, Marker, useMap, ControlPosition, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TripDTO, TripPlaceDTO } from "../../types/trip";
import { FaRegWindowClose } from "react-icons/fa";

interface TripPlanMapProps {
    trip: TripDTO | null;
    selectedDay: number;
    focusedPlace?: TripPlaceDTO;
    setFocusedPlace: (place?: TripPlaceDTO) => void;
}

interface PlaceDetail extends TripPlaceDTO {
    lat: number;
    lng: number;
    photoUrl?: string | null;
    formattedAddress?: string | null;
    rating?: number | null;
    userRatingCount?: number | null;
}

const PlaceInfoCard = ({ place, onClose }: { place: PlaceDetail, onClose: () => void }) => {
    return (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 flex gap-4 animate-slide-up z-10">
            {place.photoUrl && (
                <img src={place.photoUrl} alt={place.placeName} className="w-24 h-24 object-cover rounded-md" />
            )}
            <div className="flex-grow overflow-hidden">
                <h3 className="text-lg font-bold truncate">{place.placeName}</h3>
                {place.formattedAddress && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{place.formattedAddress}</p>
                )}
                {place.rating && (
                    <div className="flex items-center mt-2">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 font-semibold">{place.rating.toFixed(1)}</span>
                        {place.userRatingCount && (
                            <span className="ml-2 text-gray-500">({place.userRatingCount} reviews)</span>
                        )}
                    </div>
                )}
            </div>
            <button
                onClick={onClose}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 p-1 rounded-full transition-colors"
                aria-label="Close place details"
            >
                <FaRegWindowClose className="h-6 w-6" />
            </button>
        </div>
    );
};

export default function TripPlanMap({
    trip,
    selectedDay,
    focusedPlace,
    setFocusedPlace
}: TripPlanMapProps) {
    const map = useMap();
    const polylineRef = useRef<google.maps.Polyline | null>(null);
    const placesLib = useMapsLibrary('places');
    const [placesDetails, setPlacesDetails] = useState<PlaceDetail[]>([]);

    const tripDays = trip?.tripDays ?? [];

    const selectedTripDay = tripDays.find(day => day.dayOrder === selectedDay);
    const placesForSelectedDay = selectedTripDay?.tripPlaces ?? [];

    useEffect(() => {
        if (!placesLib || placesForSelectedDay.length === 0) {
            setPlacesDetails([]);
            return;
        }

        const fetchPlaceDetails = async () => {
            const detailPromises = placesForSelectedDay.map(async (place) => {
                try {
                    const placeResult = await new placesLib.Place({ id: place.placeId })
                        .fetchFields({ fields: ['location', 'rating', 'formattedAddress', 'photos', 'userRatingCount'] });

                    const details = placeResult.place;

                    if (details?.location) {
                        const photoUrl = details.photos?.[0]?.getURI({ maxWidth: 400, maxHeight: 400 });

                        return {
                            ...place,
                            lat: details.location.lat(),
                            lng: details.location.lng(),
                            photoUrl: photoUrl,
                            formattedAddress: details.formattedAddress,
                            rating: details.rating,
                            userRatingCount: details.userRatingCount,
                        };
                    }
                } catch (error) {
                    console.error(`Failed to fetch details for placeId ${place.placeId}:`, error);
                }
                return null;
            });

            const results = await Promise.all(detailPromises);

            const validDetails = results.filter((p) => p !== null);
            setPlacesDetails(validDetails);
        };

        fetchPlaceDetails();
    }, [placesLib, placesForSelectedDay]);

    useEffect(() => {
        if (!map) return;

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        if (placesForSelectedDay.length === 0) return;

        const path = placesDetails.map(place => ({
            lat: place.lat,
            lng: place.lng
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
            icons: [{ icon: lineSymbol, offset: "0", repeat: "20px" }],
        });

        polyline.setMap(map);
        polylineRef.current = polyline;

        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
    }, [map, placesDetails]);

    useEffect(() => {
        if (!focusedPlace || !map || placesDetails.length === 0) return;

        const focusedPlaceData = placesDetails.find(p => p.tripPlaceId === focusedPlace.tripPlaceId);

        if (focusedPlaceData) {
            map.panTo({
                lat: focusedPlaceData.lat,
                lng: focusedPlaceData.lng
            });
        }
    }, [focusedPlace, map, placesDetails]);

    const focusedPlaceData = focusedPlace
        ? placesDetails.find(p => p.tripPlaceId === focusedPlace.tripPlaceId)
        : undefined;

    return (
        <div className="w-full h-full relative">
            <GoogleMap
                defaultCenter={{
                    lat: placesDetails?.[0]?.lat ?? 37.5665,
                    lng: placesDetails?.[0]?.lng ?? 126.9780,
                }}
                defaultZoom={12}
                disableDefaultUI
                zoomControl
                zoomControlOptions={{ position: ControlPosition.RIGHT_TOP }}
                mapId="MY_TRIP_MAP_ID"
            >
                {placesDetails?.map((place) => (
                    <Marker
                        key={place.tripPlaceId}
                        position={{ lat: place.lat, lng: place.lng }}
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
            </GoogleMap>

            {focusedPlaceData && (
                <PlaceInfoCard
                    place={focusedPlaceData}
                    onClose={() => setFocusedPlace(undefined)}
                />
            )}
        </div>
    );
}