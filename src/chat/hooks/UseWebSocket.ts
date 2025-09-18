import { useEffect, useState, useRef, useCallback, use } from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {DomainType ,MessageDTO } from "../types/Chat";
import { markRoomAsRead, sendMessage as apiSendMessage } from "../api/ChatApi";



// 환경 변수 설정
const WS_URL = (import.meta.env.VITE_WS_URL as string) ?? '/ws/chat';
const SUB_TEMPLATE = (import.meta.env.VITE_STOMP_SUBSCRIBE as string) ?? '/sub/chat/{domain}/{chatId}';
const PUB_TEMPLATE = (import.meta.env.VITE_STOMP_PUBLISH as string) ?? '/pub/message/send/{domain}/{chatId}';

// SockJS URL 변환 유틸
function toSockJSUrl(url: string) {
  if (!url) return '/ws/chat';
  // ws(s) → http(s) 로 변환 (withSockJS 사용 시 일반적으로 http(s)로 붙음)
  if (url.startsWith('ws://')) return url.replace(/^ws:\/\//, 'http://');
  return url; // 이미 http(s)면 그대로
}

// 템플릿 치환 유틸
function fillTemplate(tmpl: string, domain: 'MATE'|'TRIP', chatId: string) {
  return tmpl
    .replace('{domain}', domain.toLowerCase()) // mate | trip
    .replace('{chatId}', chatId);
}

// 주소 계산 (이전의 buildDestinations 대체)
function buildDestinations(domain: 'MATE'|'TRIP', chatId: string) {
  return {
    sendDest: fillTemplate(PUB_TEMPLATE, domain, chatId),
    subDest:  fillTemplate(SUB_TEMPLATE, domain, chatId),
  };
}


// ----------------------------------------------------
// 타입
type UseChatSocketArgs = {
  domain: DomainType;            
  chatId: string;                
  enabled: boolean;
  onReceive: (msg: MessageDTO) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  // 읽음 처리: 방 입장/새 메시지 도착 후 일정시간에 1회 호출
  debounceReadMs?: number;       // 기본 400ms
  maxRetries?: number;
};

type UseChatSocketReturn = {
  connected: boolean;
  sendMessage: (content: string) => Promise<void>;
  disconnect: () => void;
};


// ----------------------------------------------------
// 훅
export function useChatSocket({
  domain,
  chatId,
  enabled,
  onReceive,
  onConnected,
  onDisconnected,
  debounceReadMs = 400,
  maxRetries = 5,
}: UseChatSocketArgs): UseChatSocketReturn {

  const clientRef = useRef<Client | null>(null);
  const subRef = useRef<StompSubscription | null>(null);
  const timerRef = useRef<number | null>(null);
  
  const [connected, setConnected] = useState(false);

  // const { sendDest, subDest } = buildDestinations(domain, chatId);
  
  
  // ----------------------------------------------------
  // 콜백 함수 ref 관리
  const onReceiveRef = useRef(onReceive);
  useEffect(() => { onReceiveRef.current = onReceive; }, [onReceive]);
  
  const onConnectedRef = useRef(onConnected);
  useEffect(() => { onConnectedRef.current = onConnected; }, [onConnected]);

  const onDisconnectedRef = useRef(onDisconnected);
  useEffect(() => { onDisconnectedRef.current = onDisconnected; }, [onDisconnected]);

  
  // ----------------------------------------------------
  // 읽음 처리
  const scheduleMarkRead = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout( async () => {
      try {
        await markRoomAsRead(domain, { chatId, messageIds: [] });
      } catch {}
    }, debounceReadMs) as unknown as number;
  }, [domain, chatId, debounceReadMs]);


  // // ----------------------------------------------------
  // // 연결

  // const onReceiveRef = useRef(onReceive);
  // useEffect( () => { onReceiveRef.current = onReceive;}, [onReceive]);

  // const connect = useCallback( () => {
  //   if(!enabled || !chatId) return;

  //   (async () => {
  //     try {await clientRef.current?.deactivate?.();} catch{}
  //     clientRef.current = null;
  //     try {await subRef.current?.unsubscribe?.();} catch{}
  //     subRef.current = null;

  //     const client = new Client( {
  //       webSocketFactory: () => new SockJS(toSockJSUrl(WS_URL)),

  //       reconnectDelay: 5000,
  //       heartbeatIncoming: 10000,
  //       heartbeatOutgoing: 10000,

  //       // 디버그 로그 끔
  //       debug: () => {},

  //        // 연결 성공 시
  //       onConnect: () => {
  //         setConnected(true);
  //         onConnected?.();
  //         subRef.current = client.subscribe(subDest, (frame) => {

  //           try{
  //             const msg: MessageDTO = JSON.parse(frame.body);
  //             onReceive(msg);;
  //             scheduleMarkRead();
  //           } catch {}
  //       });

  //       // 입장 시 읽음 처리 예약
  //       scheduleMarkRead();
  //     },

  //     onWebSocketClose: () => {
  //       setConnected(false);
  //       onDisconnected?.();
  //       try {
  //         subRef.current?.unsubscribe?.();
  //       } catch {}
  //       subRef.current = null;
  //     },
  //     onStompError: () => {}
  //   });

  //   clientRef.current = client;
  //   client.activate();

  // }) ();
  // }, [enabled, chatId, onConnected, onDisconnected, onReceive, subDest, scheduleMarkRead]);


  // ----------------------------------------------------
  // 라이프 사이클
  useEffect( () => {
    if(!enabled || !chatId) {
      clientRef.current?.deactivate?.();
      return;
    }

    // 중복 실행 방지
    if(clientRef.current) {
      return;
    }

    const {subDest} = buildDestinations(domain, chatId);

    const client = new Client({
      webSocketFactory: () => new SockJS(toSockJSUrl(WS_URL)),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        setConnected(true);
        onConnectedRef.current?.(); // ref를 통해 최신 콜백 실행

        subRef.current = client.subscribe(subDest, (frame) => {
          try {
            const msg: MessageDTO = JSON.parse(frame.body);
            onReceiveRef.current(msg); // ref를 통해 최신 콜백 실행
            scheduleMarkRead();
          } catch {}
        });
        scheduleMarkRead();
      },
      onWebSocketClose: () => {
        setConnected(false);
        onDisconnectedRef.current?.(); // ref를 통해 최신 콜백 실행
        subRef.current = null;
      },
      onStompError: () => { /* 에러 처리 */ }
    });

    clientRef.current = client;
    client.activate();

    // Cleanup 함수
    return () => {
      if(timerRef.current) window.clearTimeout(timerRef.current);
      client.deactivate();
      clientRef.current = null;
      subRef.current = null;
      setConnected(false);
    };
  }, [enabled, domain, chatId, scheduleMarkRead]);

  // ----------------------------------------------------
  // 메세지 전송
  const sendMessage = useCallback(
    async (content: string) => {
      const payload = { chatId, content };
      // connected 상태를 직접 참조하여 안정성 향상
      if (clientRef.current?.active) {
        try {
          const { sendDest } = buildDestinations(domain, chatId);
          clientRef.current.publish({
            destination: sendDest,
            body: JSON.stringify(payload),
          });
          scheduleMarkRead();
        } catch (error) {
          // 웹소켓 전송 실패 시 REST 폴백
          await apiSendMessage(payload);
          scheduleMarkRead();
        }
      } else {
        // 연결 안되었을 때 REST 폴백
        await apiSendMessage(payload);
        scheduleMarkRead();
      }
    },
    [domain, chatId, scheduleMarkRead]
  );

  const disconnect = useCallback(() => {
    clientRef.current?.deactivate();
  }, []);

  return { connected, sendMessage, disconnect };
}


//   // ----------------------------------------------------
//   // 연결 해제
//   const disconnect = useCallback(() => {
//     if (timerRef.current) window.clearTimeout(timerRef.current);
//     try { 
//       subRef.current?.unsubscribe?.(); 
//     } catch {}
//       subRef.current = null;
//     try { 
//       clientRef.current?.deactivate?.(); 
//     } catch {}
//       clientRef.current = null;
//       setConnected(false);
//   }, []);

//   // 객체 반환
//   return { connected, sendMessage, disconnect };
// }