import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { BASE_URL } from '../../config';
import { FaCheckCircle } from 'react-icons/fa';

export default function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        pw: '',
        name: '',
        nickname: '',
        birth: '2000-01-01',
        gender: '',
    });

    //const [profileImage, setProfileImage] = useState<File | null>(null);
    //const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [isNicknameChecked, setIsNicknameChecked] = useState(false);
    const [validatedNickname, setValidatedNickname] = useState<string | null>(null);

    //const profileInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    const validations = {
        email: (v: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v),
        pw: (v: string) => /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{8,20}$/.test(v),
        name: (v: string) => /^[가-힣]{2,}$/.test(v) || /^[a-zA-Z]{2,}$/.test(v),
        nickname: (v: string) => /^[가-힣a-zA-Z0-9._-]{3,20}$/.test(v),
        birth: (v: string) => v !== '',
        gender: (v: string) => v === 'MALE' || v === 'FEMALE',
    };

    const isFormValid =
        Object.entries(validations).every(([key, validate]) => validate(formData[key as keyof typeof formData])) &&
        isNicknameChecked && formData.nickname === validatedNickname;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'nickname') {
            setIsNicknameChecked(false);
            setValidatedNickname(null);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const checkNicknameAvailability = async () => {
        if (!validations.nickname(formData.nickname)) {
            toast.error('닉네임은 3~20자의 한글, 영문, 숫자, 특수문자(._-)만 사용 가능합니다.');
            return;
        }
        try {
            const response = await fetch(`${BASE_URL}/api/users/check-nickname?nickname=${formData.nickname}`);
            if (!response.ok) throw new Error('이미 사용 중인 닉네임입니다.');

            setIsNicknameChecked(true);
            setValidatedNickname(formData.nickname);
            toast.success('사용 가능한 닉네임입니다!');
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        }
    };
    /*
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.warning('이미지는 2MB 이하로 업로드해주세요.');
            return;
        }
        setProfileImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    };
    */
    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isFormValid || isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '서버 오류' }));
                throw new Error(errorData.message || '회원가입에 실패했습니다.');
            }

            toast.success('회원가입 성공! 로그인 페이지로 이동합니다.');
            navigate('/sign/login');
        } catch (error) {
            if (error instanceof Error) toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-2xl shadow-lg">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-center text-gray-900">회원가입</h1>
                <p className="mt-2 text-sm text-center text-gray-600">
                    여행 계획을 위한 첫 걸음을 시작하세요.
                </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-8">
                <fieldset className="space-y-6">
                    <legend className="text-lg font-semibold text-gray-900">기본 정보</legend>
                    <div className="space-y-4">
                        {/* 프로필 이미지 업로더 
                        <div className="flex-shrink-0">
                            <label htmlFor="profileImage" className="sr-only">프로필 이미지</label>
                            <input id="profileImage" type="file" accept="image/*" ref={profileInputRef} className="hidden" onChange={handleImageChange} />
                            <div
                                tabIndex={0}
                                className="w-24 h-24 bg-gray-200 border-2 border-dashed border-gray-300 rounded-full cursor-pointer flex items-center justify-center hover:border-indigo-500"
                                onClick={() => profileInputRef.current?.click()}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') profileInputRef.current?.click(); }}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-xs text-center text-gray-500">프로필<br />이미지</span>
                                )}
                            </div>
                        </div>
                        */}
                        <div>
                            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">이름</label>
                            <input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} placeholder="이름을 입력해주세요" className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-[#799EFF] focus:border-[#799EFF] focus:z-10 sm:text-sm" />
                        </div>

                        <div>
                            <label htmlFor="birth" className="block mb-1 text-sm font-medium text-gray-700">생년월일</label>
                            <input
                                id="birth"
                                name="birth"
                                type="date"
                                required
                                min="1901-01-01"
                                max="2025-12-31"
                                value={formData.birth}
                                onChange={handleInputChange}
                                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-[#799EFF] focus:border-[#799EFF] focus:z-10 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">성별</label>
                            <div className="flex">
                                <div className="mr-6">
                                    <input
                                        id="male"
                                        name="gender"
                                        type="radio"
                                        required
                                        value="MALE"
                                        checked={formData.gender === 'MALE'}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-[#799EFF] border-gray-300 focus:ring-[#799EFF]"
                                    />
                                    <label htmlFor="male" className="ml-2 text-sm font-medium text-gray-900">남성</label>
                                </div>
                                <div>
                                    <input
                                        id="female"
                                        name="gender"
                                        type="radio"
                                        required
                                        value="FEMALE"
                                        checked={formData.gender === 'FEMALE'}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-[#799EFF] border-gray-300 focus:ring-[#799EFF]"
                                    />
                                    <label htmlFor="female" className="ml-2 text-sm font-medium text-gray-900">여성</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <div className="border-t border-gray-200"></div>

                <fieldset className="space-y-6">
                    <legend className="text-lg font-semibold text-gray-900">계정 정보</legend>
                    <div>
                        <label htmlFor="nickname" className="block mb-1 text-sm font-medium text-gray-700">닉네임</label>
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-grow">
                                <input id="nickname" name="nickname" type="text" required value={formData.nickname} onChange={handleInputChange} placeholder="3~20자의 한글, 영문, 숫자, 특수문자(._-)" className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-[#799EFF] focus:border-[#799EFF] focus:z-10 sm:text-sm" />
                                {isNicknameChecked && formData.nickname === validatedNickname && (
                                    <FaCheckCircle className="absolute text-green-500 right-3 top-1/2 -translate-y-1/2" />
                                )}
                            </div>
                            <button type="button" onClick={checkNicknameAvailability} disabled={isNicknameChecked && formData.nickname === validatedNickname} className="self-end px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md h-11 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed">
                                중복확인
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">이메일</label>
                        <input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="example@email.com" className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-[#799EFF] focus:border-[#799EFF] focus:z-10 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="pw" className="block mb-1 text-sm font-medium text-gray-700">비밀번호</label>
                        <input id="pw" name="pw" type="password" required value={formData.pw} onChange={handleInputChange} placeholder="영문, 숫자, 특수문자 포함 8~20자" className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-[#799EFF] focus:border-[#799EFF] focus:z-10 sm:text-sm" />
                    </div>
                </fieldset>

                <div className="pt-4">
                    <button type="submit" disabled={!isFormValid || isLoading} className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#799EFF] border border-transparent rounded-md group hover:bg-[#4E71FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#799EFF] disabled:bg-[#9EC6F3] disabled:cursor-not-allowed">
                        {isLoading ? '가입하는 중...' : '가입하기'}
                    </button>
                </div>
            </form>

            <p className="mt-6 text-sm text-center">
                <Link to="/sign/login" className="font-medium text-[#799EFF] hover:text-[#4E71FF]">
                    이미 계정이 있으신가요? 로그인
                </Link>
            </p>
        </div>
    );
}