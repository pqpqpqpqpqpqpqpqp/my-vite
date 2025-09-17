// import {useEffect, useState, useMemo} from "react";
// import { fetchChatDetails } from "../api/ChatApi";
// import { ChatRoom } from "../components/ChatRoom";
// import { useWebSocket } from "../hooks/UseWebSocket";
// import { useAuth } from "../../contexts/AuthContext";
// import type { MessageDTO } from "../types/Chat";


// const TEST_CHAT_ID = "mchat00000004";

// export const TestChatPage = () => {
//   const {isLoggedIn} = useAuth();

//   // 1) websocket hook을 페이지에서 호출
//   const {messages, isConnected, sendMessage, setInitialMessages} = useWebSocket(TEST_CHAT_ID, isLoggedIn);

//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [initialMessages, setInitial] = useState<MessageDTO[]>([]);

//   useEffect(() => {

//     // 2) 로그인 상태일 때만 과거 데이터 호출
//     console.log('1:', isLoggedIn);
//     if(!isLoggedIn) {
//       console.log('동작 체크해');
//       setIsLoading(false);
//       return;
//     }



//     const loadChatData = async () => {
//       try {
//         const chatDetails = await fetchChatDetails(TEST_CHAT_ID);
//         // 3) API로 받아온 과거 메세지를 훅 상태로 설정
//         setInitial(chatDetails.messages);
//         setInitialMessages?.(chatDetails.messages ?? []);

//         console.log('너 왓니?');
//         setIsLoading(false);
//       }
//       catch(err) {
//         console.error('?');
//       }
//     }

//     loadChatData();
//   }, []);

//   /**
//   useEffect(() => {
//     // 2) 로그인 상태일 때만 과거 데이터 호출
//     if(!isLoggedIn) {
//       setIsLoading(false);
//       return;
//     }

//     const loadChatData = async () => {
//       try {
//         const chatDetails = await fetchChatDetails(TEST_CHAT_ID);
//         // 3) API로 받아온 과거 메세지를 훅 상태로 설정
//         setInitial(chatDetails.messages);
//         setInitialMessages?.(chatDetails.messages ?? []);
//       } catch (err) {
//         setError('채팅 데이터를 불러오는 데 실패했습니다.');
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     loadChatData();
//   }, [isLoggedIn, setInitialMessages]);

//   **/

//   if (isLoading) return <div>채팅방 데이터를 불러오는 중...</div>;
//   if (error) return <div>{error}</div>;
//   if (!isLoggedIn) return <div>로그인이 필요합니다.</div>;

//   // const allMessages = useMemo(
//   //   () => [...initialMessages, ...messages],
//   //   [initialMessages, messages]
//   // );

//   return (
//     <div>
//       <h1>테스트 채팅방</h1>
//       <ChatRoom 
//         chatId={TEST_CHAT_ID}
//         allMessages={messages}
//         isConnected={isConnected}
//         sendMessage={sendMessage}
//       />
//     </div>
//   );
// };