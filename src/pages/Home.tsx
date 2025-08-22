import { Link } from "react-router-dom"
import Footer from "../components/Footer"

export default function Home() {
    return (
        <main>
            <section className="flex flex-col justify-center items-center text-center min-h-screen bg-blue-50 rounded-xl px-4">
                <h1 className="text-5xl font-bold mb-6">여행, 이제 xxx과 함께</h1>
                <p className="mb-6 text-xl max-w-lg">계획부터 예약까지, 여행을 더 쉽고 즐겁게 만들어드립니다.</p>
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg">
                    <Link to="/trip/plan/select">여행 시작하기</Link>
                </button>
            </section>

            <section className="flex flex-col justify-center items-center text-center min-h-screen py-12 bg-green-50 rounded-xl px-4">
                <h2 className="text-3xl font-semibold mb-4">나만의 여행 일정, xxx로 간편하게</h2>
                <p className="mb-6 text-lg">여행 일정을 한눈에 확인하고, 언제 어디서든 편리하게 관리하세요.</p>
                <button className="px-5 py-2 bg-blue-500 text-white rounded-lg">
                    <Link to="/trip/plan/view">일정 확인하기</Link>
                </button>
            </section>

            <section className="flex flex-col justify-center items-center text-center min-h-screen py-12 bg-pink-50 rounded-xl px-4">
                <h2 className="text-3xl font-semibold mb-4">함께 여행할 친구를 찾아보세요</h2>
                <p className="mb-6 text-lg">혼자 떠나는 여행보다, 동행과 함께라면 더 즐겁고 특별합니다.</p>
                <button className="px-5 py-2 bg-blue-500 text-white rounded-lg">동행 모집하기</button>
            </section>

            <section className="flex flex-col justify-center items-center text-center min-h-screen py-12 bg-gray-100 rounded-xl px-4">
                <h2 className="text-3xl font-semibold mb-4">여행을 떠날 준비, 지금 시작하세요!</h2>
                <p className="text-lg">xxx과 함께라면 여행 준비도 쉽고 빠릅니다.</p>
            </section>

            <Footer />
        </main>
    )
};
