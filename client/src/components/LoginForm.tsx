import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bot } from 'lucide-react';
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";
import MatrixBackground from "@/components/MatrixBackground";

interface LoginFormProps {
  onSubmit: (company: string, employeeId: string, devData?: { name: string; realAge: number; department: string }) => void;
  isDevMode?: boolean; // 개발 모드 여부
}

export default function LoginForm({ onSubmit, isDevMode = false }: LoginFormProps) {
  const [company, setCompany] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState(""); // 개발 모드: 이름
  const [realAge, setRealAge] = useState<number | "">(""); // 개발 모드: 실제 나이
  const [department, setDepartment] = useState(""); // 개발 모드: 부서
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false); // 개인정보 동의 체크 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 개인정보 동의 팝업 열림 상태
  
  const texts = [
    "지금 이 순간의 얼굴 나이, 과연 몇 살일까요?",
    "오늘의 얼굴 나이 랭킹! 1위하면 선물도 드려요!",
    "내가 동안일지 궁금하다면 바로 확인해보세요!",
    "생각보다 높게 나왔나요? 그냥 재미로 보는 결과니깐 걱정마세요!",
    "생각보다 어리게 나왔다면? 오늘 기분 좋은 날이네요!",
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // 타이핑 효과 - 주기적으로 반복
  useEffect(() => {
    let currentIndex = 0;
    const currentText = texts[currentTextIndex];
    
    // 타이핑 시작
    setIsTyping(true);
    setDisplayedText("");
    currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < currentText.length) {
        setDisplayedText(currentText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        // 타이핑 완료 후 3초 대기
        setIsTyping(false);
        clearInterval(typingInterval);
        
        setTimeout(() => {
          // 다음 텍스트로 이동
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }, 3000);
      }
    }, 90); // 90ms마다 한 글자씩

    return () => clearInterval(typingInterval);
  }, [currentTextIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (company && employeeId && isPrivacyAgreed) { // 개인정보 동의 체크 확인
      if (isDevMode) {
        // 개발 모드: 추가 필드 검증
        if (name && realAge && department) {
          onSubmit(company, employeeId, { name, realAge: Number(realAge), department });
        }
      } else {
        // 일반 모드: 기존 로직
        onSubmit(company, employeeId);
      }
    }
  };

  // 팝업에서 확인 버튼 클릭 시
  const handleDialogConfirm = () => {
    setIsPrivacyAgreed(true); // 체크박스 체크
    setIsDialogOpen(false); // 팝업 닫기
  };

  return (
    <div className="h-screen flex flex-col bg-black relative overflow-hidden">
      <MatrixBackground color="#26bfa6" opacity={0.5} />
      <div className="relative z-10">
        <EventHeader />
      </div>
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto relative z-10">
      <div className="w-full max-w-5xl">
        {/* 헤더 */}
        <div className="text-center mb-8 pt-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-16 h-16 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-6xl font-bold text-primary leading-none">[</span>
            <h1 className="text-6xl font-semibold text-white">AI가 보는 내 얼굴 나이</h1>
            <span className="text-6xl font-bold text-primary leading-none">]</span>
          </div>
          <p className="text-2xl text-gray-300 mt-6 min-h-[2.5rem]">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
        <div className="my-8" />
        {/* 폼 */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-2 bg-gray-900/90 border-gray-700">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xl font-medium text-gray-200">
                    회사명
                  </Label>
                  <Select value={company} onValueChange={setCompany} required>
                    <SelectTrigger
                      id="company"
                      className="h-16 text-xl bg-gray-800 border-gray-700 text-white"
                      data-testid="input-company"
                    >
                      <SelectValue placeholder="회사명을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="text-xl bg-gray-800 border-gray-700">
                      <SelectItem value="농심" className="text-xl text-white hover:bg-gray-700">농심</SelectItem>
                      <SelectItem value="율촌화학" className="text-xl text-white hover:bg-gray-700">율촌화학</SelectItem>
                      <SelectItem value="메가마트" className="text-xl text-white hover:bg-gray-700">메가마트</SelectItem>
                      <SelectItem value="농심태경" className="text-xl text-white hover:bg-gray-700">농심태경</SelectItem>
                      <SelectItem value="농심엔지니어링" className="text-xl text-white hover:bg-gray-700">농심엔지니어링</SelectItem>
                      <SelectItem value="엔디에스" className="text-xl text-white hover:bg-gray-700">엔디에스</SelectItem>
                      <SelectItem value="호텔농심" className="text-xl text-white hover:bg-gray-700">호텔농심</SelectItem>
                      <SelectItem value="농심캐피탈" className="text-xl text-white hover:bg-gray-700">농심캐피탈</SelectItem>
                      <SelectItem value="농심미분" className="text-xl text-white hover:bg-gray-700">농심미분</SelectItem>
                      <SelectItem value="농심홀딩스" className="text-xl text-white hover:bg-gray-700">농심홀딩스</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-xl font-medium text-gray-200">
                    사번
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="사번을 입력하세요"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-16 text-xl bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    data-testid="input-employee-id"
                    required
                  />
                </div>
                {/* 개발 모드: 추가 필드 */}
                {isDevMode && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xl font-medium text-gray-200">
                        이름
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="이름을 입력하세요"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-16 text-xl bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="realAge" className="text-xl font-medium text-gray-200">
                        실제 나이
                      </Label>
                      <Input
                        id="realAge"
                        type="number"
                        placeholder="실제 나이를 입력하세요"
                        value={realAge}
                        onChange={(e) => setRealAge(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-16 text-xl bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        min="1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-xl font-medium text-gray-200">
                        부서
                      </Label>
                      <Input
                        id="department"
                        type="text"
                        placeholder="부서를 입력하세요"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="h-16 text-xl bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="privacy-agreement"
                    checked={isPrivacyAgreed}
                    onCheckedChange={(checked) => {
                      // 체크되지 않은 상태에서 클릭 시 팝업 열기 (체크 상태는 변경하지 않음)
                      if (!isPrivacyAgreed && checked === true) {
                        setIsDialogOpen(true);
                        // 체크 상태는 팝업에서 확인 후 handleDialogConfirm에서 변경
                      }
                      // 체크된 상태에서 클릭 시 체크 해제
                      else if (isPrivacyAgreed && checked === false) {
                        setIsPrivacyAgreed(false);
                      }
                    }}
                    className="h-5 w-5"
                  />
                  <Label
                    htmlFor="privacy-agreement"
                    className="text-lg font-normal cursor-pointer text-gray-200"
                    onClick={(e) => {
                      // Label 클릭 시에도 동일한 동작
                      if (!isPrivacyAgreed) {
                        e.preventDefault();
                        setIsDialogOpen(true);
                      }
                    }}
                  >
                    개인정보 수집·이용 및 취급위탁 동의
                  </Label>
                </div>
                <div className="pt-2 flex justify-center">
                  <Button
                    type="submit"
                    className="h-16 px-12 text-xl font-medium min-w-64"
                    data-testid="button-submit"
                    disabled={!isPrivacyAgreed || (isDevMode && (!name || !realAge || !department))} // 개인정보 동의 체크 및 개발 모드 필드 검증
                  >
                    확인
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
      
      {/* 개인정보 활용 동의 팝업 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            개인정보 수집·이용 및 취급위탁 동의서
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm text-gray-300">
            DT FAIR 2025 AI체험존 운영을 위해 개인정보 수집·이용 동의를 요청드립니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          
          {/* 1. 수집·이용 동의 */}
          <div className="border border-gray-700 rounded-md p-4 space-y-2 bg-gray-800/50">
            <h3 className="font-semibold text-white">1. 개인정보 수집·이용 안내 및 동의</h3>
            
            <ul className="text-sm space-y-1 pl-3 list-disc text-gray-300">
              <li>수집·이용 목적: 행사 운영 및 AI 얼굴나이 측정 서비스 제공</li>
              <li>수집 항목: 성명, 회사명, 부서명, 사번, 생년월일</li>
              <li>보유·이용 기간: 행사 종료일(2025.11.28)까지 보유 후 즉시 파기</li>
            </ul>

            <div className="flex items-center space-x-4 pt-2">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input type="radio" name="useAgree" value="yes" defaultChecked className="cursor-pointer" />
                <span className="text-sm text-gray-300">동의함</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input type="radio" name="useAgree" value="no" className="cursor-pointer" />
                <span className="text-sm text-gray-300">동의하지 않음</span>
              </label>
            </div>
          </div>

          {/* 2. 취급위탁 동의 */}
          <div className="border border-gray-700 rounded-md p-4 space-y-2 bg-gray-800/50">
            <h3 className="font-semibold text-white">2. 개인정보 취급위탁 안내 및 동의</h3>

            <ul className="text-sm space-y-1 pl-3 list-disc text-gray-300">
              <li>제공 목적: 행사 운영을 위한 시스템 관리</li>
              <li>제공 항목: 성명, 회사명, 부서명, 사번, 생년월일</li>
              <li>수탁자: DT FAIR 2025 운영 담당 조직(내부)</li>
              <li>보유·이용 기간: 행사 종료일(2025.11.28)까지 보유 후 즉시 파기</li>
            </ul>

            <div className="flex items-center space-x-4 pt-2">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input type="radio" name="consignAgree" value="yes" defaultChecked className="cursor-pointer" />
                <span className="text-sm text-gray-300">동의함</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input type="radio" name="consignAgree" value="no" className="cursor-pointer" />
                <span className="text-sm text-gray-300">동의하지 않음</span>
              </label>
            </div>
          </div>

        </div>
    <DialogFooter>
      <Button onClick={handleDialogConfirm} className="h-12 px-8 text-lg">
        확인
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      

    </div>
  );
}
