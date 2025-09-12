import { useEffect, useState, useRef, useCallback } from "react";
import {Client, type IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { MessageDTO } from "../types/Chat";
import { WS_URL, SUBSCRIBE_URL, PUBLISH_URL} from "../ChatConfig";



export const useWebSocket = (chatId: string | null, isLoggedIn: boolean) => {
  const [messages, setMessages] = useState<MessageDTO[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);


  useEffect( () => {

    // 1) 연결 조건 - chatId && 로그인 O
    if (!chatId || !isLoggedIn) {
      if(clientRef.current?.active) {
        clientRef.current.deactivate();
      }
      return;
    }

    // 2) STOMP 클라이언트 생성
    const client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        debug: (str) => {
          console.log(`[STOMP_DEBUG] ${new Date().toLocaleTimeString()} ${str}`);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    client.onConnect =  () => {
        setIsConnected(true);
        
        const subscriptionPath = SUBSCRIBE_URL.replace("{chatId}", chatId);
        
        client.subscribe(subscriptionPath, (msg: IMessage) => {
            try {
                const newMessage = JSON.parse(msg.body) as MessageDTO;
                setMessages((prev) => [...prev, newMessage]);
            } catch (e) {
                console.error("메시지 파싱 오류:", e, msg.body);
            }
        });
    };

    client.onDisconnect = () => setIsConnected(false);

    client.onStompError = (frame) => {
        console.error("Broker reported error: ", frame.headers["message"]);
        console.error("Additional details: ", frame.body);
    };

    // 4) 활성화
    client.activate();
    clientRef.current = client;

    // 5) cleanup: 구독 해제 + 비동기 deactive
    return () => {
        if (client.active) {
            client.deactivate();
        }
    };

  }, [chatId, isLoggedIn]);


  const sendMessage = useCallback((content: string) => {

    if (clientRef.current && isConnected && chatId) {
      const publishPath = PUBLISH_URL.replace("{chatId}", chatId);
      clientRef.current.publish({
        destination: publishPath,
        body: JSON.stringify({content}),
      });
    }
  }, [isConnected, chatId]);

  // 6) 외부에서 메세지 목록을 초기화할 수 있는 함수
  const setInitialMessages = (initialMessages: MessageDTO[]) => {
    setMessages(initialMessages);
  };

  return { messages, isConnected, sendMessage, setInitialMessages};
};
