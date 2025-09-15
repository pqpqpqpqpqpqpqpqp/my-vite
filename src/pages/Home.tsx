import { Link } from "react-router-dom";
import Footer from "../components/Footer";

// react-icons 라이브러리에서 아이콘들을 가져옵니다.
import { FaRegCalendarAlt, FaUserFriends, FaSearchLocation } from "react-icons/fa";

export default function Home() {
    // 가상의 서비스 이름으로 'xxx'를 대체했습니다.
    const serviceName = "My Travel App";

    return (
        <main className="overflow-x-hidden bg-white">
            {/* Hero Section */}
            <section className="relative flex flex-col justify-center items-center text-center min-h-screen text-white">
                {/* 배경 이미지 */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070"
                        alt="Beautiful travel destination"
                        className="w-full h-full object-cover"
                    />
                    {/* 어두운 오버레이 */}
                    <div className="absolute inset-0 bg-black opacity-50"></div>
                </div>
                
                {/* 콘텐츠 */}
                <div className="relative z-10 p-4">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">여행, 이제 {serviceName}과 함께</h1>
                    <p className="mb-8 text-xl max-w-xl drop-shadow-md">계획부터 예약까지, 여행을 더 쉽고 즐겁게 만들어드립니다.</p>
                    <Link to="/trip/plan/make/select">
                        <button className="px-8 py-4 bg-[#9EC6F3] text-white rounded-lg text-lg font-semibold hover:bg-[#799EFF] transition-transform transform hover:scale-105 shadow-lg">
                            여행 시작하기
                        </button>
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">여행의 모든 것을 한 곳에서</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
                        복잡한 여행 준비, {serviceName}의 스마트한 기능들로 간편하게 해결하세요.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature Card 1: 나만의 여행 일정 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-[#B2A5FF] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <FaRegCalendarAlt className="w-8 h-8"/>
                            </div>
                            <h3 className="text-2xl font-semibold mb-3">나만의 여행 일정</h3>
                            <p className="text-gray-600 mb-4">여행 일정을 한눈에 확인하고, 언제 어디서든 편리하게 관리하세요.</p>
                             <Link to="/trip/plan/view">
                                <button className="px-5 py-2 bg-[#B2A5FF] text-white rounded-lg hover:bg-[#8B5DFF] transition-colors">
                                    일정 확인하기
                                </button>
                            </Link>
                        </div>

                        {/* Feature Card 2: 함께할 동행 찾기 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-[#A7E399] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <FaUserFriends className="w-8 h-8"/>
                            </div>
                            <h3 className="text-2xl font-semibold mb-3">함께할 동행 찾기</h3>
                            <p className="text-gray-600 mb-4">혼자 떠나는 여행보다, 동행과 함께라면 더 즐겁고 특별합니다.</p>
                            <button className="px-5 py-2 bg-[#A7E399] text-white rounded-lg hover:bg-green-600 transition-colors">
                                동행 모집하기
                            </button>
                        </div>

                        {/* Feature Card 3: 숨은 명소 찾기 */}
                        <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                            <div className="bg-[#FF8383] text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                                <FaSearchLocation className="w-8 h-8"/>
                            </div>
                            <h3 className="text-2xl font-semibold mb-3">숨은 명소 찾기</h3>
                            <p className="text-gray-600 mb-4">빅데이터 기반 추천으로 나만 알고 싶은 숨겨진 여행지를 찾아보세요.</p>
                            <button className="px-5 py-2 bg-[#FF8383] text-white rounded-lg hover:bg-pink-600 transition-colors">
                                명소 찾아보기
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* CTA Section */}
            <section className="bg-[#9EC6F3] text-white">
                <div className="container mx-auto px-6 py-20 text-center flex flex-col items-center">
                    <h2 className="text-4xl font-bold mb-4">여행을 떠날 준비, 되셨나요?</h2>
                    <p className="text-lg max-w-xl mb-8">{serviceName}과 함께라면 여행 준비도 쉽고 빠릅니다. 지금 바로 당신만의 특별한 여정을 만들어보세요.</p>
                     <Link to="/trip/plan/select">
                        <button className="px-8 py-4 bg-white text-[#799EFF] rounded-lg text-lg font-semibold hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-lg">
                            지금 바로 시작하기
                        </button>
                    </Link>
                </div>
            </section>

            <Footer />
        </main>
    )
};