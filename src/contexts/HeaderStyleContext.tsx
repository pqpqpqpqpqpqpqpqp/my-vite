import { createContext, useState, useContext } from 'react';
import type { PropsWithChildren } from 'react';

// 1. 타입 정의를 파일 상단에 함께 둡니다.
//    이 타입들이 다른 곳에서 재사용되지 않는다면, 여기에 두는 것이 가장 좋습니다.
interface HeaderStyleContextType {
  bgColor: string;
  setBgColor: (color: string) => void;
}

// PropsWithChildren<T> 타입을 사용하면 children prop을 명시적으로 타이핑할 필요가 없습니다.
// type HeaderStyleProviderProps = {
//   children: React.ReactNode;
// };


// 2. Context 생성 (이 객체는 export 하지 않습니다)
//    외부에서 직접 useContext(HeaderStyleContext)를 호출하는 것을 막기 위함입니다.
const HeaderStyleContext = createContext<HeaderStyleContextType | undefined>(undefined);


// 3. Provider 컴포넌트 생성 및 export
export const HeaderStyleProvider = ({ children }: PropsWithChildren) => {
  const [bgColor, setBgColor] = useState('transparent');

  const value = { bgColor, setBgColor };

  return (
    <HeaderStyleContext.Provider value={value}>
      {children}
    </HeaderStyleContext.Provider>
  );
};


// 4. Custom Hook 생성 및 export
//    이제 이 훅이 Context에 접근하는 유일한 통로가 됩니다.
export const useHeaderStyle = () => {
  const context = useContext(HeaderStyleContext);

  // 이 체크 로직이 훅 안에 캡슐화되어 있어 매우 안전합니다.
  if (context === undefined) {
    throw new Error('useHeaderStyle must be used within a HeaderStyleProvider');
  }

  return context;
};