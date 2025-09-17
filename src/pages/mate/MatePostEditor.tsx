import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PLAN_URL, BASE_URL } from '../../config';
import type { MatePostCreatePayload, MatePostUpdatePayload, MatePostDetail } from '../../types/mate';
import { toast } from 'sonner';

export default function MatePostEditor() {
    const { postId } = useParams<{ postId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const sourceTripId = location.state?.sourceTripId;
    const existingPost: MatePostDetail | null = location.state?.post;

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        startDate: '',
        endDate: '',
        maxMate: 2,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (postId && existingPost) { // 수정 모드 (상세 페이지에서 넘어온 데이터 사용)
            setFormData({
                title: existingPost.postTitle,
                content: existingPost.content,
                startDate: existingPost.startDate,
                endDate: existingPost.endDate,
                maxMate: existingPost.maxMate,
            });
        } else if (sourceTripId) { // 생성 모드 (여행 계획 기반)
            const fetchTripPlan = async () => {
                const response = await fetch(`${PLAN_URL}/trip/plan/${sourceTripId}`, { credentials: 'include' });
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    title: `'${data.tripTitle}' 여행 동행 구해요!`,
                    startDate: data.startDate,
                    endDate: data.endDate,
                }));
            };
            fetchTripPlan();
        }
    }, [postId, sourceTripId, existingPost]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const url = postId ? `${BASE_URL}/api/mate/posts/update/${postId}` : `${BASE_URL}/api/mate/posts/create`;
            const payload: MatePostCreatePayload | MatePostUpdatePayload = {
                ...(postId ? {} : { tripId: sourceTripId }), // 생성 시에만 tripId 포함
                postTitle: formData.title,
                content: formData.content,
                startDate: formData.startDate,
                endDate: formData.endDate,
                maxMate: Number(formData.maxMate),
            };
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
            if (!response.ok) throw new Error(postId ? "수정에 실패했습니다." : "게시글 작성에 실패했습니다.");

            const resData = await response.json();
            toast.success(postId ? "게시글이 수정되었습니다." : "게시글이 작성되었습니다.");
            navigate(`/mate/post/${resData.postId || postId}`);

        } catch (error) { toast.error((error as Error).message); } finally { setIsSubmitting(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">{postId ? "동행 모집 수정" : "새로운 동행 찾기"}</h1>
            <div className="space-y-4">
                <div>
                    <label>제목</label>
                    <input name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div>
                    <label>내용</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} required rows={10} />
                </div>
                <div>
                    <label>여행 시작일</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                </div>
                <div>
                    <label>여행 종료일</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
                </div>
                <div>
                    <label>최대 모집 인원</label>
                    <input type="number" name="maxMate" value={formData.maxMate} onChange={handleChange} required min="2" />
                </div>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? "저장 중..." : "저장하기"}</button>
            </div>
        </form>
    );
}