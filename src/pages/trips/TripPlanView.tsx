import { useState, useEffect } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import TripPlanSidebar from '../../components/trips/TripPlanSidebar';
import TripPlanMap from '../../components/trips/TripPlanMap';
import type { TripDetail } from '../../types/trip';

const tripData = {
    title: '서울 여행',
    startDate: '2023-10-01',
    endDate: '2023-10-05',
};

const tripDetailData: TripDetail[] = [
    {
        dayOrder: 1,
        placeName: "경복궁",
        placeLat: 37.5779,
        placeLng: 126.9769,
        orderInDay: 1,
        visitTime: "10:00",
        placeMemo: "경복궁은 조선 왕조의 주요 궁궐입니다.",
    },
    {
        dayOrder: 1,
        placeName: "북촌 한옥마을",
        placeLat: 37.5826,
        placeLng: 126.9839,
        orderInDay: 2,
        visitTime: "12:00",
        placeMemo: "전통 한옥이 잘 보존된 지역입니다.",
    },
    {
        dayOrder: 1,
        placeName: "인사동",
        placeLat: 37.5749,
        placeLng: 126.9882,
        orderInDay: 3,
        visitTime: "14:00",
        placeMemo: "한국 전통 문화와 예술을 체험할 수 있는 곳입니다.",
    },
    {
        dayOrder: 1,
        placeName: "남산타워",
        placeLat: 37.5512,
        placeLng: 126.9882,
        orderInDay: 4,
        visitTime: "16:00",
        placeMemo: "서울의 랜드마크로, 전망이 아름답습니다.",
    },
    {
        dayOrder: 1,
        placeName: "명동",
        placeLat: 37.5636,
        placeLng: 126.9850,
        orderInDay: 5,
        visitTime: "18:00",
        placeMemo: "쇼핑과 먹거리가 풍부한 지역입니다.",
    },
    {
        dayOrder: 2,
        placeName: "동대문 디자인 플라자",
        placeLat: 37.5663,
        placeLng: 127.0090,
        orderInDay: 1,
        visitTime: "10:00",
        placeMemo: "현대적인 건축물과 디자인을 감상할 수 있습니다.",
    },
    {
        dayOrder: 2,
        placeName: "청계천",
        placeLat: 37.5700,
        placeLng: 126.9779,
        orderInDay: 2,
        visitTime: "12:00",
        placeMemo: "서울 도심을 가로지르는 아름다운 하천입니다.",
    },
    {
        dayOrder: 2,
        placeName: "광화문",
        placeLat: 37.5759,
        placeLng: 126.9769,
        orderInDay: 3,
        visitTime: "14:00",
        placeMemo: "조선 시대의 정문으로, 역사적인 의미가 깊습니다.",
    },
    {
        dayOrder: 2,
        placeName: "이태원",
        placeLat: 37.5349,
        placeLng: 126.9940,
        orderInDay: 4,
        visitTime: "16:00",
        placeMemo: "다양한 문화가 공존하는 국제적인 지역입니다.",
    },
    {
        dayOrder: 2,
        placeName: "홍대",
        placeLat: 37.5570,
        placeLng: 126.9259,
        orderInDay: 5,
        visitTime: "18:00",
        placeMemo: "젊은이들의 문화와 예술이 살아있는 곳입니다.",
    },
    {
        dayOrder: 3,
        placeName: "롯데월드",
        placeLat: 37.5112,
        placeLng: 127.0983,
        orderInDay: 1,
        visitTime: "10:00",
        placeMemo: "서울의 대표적인 테마파크입니다.",
    },
    {
        dayOrder: 3,
        placeName: "잠실 한강공원",
        placeLat: 37.5172,
        placeLng: 127.1010,
        orderInDay: 2,
        visitTime: "12:00",
        placeMemo: "한강을 따라 산책과 운동을 즐길 수 있는 곳입니다.",
    },
    {
        dayOrder: 3,
        placeName: "서울숲",
        placeLat: 37.5449,
        placeLng: 127.0420,
        orderInDay: 3,
        visitTime: "14:00",
        placeMemo: "도심 속에서 자연을 느낄 수 있는 공원입니다.",
    },
    {
        dayOrder: 3,
        placeName: "성수동 카페거리",
        placeLat: 37.5445,
        placeLng: 127.0470,
        orderInDay: 4,
        visitTime: "16:00",
        placeMemo: "트렌디한 카페와 맛집이 많은 지역입니다.",
    },
    {
        dayOrder: 3,
        placeName: "가로수길",
        placeLat: 37.5210,
        placeLng: 126.9180,
        orderInDay: 5,
        visitTime: "18:00",
        placeMemo: "패션과 예술이 어우러진 거리입니다.",
    }
];

const tripGroupByOrder: Map<number, TripDetail[]> = new Map();

tripDetailData.forEach(item => {
    const key = item.dayOrder;
    if (!tripGroupByOrder.has(key)) {
        tripGroupByOrder.set(key, []);
    }
    tripGroupByOrder.get(key)!.push(item);
});

function TripPlanView() {
    const [selectedDay, setSelectedDay] = useState(1);
    const [focusedPlace, setFocusedPlace] = useState<TripDetail>(tripDetailData[0]);

    useEffect(() => {
        const tripDetails = tripGroupByOrder.get(selectedDay);
        if (tripDetails && tripDetails.length > 0) {
            setFocusedPlace(tripDetails[0]);
        }
    }, [selectedDay])

    return (
        <div className="h-full flex flex-col">
            <main className="flex flex-1 overflow-hidden">
                <TripPlanSidebar
                    tripData={tripData}
                    tripGroupByOrder={tripGroupByOrder}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    setFocusedPlace={setFocusedPlace}
                />
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <TripPlanMap
                        selectedDayTrips={tripGroupByOrder.get(selectedDay) ?? []}
                        focusedPlace={focusedPlace}
                        setFocusedPlace={setFocusedPlace}
                    />
                </APIProvider>
            </main>
        </div>
    );
}

export default TripPlanView;