import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import type { Step, LoginInfo } from "@shared/types";
import { formatKSTDateTime } from "@shared/utils";
import LoginForm from "@/components/LoginForm";
import WelcomeScreen from "@/components/WelcomeScreen";
import CaptureGuide from "@/components/CaptureGuide";
import WebcamCapture from "@/components/WebcamCapture";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ResultDisplay from "@/components/ResultDisplay";

export default function Home() {
  const [step, setStep] = useState<Step>("login");
  const [user, setUser] = useState<User | null>(null);
  const [loginInfo, setLoginInfo] = useState<LoginInfo | null>(null); // 로그인 시 입력한 정보 저장
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [faceAge, setFaceAge] = useState<number>(0);
  const { toast } = useToast();

  // 키인 모드 여부 상태 관리 (기본값: false)
  const [isDevMode, setIsDevMode] = useState<boolean>(false);
  
  // QR 코드 접속 여부 (URL에 result 파라미터가 있으면 QR 코드 접속으로 간주)
  const [isFromQR, setIsFromQR] = useState<boolean>(false);

  // URL 파라미터에서 결과 데이터 읽기 (QR 코드 스캔 시)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const resultParam = urlParams.get("result");
    
    if (resultParam) {
      setIsFromQR(true); // QR 코드 접속으로 표시
      try {
        // URL 디코딩 후 Base64 디코딩, 그 다음 UTF-8 디코딩
        const base64Data = decodeURIComponent(resultParam);
        const binaryString = atob(base64Data);
        // 바이트 배열로 변환
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        // UTF-8 디코딩
        const decodedData = new TextDecoder().decode(bytes);
        const resultData = JSON.parse(decodedData);
        // 결과 데이터로 상태 설정
        setUser({
          id: `qr-${resultData.name}`,
          company: "",
          employeeId: "",
          name: resultData.name,
          realAge: resultData.realAge,
          department: "",
        });
        setFaceAge(resultData.faceAge);
        // 이미지 URL이 있으면 이미지 로드
        if (resultData.imageUrl) {
          // 이미지 URL을 절대 URL로 변환 (상대 경로인 경우)
          const imageUrl = resultData.imageUrl.startsWith("http")
            ? resultData.imageUrl
            : `${window.location.origin}${resultData.imageUrl}`;
          
          // 서버에서 이미지를 가져와서 Base64로 변환
          fetch(imageUrl)
            .then((res) => {
              if (!res.ok) {
                throw new Error(`이미지 로드 실패: ${res.status} ${res.statusText}`);
              }
              return res.blob();
            })
            .then((blob) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                setCapturedImage(reader.result as string);
              };
              reader.onerror = () => {
                console.error("FileReader 오류");
                setCapturedImage("");
              };
              reader.readAsDataURL(blob);
            })
            .catch((error) => {
              console.error("이미지 로드 실패:", error);
              setCapturedImage("");
            });
        } else {
          setCapturedImage("");
        }
        setStep("result");
        // URL에서 result 파라미터 제거 (깔끔한 URL 유지)
        window.history.replaceState({}, "", window.location.pathname);
      } catch (error) {
        console.error("QR 코드 결과 파싱 실패:", error);
        toast({
          title: "오류",
          description: "QR 코드 결과를 읽을 수 없습니다.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const handleLogin = async (
    company: string, 
    employeeId: string, 
    devData?: { name: string; realAge: number; department: string }
  ) => {
    try {
      if (isDevMode && devData) {
        // 키인 모드: DB 조회 없이 입력한 정보를 그대로 사용
        const keyinEmployeeId = "KEYIN"; // 키인 모드 플레이스홀더
        const userData: User = {
          id: `dev-${company}-${devData.name}`, // 임시 ID 생성 (회사명-이름 조합)
          company,
          employeeId: keyinEmployeeId, // 키인 모드에서는 플레이스홀더 사용
          name: devData.name,
          realAge: devData.realAge,
          department: devData.department,
        };
        setUser(userData);
        setLoginInfo({ company, employeeId: keyinEmployeeId }); // 로그인 정보 저장 (플레이스홀더 사용)
        setStep("welcome");
      } else {
        // 일반 모드: /api/user/lookup 호출
        const response = await apiRequest("POST", "/api/user/lookup", {
          company,
          employeeId,
        });
        
        const userData = await response.json() as User;
        setUser(userData);
        setLoginInfo({ company, employeeId }); // 로그인 정보 저장
        setStep("welcome");
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const handleWelcomeContinue = () => {
    setStep("guide");
  };

  const handleGuideStart = () => {
    setStep("webcam");
  };

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setStep("loading");
    
    try {
      // 얼굴 나이 분석 API 호출 (실제 분석 시간 사용)
      const response = await apiRequest("POST", "/api/analysis/face-age", {
        image: imageSrc, // Base64 이미지 문자열
      });

      const { faceAge } = await response.json();
      
      setFaceAge(faceAge);
      setStep("result");

      // 분석 결과를 구글 시트에 저장
      if (user && loginInfo) {
        try {
          const ageDifference = faceAge - user.realAge; // 얼굴 나이 - 실제 나이
          // 한국 시간대(KST)로 변환하여 읽기 쉬운 형식으로 포맷팅: "2025-11-07 22:20:47"
          const completedAt = formatKSTDateTime();

          const response = await apiRequest("POST", "/api/analysis/save", {
            company: loginInfo.company,
            employeeId: loginInfo.employeeId,
            name: user.name,
            department: user.department, // 부서명
            realAge: user.realAge,
            faceAge: faceAge,
            ageDifference,
            completedAt,
          });

          // 응답 Content-Type 확인
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("❌ JSON이 아닌 응답 받음:", {
              contentType,
              status: response.status,
              statusText: response.statusText,
              body: text.substring(0, 200), // 처음 200자만
            });
            throw new Error(`서버가 JSON이 아닌 응답을 반환했습니다: ${response.status} ${response.statusText}`);
          }

          await response.json();
        } catch (error) {
          // 저장 실패해도 사용자에게는 오류 표시하지 않음 (백그라운드 작업)
          console.error("❌ 분석 결과 저장 실패:", error);
          if (error instanceof Error) {
            console.error("에러 상세:", error.message);
            console.error("에러 스택:", error.stack);
          }
        }
      } else {
        console.warn("⚠️ 사용자 정보 또는 로그인 정보가 없어 저장하지 않음");
      }
    } catch (error) {
      // 얼굴 나이 분석 실패 시 오류 처리
      console.error("❌ 얼굴 나이 분석 실패:", error);
      toast({
        title: "오류",
        description: "얼굴 나이 분석에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      setStep("webcam"); // 웹캠 화면으로 돌아가기
    }
  };

  const handleReset = () => {
    setCapturedImage("");
    setFaceAge(0);
    setUser(null);
    setLoginInfo(null); // 로그인 정보도 초기화
    setStep("login");
  };

  return (
    <>
      {step === "login" && (
        <LoginForm 
          onSubmit={handleLogin} 
          isDevMode={isDevMode}
          onDevModeChange={setIsDevMode}
        />
      )}
      
      {step === "welcome" && user && (
        <WelcomeScreen name={user.name} onContinue={handleWelcomeContinue} />
      )}
      
      {step === "guide" && (
        <CaptureGuide onStart={handleGuideStart} />
      )}
      
      {step === "webcam" && (
        <WebcamCapture onCapture={handleCapture} />
      )}
      
      {step === "loading" && <LoadingAnalysis />}
      
      {step === "result" && user && (
        <ResultDisplay
          realAge={user.realAge}
          faceAge={faceAge}
          capturedImage={capturedImage}
          name={user.name}
          onReset={handleReset}
          isMobileMode={isFromQR} // QR 코드 접속 시 모바일 모드
        />
      )}
    </>
  );
}
