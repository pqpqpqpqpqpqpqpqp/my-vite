import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Signup() {
    const [userEmail, setUserEmail] = useState('');
    const [userPw, setUserPw] = useState('');
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
    const [birth, setBirth] = useState('');
    const [genderCode, setGenderCode] = useState('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const profileInputRef = useRef<HTMLInputElement | null>(null);
    const navigate = useNavigate();

    const isValidEmail = (value: string) =>
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    const isValidPw = (value: string) =>
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{8,20}$/.test(value);
    const isValidName = (value: string) =>
        /^[가-힣]{2,}$/.test(value) || /^[a-zA-Z]{2,}$/.test(value);
    const isValidNickname = (value: string) =>
        /^[가-힣a-zA-Z0-9._-]{3,20}$/.test(value);
    const isValidBirth = (value: string) => {
        if (!/^\d{6}$/.test(value)) return false;
        const year = parseInt(value.slice(0, 2), 10);
        const month = parseInt(value.slice(2, 4), 10);
        const day = parseInt(value.slice(4, 6), 10);

        if (month < 1 || month > 12) return false;
        const daysInMonth = [31, (year % 4 === 0 ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (day < 1 || day > daysInMonth[month - 1]) return false;

        return true;
    };
    const isValidGenderCode = (value: string) => /^[1-8]$/.test(value);

    const checkNicknameAvailability = async () => {
        if (!nickname.trim()) {
            toast.warning('닉네임을 입력해주세요.');
            return;
        }
        try {
            if (nickname.length >= 3) {
                setIsNicknameAvailable(true);
                toast.success('사용 가능한 닉네임입니다!');
            } else {
                toast.error('이미 사용 중이거나 유효하지 않은 닉네임입니다.');
            }
        } catch (error) {
            if (error instanceof Error) toast.error(`닉네임 확인 실패: ${error.message}`);
            else toast.error('닉네임 확인 실패: 알 수 없는 오류');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        if (file.size > 2 * 1024 * 1024) {
            toast.warning('이미지는 2MB 이하로 업로드해주세요.');
            return;
        }

        setProfileImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    useEffect(() => {
        if (profileImage) {
            toast.success('프로필 이미지가 선택되었습니다.');
        }
    }, [profileImage]);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            let yearPrefix = '';
            let gender = '';

            switch (genderCode) {
                case '1': gender = 'MALE'; yearPrefix = '19'; break;
                case '2': gender = 'FEMALE'; yearPrefix = '19'; break;
                case '3': gender = 'MALE'; yearPrefix = '20'; break;
                case '4': gender = 'FEMALE'; yearPrefix = '20'; break;
                case '5': gender = 'MALE'; yearPrefix = '19'; break;
                case '6': gender = 'FEMALE'; yearPrefix = '19'; break;
                case '7': gender = 'MALE'; yearPrefix = '20'; break;
                case '8': gender = 'FEMALE'; yearPrefix = '20'; break;
                default:
                    toast.error('유효하지 않은 주민번호입니다.');
                    return;
            }

            const fullBirth = `${yearPrefix}${birth.slice(0, 2)}-${birth.slice(2, 4)}-${birth.slice(4, 6)}`;

            const body = {
                email: userEmail,
                pw: userPw,
                name,
                nickname,
                birth: fullBirth,
                gender
            };

            const response = await fetch('http://localhost:8080/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: '서버 오류' };
                }
                return toast.error(`회원가입 실패: ${errorData.message}`);
            }

            toast.success('회원가입 성공!');
            navigate('/sign/login');
        } catch (error) {
            if (error instanceof Error) toast.error(`회원가입 실패: ${error.message}`);
            else toast.error("회원가입 실패: 알 수 없는 오류");
        }
    };

    const isFormValid =
        isValidEmail(userEmail) &&
        isValidPw(userPw) &&
        isValidName(name) &&
        isValidBirth(birth) &&
        isValidGenderCode(genderCode) &&
        nickname.trim() !== '' &&
        isNicknameAvailable;

    const inputClass = (valid: boolean | null) =>
        `p-3 border rounded-lg focus:outline-none focus:ring-2 ${valid === null
            ? 'border-gray-300 focus:ring-blue-400'
            : valid
                ? 'border-green-500 focus:ring-green-400'
                : 'border-red-500 focus:ring-red-400'
        }`;

    return (
        <div className="max-w-lg mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-6 text-center">회원가입</h2>
            <form onSubmit={handleSignup} className="flex flex-col gap-6">
                <div className="flex gap-4 items-center">
                    <div className="flex-1 flex flex-col gap-3">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름"
                            required
                            className={inputClass(name === '' ? null : isValidName(name))}
                        />

                        <div className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={birth}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setBirth(val);
                                }}
                                placeholder="YYMMDD"
                                maxLength={6}
                                className={`${inputClass(birth === '' ? null : isValidBirth(birth))} w-35`}
                            />

                            <span className="text-gray-400">-</span>

                            <input
                                type="text"
                                value={genderCode}
                                placeholder="1~8"
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 1);
                                    setGenderCode(val);
                                }}
                                maxLength={1}
                                className={`${inputClass(genderCode === '' ? null : isValidGenderCode(genderCode))} w-14`}
                            />

                            <input
                                type="text"
                                placeholder="******"
                                readOnly
                                className='w-32 p-3 border rounded-lg outline-none border-green-500'
                            />
                        </div>
                    </div>

                    <div
                        tabIndex={0}
                        className="w-24 h-24 border border-gray-300 rounded-full overflow-hidden cursor-pointer flex items-center justify-center"
                        onClick={() => profileInputRef.current?.click()}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') profileInputRef.current?.click();
                        }}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400 text-sm">프로필</span>
                        )}
                    </div>
                </div>

                <div className="flex gap-5">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임"
                        readOnly={isNicknameAvailable}
                        required
                        className={`${inputClass(nickname === '' ? null : isNicknameAvailable ? true : isValidNickname(nickname))} w-89`}
                    />
                    <button
                        type="button"
                        onClick={checkNicknameAvailability}
                        disabled={isNicknameAvailable}
                        className="w-22 px-3 bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        중복검사
                    </button>
                </div>

                <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="이메일"
                    required
                    className={inputClass(userEmail === '' ? null : isValidEmail(userEmail))}
                />
                <input
                    type="password"
                    value={userPw}
                    onChange={(e) => setUserPw(e.target.value)}
                    placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8~20자)"
                    required
                    className={inputClass(userPw === '' ? null : isValidPw(userPw))}
                />

                <input
                    type="file"
                    accept="image/*"
                    ref={profileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                />

                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`p-3 rounded-lg transition-colors ${isFormValid
                        ? 'bg-blue-400 text-white hover:bg-blue-500'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    회원가입
                </button>
            </form>

            <p className="mt-4 text-sm text-gray-600 text-center">
                이미 회원이신가요?{' '}
                <Link to="/sign/login" className="text-blue-600 hover:underline">
                    로그인
                </Link>
            </p>
        </div>
    );
}
