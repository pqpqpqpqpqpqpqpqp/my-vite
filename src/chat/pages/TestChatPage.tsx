import {useEffect, useState} from "react";
import { fetchChatDetails } from "../api/ChatApi";
import type { MessageDTO } from "../types/Chat";
import { ChatRoom } from "../components/ChatRoom";


const CHAT_ID = "mchat00000003";

export const TestChatPage = () => {
  const [initialMessages, setInitialMessages] = useState<MessageDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChatData = async () => {
      try {
        const chatDetails = await fetchChatDetails(CHAT_ID);
        setInitialMessages(chatDetails.messages);
      } catch (err) {
        setError('채팅 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    loadChatData();
  }, []);

  if (isLoading) return <div>채팅방 데이터를 불러오는 중...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>테스트 채팅방</h1>
      <ChatRoom initialMessages={initialMessages} />
    </div>
  );
};