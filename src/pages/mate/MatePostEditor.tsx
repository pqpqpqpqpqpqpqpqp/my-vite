import { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { PLAN_URL, MATE_URL } from '../../config';
import type { MatePostDetail, MatePostCreatePayload, MatePostUpdatePayload } from '../../types/mate';
import { toast } from 'sonner';
import { ClipLoader } from 'react-spinners';

// 컴포넌트 외부에 상수로 정의하여 불필요한 리렌더링 방지
const AGE_OPTIONS = [10, 20, 30, 40, 50, 60];
const GENDER_OPTIONS = [
    { value: 'MALE', label: '남성' },
    { value: 'FEMALE', label: '여성' }
] as const;

export default function MatePostEditor() {
    const { postId } = useParams<{ postId: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // location.state에서 넘어온 데이터
    const sourceTripId = location.state?.sourceTripId;
    const existingPost: MatePostDetail | null = location.state?.post;

    // 폼의 모든 데이터를 관리하는 단일 상태
    const [formData, setFormData] = useState({
        postTitle: '',
        content: '',
        startDate: '',
        endDate: '',
        minMate: 2,
        maxMate: 4,
        deadline: '',
        gender: 'ANY',
        ages: [] as number[],
        placeName: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // 컴포넌트 마운트 시 또는 postId/sourceTripId 변경 시 폼 데이터 초기화
    useEffect(() => {
        const initializeForm = async () => {
            setIsLoadingData(true);
            try {
                if (postId && existingPost) { // 수정 모드
                    setFormData({
                        postTitle: existingPost.postTitle,
                        content: existingPost.content,
                        startDate: existingPost.startDate,
                        endDate: existingPost.endDate,
                        minMate: existingPost.minMate,
                        maxMate: existingPost.maxMate,
                        deadline: existingPost.deadline,
                        // genders 배열을 gender 상태로 변환
                        gender: existingPost.genders.length > 0 ? existingPost.genders[0] as 'MALE' | 'FEMALE' : 'ANY',
                        ages: existingPost.ages || [],
                        placeName: existingPost.place?.placeName || '',
                    });
                } else if (sourceTripId) { // 생성 모드 (여행 계획 기반)
                    const response = await fetch(`${PLAN_URL}/trip/plan/${sourceTripId}`, { credentials: 'include' });
                    if (!response.ok) throw new Error("원본 여행 정보를 불러오지 못했습니다.");
                    const data = await response.json();
                    setFormData(prev => ({
                        ...prev,
                        postTitle: `'${data.tripTitle}' 여행 동행 구해요!`,
                        startDate: data.startDate,
                        endDate: data.endDate,
                    }));
                }
            } catch (error) {
                toast.error((error as Error).message);
                navigate('/mate/board');
            } finally {
                setIsLoadingData(false);
            }
        };
        initializeForm();
    }, [postId, sourceTripId, existingPost, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name.includes('Mate') ? Number(value) : value }));
    };

    const handleGenderChange = (value: 'ANY' | 'MALE' | 'FEMALE') => {
        setFormData(prev => ({ ...prev, gender: value }));
    };

    // 나이대 체크박스 핸들러 (이전과 동일)
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        const ageValue = Number(value);
        setFormData(prev => {
            if (checked) {
                return { ...prev, ages: [...prev.ages, ageValue] };
            } else {
                return { ...prev, ages: prev.ages.filter(age => age !== ageValue) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast.error("여행 종료일은 시작일보다 빠를 수 없습니다."); return;
        }
        if (new Date(formData.deadline) > new Date(formData.startDate)) {
            toast.error("모집 마감일은 여행 시작일보다 빠를 수 없습니다."); return;
        }
        if (formData.minMate > formData.maxMate) {
            toast.error("최소 인원은 최대 인원보다 많을 수 없습니다."); return;
        }

        setIsSubmitting(true);
        try {
            let url: string;
            let payload: MatePostCreatePayload | MatePostUpdatePayload;

            if (postId) { // 수정 모드
                url = `${MATE_URL}/api/mate/posts/update/${postId}`;
                payload = {
                    postTitle: formData.postTitle,
                    content: formData.content,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    minMate: formData.minMate,
                    maxMate: formData.maxMate,
                    deadline: formData.deadline,
                    placeName: formData.placeName,
                    genders: formData.gender === 'ANY' ? [] : [formData.gender],
                    ages: formData.ages,
                };
            } else { // 생성 모드
                url = `${MATE_URL}/api/mate/posts/create`;
                payload = {
                    tripId: sourceTripId,
                    postTitle: formData.postTitle,
                    content: formData.content,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    minMate: formData.minMate,
                    maxMate: formData.maxMate,
                    deadline: formData.deadline,
                    placeName: formData.placeName,
                    genders: formData.gender === 'ANY' ? [] : [formData.gender],
                    ages: formData.ages,
                };
            }

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

        } catch (error) {  } finally { setIsSubmitting(false); }
    };

    if (isLoadingData) {
        return <div className="flex justify-center items-center h-screen"><ClipLoader /></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-8">
                        {/* 헤더 */}
                        <div className="border-b border-gray-200 pb-6">
                            <h1 className="text-3xl font-bold text-gray-900">{postId ? "동행 모집 수정" : "새로운 동행 찾기"}</h1>
                            <p className="mt-2 text-gray-500">함께할 여행의 상세 정보를 입력해주세요.</p>
                        </div>

                        {/* 제목 */}
                        <div>
                            <label htmlFor="postTitle" className="block text-sm font-semibold text-gray-700">제목</label>
                            <input type="text" id="postTitle" name="postTitle" value={formData.postTitle} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="예: 제주도 동쪽 해안도로 같이 달려요!" />
                        </div>

                        {/* 내용 */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-semibold text-gray-700">내용</label>
                            <textarea id="content" name="content" value={formData.content} onChange={handleChange} required rows={10} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="여행 스타일, 원하는 동행, 간단한 계획 등 자유롭게 작성해주세요." />
                        </div>

                        {/* 여행 기간 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700">여행 시작일</label>
                                <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700">여행 종료일</label>
                                <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>

                        {/* 모집 인원 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="minMate" className="block text-sm font-semibold text-gray-700">최소 인원 (본인 포함)</label>
                                <input type="number" id="minMate" name="minMate" value={formData.minMate} onChange={handleChange} required min="2" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="maxMate" className="block text-sm font-semibold text-gray-700">최대 인원 (본인 포함)</label>
                                <input type="number" id="maxMate" name="maxMate" value={formData.maxMate} onChange={handleChange} required min={formData.minMate} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        </div>

                        {/* 모집 마감일 */}
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700">모집 마감일</label>
                            <input type="date" id="deadline" name="deadline" value={formData.deadline} onChange={handleChange} required className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>

                        {/* 대표 장소 (선택) */}
                        <div>
                            <label htmlFor="placeName" className="block text-sm font-semibold text-gray-700">대표 장소 (선택)</label>
                            <input type="text" id="placeName" name="placeName" value={formData.placeName} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm" placeholder="예: 성산일출봉" />
                        </div>

                        {/* 필터: 성별 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">동행 성별 조건</label>
                            <p className="text-sm text-gray-500 mb-2">설정 시 해당 성별의 사용자만 이 글을 볼 수 있습니다.</p>
                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                                {/* '누구나' 옵션을 기본으로 추가 */}
                                <label key="ANY" className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="ANY"
                                        checked={formData.gender === 'ANY'}
                                        onChange={() => handleGenderChange('ANY')}
                                        className="h-4 w-4 border-gray-300 text-blue-600"
                                    />
                                    누구나
                                </label>
                                {GENDER_OPTIONS.map(opt => (
                                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={opt.value}
                                            checked={formData.gender === opt.value}
                                            onChange={() => handleGenderChange(opt.value)}
                                            className="h-4 w-4 border-gray-300 text-blue-600"
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 필터: 나이대 (다중 선택) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">동행 나이대 조건 (다중 선택 가능)</label>
                            <p className="text-sm text-gray-500 mb-2">선택 시 해당 나이대에 속한 사용자만 이 글을 볼 수 있습니다. (미선택 시 전체 허용)</p>
                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                                {AGE_OPTIONS.map(age => (
                                    <label key={age} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            value={age}
                                            checked={formData.ages.includes(age)}
                                            onChange={handleCheckboxChange}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                        />
                                        {age}대
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* 버튼 영역 */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            <Link to='/mate/board' className="px-5 py-2.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">취소</Link>
                            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition">
                                {isSubmitting && <ClipLoader color="#FFFFFF" size={20} />}
                                {postId ? "수정 완료" : "작성 완료"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}