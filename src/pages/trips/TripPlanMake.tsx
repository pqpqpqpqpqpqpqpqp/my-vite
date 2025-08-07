import { useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
    version: 'weekly',
});

function TripPlanMake() {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<google.maps.places.Place[]>([]);

    async function handleSearch() {
        const { Place } = await loader.importLibrary("places");

        const request = {
            textQuery: searchText,
            fields: ['displayName', 'location'], // 필수
        };

        try {
            const response = await Place.searchByText(request);
            setResults(response.places || []);
        } catch (error) {
            console.error("검색 중 오류 발생:", error);
        }
    }

    return (
        <>
            <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="검색어 입력"
            />
            <button onClick={handleSearch}>검색</button>

            <ul>
                {results.map((place, index) => (
                    <li key={index}>
                        {place.displayName || '이름 없음'} - {place.location?.lat()}, {place.location?.lng()}
                    </li>
                ))}
            </ul>
        </>
    );
}

export default TripPlanMake;