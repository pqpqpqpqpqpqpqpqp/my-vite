import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { FaRegUserCircle } from "react-icons/fa";
import { PLAN_URL } from '../../config';

interface TripBoardDTO {
    tripId: string;
    tripTitle: string;
    startDate: string;
    endDate: string;
    ownerNickname: string;
}

interface TripBoardItemProps {
    trip: TripBoardDTO;
}

const getTripStatus = (startDate: string, endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today > end) return { text: '여행완료', style: 'bg-gray-500 text-white', isCompleted: true };
    if (today >= start && today <= end) return { text: '여행중', style: 'bg-red-500 text-white animate-pulse', isCompleted: false };
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { text: diffDays > 0 ? `D-${diffDays}` : 'D-DAY', style: 'bg-blue-500 text-white', isCompleted: false };
};

function TripBoardItem({ trip }: TripBoardItemProps) {
    const { startDate, endDate, tripId, tripTitle, ownerNickname } = trip;
    const status = getTripStatus(startDate, endDate);
    const randomImageId = Math.floor(Math.random() * 1074) + 10;
    const imageUrl = `https://picsum.photos/id/${randomImageId}/800/600`;
    const period = `${startDate.replace(/-/g, '.')} - ${endDate.replace(/-/g, '.')}`;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
            {/* 이미지 영역 */}
            <div
                className={`h-48 bg-cover bg-center relative ${status.isCompleted ? 'filter grayscale' : ''}`}
                style={{ backgroundImage: `url(${imageUrl})` }}
            >
                <div className={`absolute top-3 left-3 px-3 py-1 text-sm font-semibold rounded-full ${status.style}`}>
                    {status.text}
                </div>
            </div>

            {/* 정보 영역 */}
            <div className="p-4">
                <h3 className="text-xl font-bold text-gray-800 truncate">{tripTitle}</h3>
                <p className="text-sm text-gray-500 mt-1">{period}</p>

                {/* 작성자 닉네임 표시 (새로 추가된 부분) */}
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <FaRegUserCircle />
                    <span>{ownerNickname}</span>
                </div>

                {/* 버튼 영역 (편집 버튼 제거) */}
                <div className="mt-4 flex justify-end">
                    <Link
                        to={`/trip/plan/view/${tripId}`}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        일정 보기
                    </Link>
                </div>
            </div>
        </div>
    );
}

// 3. TripPlanList를 게시판용 TripBoard 컴포넌트로 수정
export default function TripPlanBoard() {
    const [trips, setTrips] = useState<TripBoardDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- 페이지네이션을 위한 상태 추가 ---
    const [page, setPage] = useState(0); // 현재 페이지 번호
    const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부
    const [isFetchingMore, setIsFetchingMore] = useState(false); // 추가 데이터 로딩 상태

    useEffect(() => {
        const fetchPublicTrips = async () => {
            // 첫 로딩이 아닐 경우, 추가 로딩 상태로 설정
            if (page > 0) {
                setIsFetchingMore(true);
            }

            try {
                // API URL을 게시판용으로 변경하고, page 파라미터 추가
                const response = await fetch(`${PLAN_URL}/trip/plan/board?page=${page}&size=10&sort=startDate,desc`, { credentials: 'include' });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json(); // 백엔드 Page 객체를 받음

                // 기존 목록에 새로운 데이터를 추가
                setTrips(prevTrips => [...prevTrips, ...data.content]);
                // 마지막 페이지일 경우 hasMore를 false로 설정
                setHasMore(!data.last);

            } catch (err) {
                console.error("API fetch error:", err);
                setError('여행 목록을 불러오는 데 실패했습니다.');
            } finally {
                setLoading(false); // 첫 로딩 완료
                setIsFetchingMore(false); // 추가 로딩 완료
            }
        };

        // 더 불러올 데이터가 있을 때만 API 호출
        if (hasMore) {
            fetchPublicTrips();
        }
    }, [page]); // page가 변경될 때마다 API 호출

    const handleLoadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

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
        // [수정] max-w-xl을 max-w-6xl로 변경하여 그리드 레이아웃을 위한 충분한 너비 확보
        <div className="max-w-6xl mx-auto min-h-screen bg-gray-50">
            <header className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 flex justify-between items-center p-5 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-800">여행 둘러보기</h1>
            </header>

            {/* [수정] main 태그에 grid 클래스를 적용하여 레이아웃을 변경합니다. */}
            <main className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {trips.length > 0 ? (
                    trips.map(trip => (
                        <TripBoardItem key={trip.tripId} trip={trip} />
                    ))
                ) : (
                    // [수정] 게시물이 없을 때 메시지가 그리드 전체를 차지하도록 col-span-full 추가
                    <div className="text-center py-20 px-5 sm:col-span-2 lg:col-span-3">
                        <p className="text-gray-500">아직 공개된 여행이 없어요.</p>
                    </div>
                )}

                {/* [수정] 더 보기 버튼이 그리드 전체를 차지하도록 컨테이너에 col-span-full 추가 */}
                {hasMore && (
                    <div className="flex justify-center mt-4 sm:col-span-2 lg:col-span-3">
                        <button
                            onClick={handleLoadMore}
                            disabled={isFetchingMore}
                            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {isFetchingMore ? <ClipLoader color="#FFFFFF" size={20} /> : '더 보기'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}