import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { FaPlus } from 'react-icons/fa';
import { PLAN_URL } from '../../config';

interface TripList {
    tripId: string;
    tripTitle: string;
    startDate: string;
    endDate: string;
}

interface TripItemProps {
    trip: TripList;
}

const getTripStatus = (startDate: string, endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today > end) {
        return { text: '여행완료', style: 'bg-gray-500 text-white', isCompleted: true };
    }
    if (today >= start && today <= end) {
        return { text: '여행중', style: 'bg-red-500 text-white animate-pulse', isCompleted: false };
    }

    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
        return { text: `D-${diffDays}`, style: 'bg-blue-500 text-white', isCompleted: false };
    } else {
        return { text: 'D-DAY', style: 'bg-blue-500 text-white', isCompleted: false };
    }
};

function TripItem({ trip }: TripItemProps) {
    const { startDate, endDate, tripId, tripTitle } = trip
    const status = getTripStatus(startDate, endDate);

    const randomImageId = Math.floor(Math.random() * 1085);

    const imageUrl = `https://picsum.photos/id/${randomImageId}/800/600`;

    const period = `${startDate.replace(/-/g, '.')} - ${endDate.replace(/-/g, '.')}`;

    return (
        // <Link>를 <div>로 변경하여 카드 전체 클릭 시의 링크 이동을 막습니다.
        <div className="block mb-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
                {/* 이미지 영역 */}
                <div
                    className={`h-60 bg-cover bg-center relative ${status.isCompleted ? 'filter grayscale' : ''}`}
                    style={{ backgroundImage: `url(${imageUrl})` }}
                >
                    {/* 상태 뱃지 */}
                    <div className={`absolute top-3 left-3 px-3 py-1 text-sm font-semibold rounded-full ${status.style}`}>
                        {status.text}
                    </div>
                </div>

                {/* 정보 영역 */}
                <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate">{tripTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1">{period}</p>

                    {/* --- 버튼 영역 추가 --- */}
                    <div className="mt-4 flex justify-end space-x-2">
                        {/* 보기 버튼 */}
                        <Link
                            to={`/trip/plan/view/${tripId}`}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            상세보기
                        </Link>
                        {/* 편집 버튼 */}
                        <Link
                            to={`/trip/plan/make/detail/${tripId}`}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            편집
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TripPlanList() {
    const [tripList, setTripList] = useState<TripList[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTripLists = async () => {
            try {
                const response = await fetch(`${PLAN_URL}/trip/plan/lists`, { credentials: 'include' });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                const sortedData = data.sort((a: TripList, b: TripList) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
                setTripList(sortedData);

            } catch (err) {
                console.error("API fetch error:", err);
                setError('여행 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
            } finally {
                setLoading(false);
            }
        };

        fetchTripLists();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#3B82F6" size={50} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 flex justify-between items-center p-5 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">나의 여행</h1>
                <Link to="/trip/plan/make/select" className="flex justify-center items-center w-9 h-9 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                    <FaPlus />
                </Link>
            </header>

            {/* 여행 목록 */}
            <main className="p-5">
                {tripList.length > 0 ? (
                    tripList.map(trip => (
                        <TripItem key={trip.tripId} trip={trip} />
                    ))
                ) : (
                    // 등록된 여행이 없을 때
                    <div className="text-center py-20 px-5">
                        <p className="text-gray-500">아직 등록된 여행이 없어요.</p>
                        <p className="text-gray-500 mb-6">첫 여행을 계획해 보세요!</p>
                        <Link to="/trip/plan/make/select" className="inline-block bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                            새로운 여행 추가하기
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}