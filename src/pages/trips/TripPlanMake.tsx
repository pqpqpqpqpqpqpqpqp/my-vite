import { useState, useEffect } from "react";
import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
    version: 'weekly',
});

function TripPlanMake() {
    const [searchText, setSearchText] = useState('');
    const [results, setResults] = useState<google.maps.places.Place[]>([]);
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);

    useEffect(() => {
        if (!searchText) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(() => {
            async function handleSuggestion() {
                const { AutocompleteSuggestion } = await loader.importLibrary("places");

                const AutoComReq = {
                    input: searchText,
                };

                try {
                    const res = await AutocompleteSuggestion.fetchAutocompleteSuggestions(AutoComReq);
                    setSuggestions(res.suggestions || []);
                } catch (error) {
                    console.error("자동완성 제안 불러오기 실패:", error);
                    setSuggestions([]);
                }
            }

            handleSuggestion();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchText]);

    async function handleSearch() {
        const { Place } = await loader.importLibrary("places");

        const request = {
            textQuery: searchText,
            fields: [
                'displayName',
                'location',
                'businessStatus',
                'formattedAddress',
                'primaryType',
                'photos',
            ],
            maxResultCount: 10,
        };

        try {
            const response = await Place.searchByText(request);
            console.log(response);
            setResults(response.places || []);
            setSuggestions([]);
        } catch (error) {
            console.error("검색 중 오류 발생:", error);
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">일정 만들기</h1>
   
            <div className="relative">
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="장소 검색"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    검색
                </button>

                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-auto shadow-lg">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                                onClick={() => { setSearchText(suggestion.placePrediction?.mainText?.text || ''); setSuggestions([]); }}
                            >
                                {suggestion.placePrediction?.mainText?.text}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <hr className="my-6" />

            <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-700">검색 결과</h2>
                {results.length === 0 ? (
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                ) : (
                    <ul className="space-y-4 max-h-96 overflow-auto">
                        {results.map((place, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-center p-4 border rounded-md shadow-sm hover:shadow-md transition cursor-pointer"
                            >
                                <div className="flex items-center space-x-4">
                                    {place.photos && place.photos.length > 0 && place.displayName ? (
                                        <img
                                            src={place.photos[0].getURI({ maxWidth: 100, maxHeight: 100 })}
                                            alt={place.displayName}
                                            className="w-24 h-24 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-md text-gray-400">
                                            No Image
                                        </div>
                                    )}

                                    <div>
                                        <p className="font-medium text-gray-800">{place.displayName || '이름 없음'}</p>
                                        <p className="text-sm text-gray-500">
                                            {place.primaryType || '유형 정보 없음'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {place.formattedAddress || '주소 정보 없음'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            상태: {place.businessStatus || '정보 없음'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            좌표: {place.location?.lat().toFixed(4)}, {place.location?.lng().toFixed(4)}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                                    onClick={() => alert(`${place.displayName} 일정에 추가`)}
                                >
                                    추가
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default TripPlanMake;
