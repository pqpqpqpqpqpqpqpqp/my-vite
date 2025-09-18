import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../config';
import type { MatePostListItem } from '../../types/mate';
import { FaPlus } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

function MatePostCard({ post }: { post: MatePostListItem }) {
    const statusStyle = post.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    return (
        <Link to={`/mate/post/${post.postId}`} className="block p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-900 truncate">{post.postTitle}</h2>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle}`}>{post.status === 'OPEN' ? '모집중' : '모집완료'}</span>
            </div>
            <div className="mt-4 pt-4 border-t">
                <p className="text-gray-700">여행 기간: {post.startDate} ~ {post.endDate}</p>
                <p className="text-gray-700 mt-1">모집 현황: {post.nowMate} / {post.maxMate} 명</p>
            </div>
        </Link>
    );
}

export default function MateBoard() {
    const [posts, setPosts] = useState<MatePostListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${BASE_URL}/api/mate/posts/list`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ page: 0, size: 20, sortDir: 'desc' }), // 페이징 정보
                    credentials: 'include'
                });
                if (!response.ok) throw new Error("게시글 목록을 불러오지 못했습니다.");
                const data = await response.json();
                setPosts(data.content);
            } catch (error) { console.error(error); } finally { setIsLoading(false); }
        };
        fetchPosts();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">동행 구하기</h1>
                <Link to="/mate/post/new" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow">
                    <FaPlus /><span>새 글 작성</span>
                </Link>
            </header>
            {isLoading ? <div className="text-center py-10"><ClipLoader /></div> : (
                <main className="space-y-4">
                    {posts.length > 0 ? posts.map(post => <MatePostCard key={post.postId} post={post} />) : <p className="text-center text-gray-500 py-10">아직 모집 중인 동행이 없습니다.</p>}
                </main>
            )}
        </div>
    );
}