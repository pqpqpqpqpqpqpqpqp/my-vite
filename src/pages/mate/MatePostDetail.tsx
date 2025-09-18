import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../config';
import type { MatePostDetail, MateApplicant } from '../../types/mate';
import { toast } from 'sonner';
import { ClipLoader } from 'react-spinners';

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
            const response = await fetch(`${BASE_URL}/api/mate/posts/detail/${postId}`, { method: 'POST', credentials: 'include' });
            if (!response.ok) throw new Error("게시글을 불러올 수 없습니다.");
            const data: MatePostDetail = await response.json();
            setPost(data);
        } catch (error) {
            toast.error((error as Error).message);
            navigate('/mate/board');
        } finally { setIsLoading(false); }
    }, [postId, navigate]);

    useEffect(() => { fetchPost(); }, [fetchPost]);

    const isOwner = user?.userId === post?.ownerId;
    const myApplication = post?.applicants.find(app => app.applicantId === user?.userId);

    const handleApiCall = async (url: string, successMessage: string) => {
        try {
            const response = await fetch(url, { method: 'POST', credentials: 'include' });
            if (!response.ok) throw new Error("요청에 실패했습니다.");
            toast.success(successMessage);
            fetchPost(); // 상태 갱신을 위해 데이터 다시 불러오기
        } catch (error) { toast.error((error as Error).message); }
    };

    const handleApply = () => handleApiCall(`${BASE_URL}/api/mate/posts/apply/${postId}`, "동행 신청이 완료되었습니다.");
    const handleAccept = (applicantId: string) => handleApiCall(`${BASE_URL}/api/mate/posts/apply/${postId}/accept/${applicantId}`, "신청을 수락했습니다.");
    const handleReject = (applicantId: string) => handleApiCall(`${BASE_URL}/api/mate/posts/apply/${postId}/reject/${applicantId}`, "신청을 거절했습니다.");
    const handleDelete = async () => {
        if (window.confirm("정말로 게시글을 삭제하시겠습니까?")) {
            await handleApiCall(`${BASE_URL}/api/mate/posts/delete/${postId}`, "게시글이 삭제되었습니다.");
            navigate('/mate/board');
        }
    };

    if (isLoading || !post) return <div className="text-center py-10"><ClipLoader /></div>;

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
            <header className="border-b pb-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{post.postTitle}</h1>
                    {isOwner && (
                        <div className="flex gap-2">
                            <Link to={`/mate/post/edit/${postId}`} state={{ post }} className="px-3 py-1 text-sm bg-gray-200 rounded">수정</Link>
                            <button onClick={handleDelete} className="px-3 py-1 text-sm bg-red-500 text-white rounded">삭제</button>
                        </div>
                    )}
                </div>
                {/* <p className="text-gray-600 mt-2">작성자: {post.authorNickname}</p> */}
            </header>

            <article className="prose max-w-none mb-8"><p>{post.content}</p></article>

            <section className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-lg mb-2">동행 정보</h3>
                <p>여행 기간: {post.startDate} ~ {post.endDate}</p>
                <p>모집 현황: {post.nowMate} / {post.maxMate} 명 ({post.status === 'OPEN' ? '모집중' : '모집완료'})</p>
            </section>

            {isOwner && <ApplicantList applicants={post.applicants} onAccept={handleAccept} onReject={handleReject} />}

            <footer className="mt-8 text-center">
                {!isOwner && post.status === 'OPEN' && !myApplication && <button onClick={handleApply} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">동행 신청하기</button>}
                {!isOwner && myApplication?.status === 'APPLIED' && <p className="text-blue-600 font-semibold">신청이 완료되어 승인을 기다리는 중입니다.</p>}
                {!isOwner && myApplication?.status === 'ACCEPTED' && <p className="text-green-600 font-semibold">동행이 수락되었습니다! 즐거운 여행 되세요.</p>}
                {!isOwner && myApplication?.status === 'REJECTED' && <p className="text-red-600 font-semibold">아쉽지만 이번 동행은 거절되었습니다.</p>}
                {!isOwner && post.status === 'CLOSED' && !myApplication && <p className="text-gray-500 font-semibold">모집이 마감되었습니다.</p>}
            </footer>
        </div>
    );
}