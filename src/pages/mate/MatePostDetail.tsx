import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MATE_URL } from '../../config';
import type { MatePostDetail, MateApplicant } from '../../types/mate';
import { toast } from 'sonner';
import { ClipLoader } from 'react-spinners';
import { FaMapMarkerAlt, FaUsers, FaVenusMars, FaBirthdayCake, FaCalendarCheck, FaCalendarDay } from 'react-icons/fa';

function ApplicantList({ applicants, onAccept, onReject }: { applicants: MateApplicant[], onAccept: (id: string) => void, onReject: (id: string) => void }) {
    return (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-2">신청자 목록</h3>
            <div className="space-y-3">
                {applicants.map(app => (
                    <div key={app.applicantId} className="flex justify-between items-center p-2 bg-white rounded shadow-sm">
                        <div className="flex items-center gap-3">
                            <img src={app.profileImg} className="w-10 h-10 rounded-full" />
                            <span>{app.nickname}</span>
                        </div>
                        {app.status === 'APPLIED' ? (
                            <div className="flex gap-2">
                                <button onClick={() => onReject(app.applicantId)} className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">거절</button>
                                <button onClick={() => onAccept(app.applicantId)} className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">수락</button>
                            </div>
                        ) : (
                            <span className={`text-sm font-semibold ${app.status === 'ACCEPTED' ? 'text-green-600' : 'text-red-600'}`}>
                                {app.status === 'ACCEPTED' ? '수락됨' : '거절됨'}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MatePostDetail() {
    const { postId } = useParams<{ postId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [post, setPost] = useState<MatePostDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPost = useCallback(async () => {
        if (!postId) return;
        try {
            const response = await fetch(`${MATE_URL}/api/mate/posts/detail/${postId}`, { method: 'POST', credentials: 'include' });
            if (!response.ok) throw new Error("게시글을 불러올 수 없습니다.");
            const data: MatePostDetail = await response.json();
            setPost(data);
        } catch (error) {
            toast.error((error as Error).message);
            navigate('/mate/board');
        } finally { setIsLoading(false); }
    }, [postId, navigate]);

    useEffect(() => { fetchPost(); }, [fetchPost]);

    const isOwner = useMemo(() => {
        if (!user || !post) return false;
        return user.userId === post.owner.ownerId; // post.ownerId -> post.owner.ownerId
    }, [user, post]);

    const myApplication = post?.applicants?.find(app => app.applicantId === user?.userId);

    const handleApiCall = async (url: string, successMessage: string) => {
        try {
            const response = await fetch(url, { method: 'POST', credentials: 'include' });
            if (!response.ok) throw new Error("요청에 실패했습니다.");
            toast.success(successMessage);
            fetchPost(); // 상태 갱신을 위해 데이터 다시 불러오기
        } catch (error) { toast.error((error as Error).message); }
    };

    const handleApply = () => handleApiCall(`${MATE_URL}/api/mate/posts/apply/${postId}`, "동행 신청이 완료되었습니다.");
    const handleAccept = (applicantId: string) => handleApiCall(`${MATE_URL}/api/mate/posts/apply/${postId}/accept/${applicantId}`, "신청을 수락했습니다.");
    const handleReject = (applicantId: string) => handleApiCall(`${MATE_URL}/api/mate/posts/apply/${postId}/reject/${applicantId}`, "신청을 거절했습니다.");
    const handleDelete = async () => {
        if (window.confirm("정말로 게시글을 삭제하시겠습니까?")) {
            await handleApiCall(`${MATE_URL}/api/mate/posts/delete/${postId}`, "게시글이 삭제되었습니다.");
            navigate('/mate/board');
        }
    };

    if (isLoading || !post) return <div className="text-center py-10"><ClipLoader /></div>;

    const formatGender = (genders: string[]) => {
        if (!genders || genders.length === 0 || genders.includes('ANY')) return "누구나 환영!";
        return genders.map(g => g === 'MALE' ? '남성' : '여성').join(', ') + '만';
    };

    const formatAges = (ages: number[]) => {
        if (!ages || ages.length === 0) return "나이 무관";
        return ages.map(age => `${age}대`).join(', ');
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white shadow-md my-8 rounded-lg">
                {/* 헤더 */}
                <header className="border-b border-gray-200 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{post.postTitle}</h1>
                            <div className="text-sm text-gray-500 mt-2 flex items-center gap-4">
                                <span>작성자: {post.owner.nickname}</span>
                                {/* [추가] 작성일 표시 */}
                                <span>작성일: {new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex gap-2 flex-shrink-0 ml-4">
                                <Link to={`/mate/post/edit/${post.postId}`} state={{ post }} className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">수정</Link>
                                <button onClick={handleDelete} className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition">삭제</button>
                            </div>
                        )}
                    </div>
                </header>

                {/* 본문 */}
                <article className="prose prose-lg max-w-none mb-8">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                </article>

                {/* --- [핵심 수정] 동행 정보 및 참여 조건 섹션 --- */}
                <div className="space-y-6">
                    {/* 동행 정보 */}
                    <section className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-lg mb-3 text-blue-800 flex items-center gap-2"><FaUsers /> 동행 정보</h3>
                        <div className="space-y-2 text-gray-700">
                            {post.place?.placeName && <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /><strong>대표 장소:</strong> {post.place.placeName}</p>}
                            <p><strong>여행 기간:</strong> {post.startDate} ~ {post.endDate}</p>
                            <p><strong>모집 현황:</strong> {post.nowMate} / {post.maxMate} 명 ({post.status === 'OPEN' ? <span className="text-green-600 font-semibold">모집중</span> : <span className="text-gray-600 font-semibold">모집완료</span>})</p>
                            {/* [추가] 최소 인원 및 마감일 표시 */}
                            <p><strong>최소 출발 인원:</strong> {post.minMate} 명</p>
                            <p><strong>모집 마감일:</strong> {post.deadline}</p>
                        </div>
                    </section>

                    {/* 참여 조건 */}
                    <section className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h3 className="font-bold text-lg mb-3 text-green-800 flex items-center gap-2"><FaCalendarCheck /> 이런 동행을 찾아요!</h3>
                        <div className="space-y-2 text-gray-700">
                            {/* [추가] 성별 및 나이대 조건 표시 */}
                            <p className="flex items-center gap-2"><FaVenusMars className="text-gray-400" /><strong>성별 조건:</strong> {formatGender(post.genders)}</p>
                            <p className="flex items-center gap-2"><FaBirthdayCake className="text-gray-400" /><strong>나이대 조건:</strong> {formatAges(post.ages)}</p>
                        </div>
                    </section>
                </div>

                {/* 신청자 목록 (글쓴이에게만 보임) */}
                {isOwner && post.applicants && <ApplicantList applicants={post.applicants} onAccept={handleAccept} onReject={handleReject} />}

                {/* --- [핵심 수정] 액션 버튼 (isOwner가 아닐 때만 렌더링) --- */}
                {!isOwner && (
                    <footer className="mt-8 text-center">
                        {(() => {
                            if (post.status === 'CLOSED') {
                                return <p className="text-gray-500 font-semibold">모집이 마감되었습니다.</p>;
                            }
                            switch (myApplication?.status) {
                                case 'APPLIED':
                                    return <p className="text-blue-600 font-semibold">신청이 완료되어 승인을 기다리는 중입니다.</p>;
                                case 'ACCEPTED':
                                    return <p className="text-green-600 font-semibold">동행이 수락되었습니다! 즐거운 여행 되세요.</p>;
                                case 'REJECTED':
                                    return <p className="text-red-600 font-semibold">아쉽지만 이번 동행은 거절되었습니다.</p>;
                                default:
                                    return <button onClick={handleApply} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition">동행 신청하기</button>;
                            }
                        })()}
                    </footer>
                )}
            </div>
        </div>
    );
}