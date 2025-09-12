import axios from 'axios';
import type { MateChatDetailDTO } from '../types/Chat';
import { MATE_URL } from "../ChatConfig";


// axios 인스턴스 생성
// HttpOnly 쿠키가 자동으로 모든 요청에 포함되도록
const apiClient = axios.create({
    baseURL: MATE_URL,
    withCredentials: true
});


export const fetchChatDetails = async (chatId: string): Promise<MateChatDetailDTO> => {
    try {
        const response = await apiClient.get<MateChatDetailDTO>(`/api/mate/chat/${encodeURIComponent(chatId)}`);
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("채팅 상세 정보 조회 실패: ", error);
        throw error;
    }
};