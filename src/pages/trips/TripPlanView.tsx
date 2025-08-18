import { useState, useEffect } from 'react';
import TripPlanMap from '../../components/trips/TripPlanMap';
import type { TripDetailData, TripPlanSidebarProps } from '../../types/trip';

const tripData = {
    title: '서울 여행',
    startDate: '2023-10-01',
    endDate: '2023-10-05',
};

const tripDetailData: TripDetailData[] = [
    {
        placeId: "1",
        dayOrder: 1,
        placeName: "경복궁",
        placeLat: 37.5779,
        placeLng: 126.9769,
        orderInDay: 1,
        placeMemo: "경복궁은 조선 왕조의 주요 궁궐입니다.",
    },
    {
        placeId: "2",
        dayOrder: 1,
        placeName: "북촌 한옥마을",
        placeLat: 37.5826,
        placeLng: 126.9839,
        orderInDay: 2,
        placeMemo: "전통 한옥이 잘 보존된 지역입니다.",
    },
    {
        placeId: "3",
        dayOrder: 1,
        placeName: "인사동",
        placeLat: 37.5749,
        placeLng: 126.9882,
        orderInDay: 3,
        placeMemo: "한국 전통 문화와 예술을 체험할 수 있는 곳입니다.",
    },
    {
        placeId: "4",
        dayOrder: 1,
        placeName: "남산타워",
        placeLat: 37.5512,
        placeLng: 126.9882,
        orderInDay: 4,
        placeMemo: "서울의 랜드마크로, 전망이 아름답습니다.",
    },
    {
        placeId: "5",
        dayOrder: 1,
        placeName: "명동",
        placeLat: 37.5636,
        placeLng: 126.9850,
        orderInDay: 5,
        placeMemo: "쇼핑과 먹거리가 풍부한 지역입니다.",
    },
    {
        placeId: "6",
        dayOrder: 2,
        placeName: "동대문 디자인 플라자",
        placeLat: 37.5663,
        placeLng: 127.0090,
        orderInDay: 1,
        placeMemo: "현대적인 건축물과 디자인을 감상할 수 있습니다.",
    },
    {
        placeId: "7",
        dayOrder: 2,
        placeName: "청계천",
        placeLat: 37.5700,
        placeLng: 126.9779,
        orderInDay: 2,
        placeMemo: "서울 도심을 가로지르는 아름다운 하천입니다.",
    },
    {
        placeId: "8",
        dayOrder: 2,
        placeName: "광화문",
        placeLat: 37.5759,
        placeLng: 126.9769,
        orderInDay: 3,
        placeMemo: "조선 시대의 정문으로, 역사적인 의미가 깊습니다.",
    },
    {
        placeId: "9",
        dayOrder: 2,
        placeName: "이태원",
        placeLat: 37.5349,
        placeLng: 126.9940,
        orderInDay: 4,
        placeMemo: "다양한 문화가 공존하는 국제적인 지역입니다.",
    },
    {
        placeId: "10",
        dayOrder: 2,
        placeName: "홍대",
        placeLat: 37.5570,
        placeLng: 126.9259,
        orderInDay: 5,
        placeMemo: "젊은이들의 문화와 예술이 살아있는 곳입니다.",
    },
    {
        placeId: "11",
        dayOrder: 3,
        placeName: "롯데월드",
        placeLat: 37.5112,
        placeLng: 127.0983,
        orderInDay: 1,
        placeMemo: "서울의 대표적인 테마파크입니다.",
    },
    {
        placeId: "12",
        dayOrder: 3,
        placeName: "잠실 한강공원",
        placeLat: 37.5172,
        placeLng: 127.1010,
        orderInDay: 2,
        placeMemo: "한강을 따라 산책과 운동을 즐길 수 있는 곳입니다.",
    },
    {
        placeId: "13",
        dayOrder: 3,
        placeName: "서울숲",
        placeLat: 37.5449,
        placeLng: 127.0420,
        orderInDay: 3,
        placeMemo: "도심 속에서 자연을 느낄 수 있는 공원입니다.",
    },
    {
        placeId: "14",
        dayOrder: 3,
        placeName: "성수동 카페거리",
        placeLat: 37.5445,
        placeLng: 127.0470,
        orderInDay: 4,
        placeMemo: "트렌디한 카페와 맛집이 많은 지역입니다.",
    },
    {
        placeId: "15",
        dayOrder: 3,
        placeName: "가로수길",
        placeLat: 37.5210,
        placeLng: 126.9180,
        orderInDay: 5,
        placeMemo: "패션과 예술이 어우러진 거리입니다.",
    }
];

const tripDetailDataGroupingDay: Map<number, TripDetailData[]> = new Map();

tripDetailData.forEach(item => {
    const key = item.dayOrder;
    if (!tripDetailDataGroupingDay.has(key)) {
        tripDetailDataGroupingDay.set(key, []);
    }
    tripDetailDataGroupingDay.get(key)!.push(item);
});

function TripPlanSidebar({
    tripData,
    tripDetailDataGroupingDay,
    selectedDay,
    setSelectedDay,
    setFocusedPlace }: TripPlanSidebarProps) {
    return (
        <aside className="min-w-80 bg-gray-100 p-6 h-full">
            <div className="mb-6 border-b">
                <h1 className="text-2xl font-bold">{tripData.title}</h1>
                <p className="text-gray-500 text-sm">
                    {tripData.startDate} ~ {tripData.endDate}
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {[...tripDetailDataGroupingDay.keys()].map((day) => {
                    const isSelected = selectedDay === day;
                    return (
                        <div key={day} className="transition-all border-b last:border-none">
                            <div
                                onClick={() => setSelectedDay(day)}
                                className={`px-6 py-4 cursor-pointer flex items-center justify-between ${isSelected
                                    ? 'bg-blue-100 text-blue-800 font-semibold'
                                    : 'hover:bg-gray-50'
                                    }`}
                            >
                                <span>{day}일차</span>
                                {isSelected && (
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>

                            {isSelected && (
                                <div className="bg-gray-50">
                                    {tripDetailDataGroupingDay.get(day)?.map((place) => (
                                        <div
                                            key={place.orderInDay}
                                            className="flex justify-between items-center p-4 bg-white hover:bg-gray-100 transition rounded-md shadow-sm m-2"
                                            onClick={() => setFocusedPlace(place)}
                                        >
                                            <div className="font-medium text-gray-800">{place.placeName}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default function TripPlanView() {
    const [selectedDay, setSelectedDay] = useState(1);
    const [focusedPlace, setFocusedPlace] = useState<TripDetailData>(tripDetailData[0]);

    useEffect(() => {
        const tripDetails = tripDetailDataGroupingDay.get(selectedDay);
        if (tripDetails && tripDetails.length > 0) {
            setFocusedPlace(tripDetails[0]);
        }
    }, [selectedDay])

    return (
        <div className="h-full flex flex-col">
            <main className="flex flex-1 overflow-hidden">
                <TripPlanSidebar
                    tripData={tripData}
                    tripDetailDataGroupingDay={tripDetailDataGroupingDay}
                    selectedDay={selectedDay}
                    setSelectedDay={setSelectedDay}
                    setFocusedPlace={setFocusedPlace}
                />
                <TripPlanMap
                    tripDetailDataGroupingDay={tripDetailDataGroupingDay}
                    selectedDay={selectedDay}
                    focusedPlace={focusedPlace}
                    setFocusedPlace={setFocusedPlace}
                />
            </main>
        </div>
    );
}