import { useState } from 'react';

function TripPlanMake() {
    const [searchText, setSearchText] = useState('');

    const handleSearch = async () => {
        if (!searchText.trim()) return;

        try {
            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
                    'X-Goog-FieldMask': '*',
                },
                body: JSON.stringify({
                    textQuery: searchText,
                }),
            });

            if (!response.ok) {
                console.error('API 요청 실패', await response.text());
                return;
            }

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="검색어 입력"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
            <button onClick={handleSearch}>검색</button>
        </div>
    );
}

export default TripPlanMake;