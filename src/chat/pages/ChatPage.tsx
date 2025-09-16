// src/pages/ChatPage.tsx

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { DomainType, RoomListItem, RoomDetail, MessageDTO } from '../types/Chat';
import { fetchRoomList, fetchRoomDetail } from '../api/ChatApi';
import ChatList from '../components/ChatList';
import ChatRoom from '../components/ChatRoom';
import '../css/Chat.css';




export default function ChatPage() {

  // 1) 로그인 상태/유지
  const { isLoggedIn, user } = useAuth();

  // 2) 기본 탭: 여행(TRIP) 자동 선택
  const [domain, setDomain] = useState<DomainType>('TRIP');

  // 3) 좌측 목록 상태
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);

  // 4) 우측 상세 상태
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // 5) 입력/스크롤
  const messageEndRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------
  // 탭 변경 시: 목록 로드 + 우측 초기화
  // ---------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      setErrorList(null);
      setActiveChatId(null);
      setDetail(null);
      try {
        const list = await fetchRoomList(domain);
        if (!cancelled) setRooms(list);
      } catch (e: any) {
        if (!cancelled) setErrorList(e?.message ?? '목록 조회 실패');
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => { cancelled = true; };
  }, [domain]);

  // ---------------------------------------------------
  // 방 클릭 → 상세 로드 + 읽음 처리
  // ---------------------------------------------------
  const openRoom = async (chatId: string) => {
    setActiveChatId(chatId);
    setLoadingDetail(true);
    setErrorDetail(null);
    try {
      const d = await fetchRoomDetail(domain, chatId);
      setDetail(d);

      // 스크롤 바닥으로
      setTimeout(() => messageEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);

      // 읽음 처리: 내 미읽음 0으로 동기화
      setRooms(prev => prev.map(r => (r.chatId === chatId ? { ...r, unreadCount: 0 } : r)));
    } catch (e: any) {
      setErrorDetail(e?.message ?? '상세 조회 실패');
    } finally {
      setLoadingDetail(false);
    }
  };

  // ---------------------------------------------------
  // 메시지 전송 (임시 REST) → 다음 단계에서 WebSocket으로 교체
  // ---------------------------------------------------
  const appendMessage = useCallback((m: MessageDTO)  => {
    setDetail(prev => (prev ? {...prev, messages: [...prev.messages, m]} : prev));

    setRooms(prev => 
        prev.map(r => 
            r.chatId === (detail?.chatId ?? m as any)
            ? {...r, lastMsg: m.content, lastMsgSentAt: new Date().toISOString() }
            : r
        )
    );
  }, [detail?.chatId]);



  // 현재 탭의 내 미읽음 총합 (상단 뱃지)
  const totalUnread = useMemo(
    () => rooms.reduce((sum, r) => sum + (r.unreadCount ?? 0), 0),
    [rooms]
  );


  return (
<div className="chat-page">
      {/* 상단 탭 */}
      <div className="chat-tabs">
        <div
          className={`chat-tab ${domain === 'TRIP' ? 'active' : ''}`}
          onClick={() => setDomain('TRIP')}
          title="여행 채팅"
        >
          여행
        </div>
        <div
          className={`chat-tab ${domain === 'MATE' ? 'active' : ''}`}
          onClick={() => setDomain('MATE')}
          title="동행 채팅"
        >
          동행
        </div>

        <div className="chat-tabs-right">
          <span className="muted">내 미읽음</span>
          <span className="badge-danger">{totalUnread}</span>
        </div>
      </div>

      {/* 본문: 좌(목록)/우(상세) */}
      <div className="chat-body">
        <ChatList
          rooms={rooms}
          activeChatId={activeChatId}
          loading={loadingList}
          error={errorList}
          onOpen={openRoom}
        />

        <div className="chat-room-col">
          {/* 헤더 */}
          <div className="chat-room-header">
            {detail ? (
              <>
                <strong>
                  {detail.domain === 'TRIP' ? detail.tripTitle : detail.postTitle}
                </strong>
                <span className="muted">
                  ({detail.domain === 'TRIP' ? '여행' : '동행'}) · 참여자 {detail.participantCount}명
                </span>
              </>
            ) : (
              <span className="muted">왼쪽에서 채팅방을 선택하세요 (기본: 여행 탭)</span>
            )}
          </div>

          {/* 상세 (Hook 연결/입력/메시지 영역 포함) */}
          <ChatRoom
            domain={domain}
            detail={detail}
            loading={loadingDetail}
            error={errorDetail}
            onAppendMessage={appendMessage}
            userId={user?.userId ?? ''}
            messageEndRef={messageEndRef}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </div>
  );
}