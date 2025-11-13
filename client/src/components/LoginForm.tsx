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
    <div className="h-screen flex flex-col bg-background relative">
      <EventHeader />
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-5xl">
        {/* 헤더 */}
        <div className="text-center mb-8 pt-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-16 h-16 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-6xl font-bold text-primary leading-none">[</span>
            <h1 className="text-6xl font-semibold">AI 얼굴 나이 측정</h1>
            <span className="text-6xl font-bold text-primary leading-none">]</span>
          </div>
          <p className="text-2xl text-muted-foreground mt-6 min-h-[2.5rem]">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
        <div className="my-8" />
        {/* 폼 */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-2">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xl font-medium">
                    회사명
                  </Label>
                  <Select value={company} onValueChange={setCompany} required>
                    <SelectTrigger
                      id="company"
                      className="h-16 text-xl"
                      data-testid="input-company"
                    >
                      <SelectValue placeholder="회사명을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="text-xl">
                      <SelectItem value="농심" className="text-xl">농심</SelectItem>
                      <SelectItem value="율촌화학" className="text-xl">율촌화학</SelectItem>
                      <SelectItem value="메가마트" className="text-xl">메가마트</SelectItem>
                      <SelectItem value="농심태경" className="text-xl">농심태경</SelectItem>
                      <SelectItem value="농심엔지니어링" className="text-xl">농심엔지니어링</SelectItem>
                      <SelectItem value="엔디에스" className="text-xl">엔디에스</SelectItem>
                      <SelectItem value="호텔농심" className="text-xl">호텔농심</SelectItem>
                      <SelectItem value="농심캐피탈" className="text-xl">농심캐피탈</SelectItem>
                      <SelectItem value="농심미분" className="text-xl">농심미분</SelectItem>
                      <SelectItem value="농심홀딩스" className="text-xl">농심홀딩스</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-xl font-medium">
                    사번
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="사번을 입력하세요"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-16 text-xl"
                    data-testid="input-employee-id"
                    required
                  />
                </div>
                {/* 개발 모드: 추가 필드 */}
                {isDevMode && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xl font-medium">
                        이름
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="이름을 입력하세요"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-16 text-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="realAge" className="text-xl font-medium">
                        실제 나이
                      </Label>
                      <Input
                        id="realAge"
                        type="number"
                        placeholder="실제 나이를 입력하세요"
                        value={realAge}
                        onChange={(e) => setRealAge(e.target.value === "" ? "" : Number(e.target.value))}
                        className="h-16 text-xl"
                        min="1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-xl font-medium">
                        부서
                      </Label>
                      <Input
                        id="department"
                        type="text"
                        placeholder="부서를 입력하세요"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="h-16 text-xl"
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
                    className="text-lg font-normal cursor-pointer"
                    onClick={(e) => {
                      // Label 클릭 시에도 동일한 동작
                      if (!isPrivacyAgreed) {
                        e.preventDefault();
                        setIsDialogOpen(true);
                      }
                    }}
                  >
                    개인정보 활용 동의
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
      <Footer />
      
      {/* 개인정보 활용 동의 팝업 */}
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-2xl font-bold">개인정보 수집·이용 동의서</DialogTitle>
      <DialogDescription className="text-base pt-3 leading-relaxed">
        본 동의서는 DT FAIR 2025 AI체험존 운영을 위해 개인정보를 수집·이용하는 데 필요한 내용을 안내하기 위한 문서입니다.
        내용을 확인하신 후 동의 여부를 선택해 주세요.
      </DialogDescription>
    </DialogHeader>

    <div className="py-6 text-base leading-relaxed space-y-6">

      {/* 제1조 */}
      <section className="space-y-3 pt-4 border-t border-border/50 first:border-t-0 first:pt-0">
        <h3 className="text-lg font-semibold text-foreground pb-2">제1조(수집하는 개인정보 항목)</h3>
        <div className="ml-2 text-muted-foreground space-y-2 pl-4 border-l-2 border-primary/20">
          <p><span className="text-primary font-medium mr-1">•</span>성명</p>
          <p><span className="text-primary font-medium mr-1">•</span>회사명</p>
          <p><span className="text-primary font-medium mr-1">•</span>부서명</p>
          <p><span className="text-primary font-medium mr-1">•</span>사번</p>
          <p><span className="text-primary font-medium mr-1">•</span>생년월일</p>
        </div>
      </section>

      {/* 제2조 */}
      <section className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-lg font-semibold text-foreground pb-2">제2조(개인정보의 수집 및 이용 목적)</h3>
        <div className="ml-2 text-muted-foreground space-y-2 pl-4 border-l-2 border-primary/20">
          <p><span className="text-primary font-medium mr-1">①</span>AI 얼굴나이측정 서비스 제공</p>
          <p><span className="text-primary font-medium mr-1">②</span>행사 운영 및 체험 기능 제공</p>
        </div>
        <p className="text-sm text-muted-foreground italic ml-2 mt-3 pl-4">
          본 서비스 제공을 위해 필요한 최소한의 정보만 수집합니다.
        </p>
      </section>

      {/* 제3조 */}
      <section className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-lg font-semibold text-foreground pb-2">제3조(개인정보의 보유 및 이용 기간)</h3>
        <div className="ml-2 text-muted-foreground space-y-2 pl-4 border-l-2 border-primary/20">
          <p><span className="text-primary font-medium mr-1">①</span>DT FAIR 2025 행사 종료일(2025.11.28)에 즉시 파기</p>
          <p><span className="text-primary font-medium mr-1">②</span>관련 법령에 따른 별도 보관 의무 없음</p>
        </div>
      </section>

      {/* 제4조 */}
      <section className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-lg font-semibold text-foreground pb-2">제4조(개인정보의 제3자 제공)</h3>
        <p className="ml-2 text-muted-foreground pl-4 border-l-2 border-primary/20">
          수집한 개인정보는 외부 기관이나 업체에 제공되지 않습니다.
        </p>
      </section>

      {/* 제5조 */}
      <section className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-lg font-semibold text-foreground pb-2">제5조(개인정보 처리의 위탁)</h3>
        <div className="ml-2 text-muted-foreground space-y-2 pl-4 border-l-2 border-primary/20">
          <p><span className="text-primary font-medium mr-1">①</span>개인정보 처리 업무는 외부 업체에 위탁하지 않습니다.</p>
          <p><span className="text-primary font-medium mr-1">②</span>필요 시 법령에 따라 위탁 사실을 사전에 안내합니다.</p>
        </div>
      </section>

      {/* 제6조 */}
      <section className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-lg font-semibold text-foreground pb-2">제6조(정보주체의 권리 및 행사 방법)</h3>
        <div className="ml-2 text-muted-foreground space-y-2 pl-4 border-l-2 border-primary/20">
          <p><span className="text-primary font-medium mr-1">①</span>개인정보 열람 요청</p>
          <p><span className="text-primary font-medium mr-1">②</span>개인정보 정정 및 삭제 요청</p>
          <p><span className="text-primary font-medium mr-1">③</span>개인정보 처리 정지 요청</p>
          <p><span className="text-primary font-medium mr-1">④</span>수집·이용 동의 철회</p>
        </div>
        <p className="text-sm text-muted-foreground italic ml-2 mt-3 pl-4">
          동의 철회 시 서비스 이용이 제한될 수 있습니다.
        </p>
      </section>

      {/* 제7조 */}
      <section className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-lg font-semibold text-foreground pb-2">제7조(개인정보 보호 관련 문의)</h3>
        <div className="ml-2 text-muted-foreground space-y-1 pl-4 border-l-2 border-primary/20">
          <p className="font-medium">DT추진팀</p>
          <p>
            이메일:
            <a href="mailto:rollingbill@nongshim.com" className="text-primary hover:underline ml-1">
              rollingbill@nongshim.com
            </a>
          </p>
          <p>
            전화:
            <a href="tel:02-820-7108" className="text-primary hover:underline ml-1">
              02-820-7108
            </a>
          </p>
        </div>
      </section>

      {/* 제8조 */}
      <section className="space-y-3 pt-4 border-t border-border/50">
        <h3 className="text-lg font-semibold text-foreground pb-2">제8조(동의 거부 권리 및 불이익)</h3>
        <p className="ml-2 text-muted-foreground pl-4 border-l-2 border-primary/20">
          개인정보 수집·이용에 대한 동의를 거부할 수 있으나, 필수 정보 제공에 동의하지 않을 경우 서비스 이용이 제한됩니다.
        </p>
      </section>
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
