import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Trophy, RefreshCw, Wifi, WifiOff, Gift, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";
import type { RankingData, RankedData } from "@shared/types";

export default function RankingBoardWithoutOld() {
  const [isSSEConnected, setIsSSEConnected] = useState(false); // SSE 연결 상태

  // Excel 시리얼 번호를 날짜 문자열로 변환하는 함수
  const convertExcelSerialToDateString = useCallback((value: any): string => {
    // 빈 값 처리
    if (value === null || value === undefined || value === "") {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 문자열인 경우 작은따옴표로 시작하면 제거 (구글 시트에서 텍스트로 저장된 경우)
    let processedValue = value;
    if (typeof value === "string" && value.startsWith("'")) {
      processedValue = value.substring(1);
    }

    // 이미 올바른 문자열 형식이면 그대로 반환
    if (typeof processedValue === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(processedValue)) {
      return processedValue;
    }

    // 숫자 형식이면 Excel 시리얼 번호로 간주하고 변환
    let serialNumber: number;
    if (typeof value === "number") {
      serialNumber = value;
    } else if (typeof processedValue === "string") {
      const parsed = parseFloat(processedValue);
      if (isNaN(parsed)) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      serialNumber = parsed;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // Excel 시리얼 번호를 JavaScript Date로 변환
    const excelEpoch = new Date(1899, 11, 30); // 1899년 12월 30일
    const days = Math.floor(serialNumber);
    const timeFraction = serialNumber - days;
    
    const date = new Date(excelEpoch);
    date.setDate(date.getDate() + days);
    
    const hours = Math.floor(timeFraction * 24);
    const minutes = Math.floor((timeFraction * 24 - hours) * 60);
    const seconds = Math.floor(((timeFraction * 24 - hours) * 60 - minutes) * 60);
    
    date.setHours(hours, minutes, seconds);

    // KST(UTC+9)로 변환
    const kstOffset = 9 * 60;
    const kstTime = new Date(date.getTime() + (kstOffset + date.getTimezoneOffset()) * 60000);
    
    const year = kstTime.getFullYear();
    const month = String(kstTime.getMonth() + 1).padStart(2, "0");
    const day = String(kstTime.getDate()).padStart(2, "0");
    const hoursStr = String(kstTime.getHours()).padStart(2, "0");
    const minutesStr = String(kstTime.getMinutes()).padStart(2, "0");
    const secondsStr = String(kstTime.getSeconds()).padStart(2, "0");
    
    return `${year}-${month}-${day} ${hoursStr}:${minutesStr}:${secondsStr}`;
  }, []);

  // 랭킹 데이터 조회
  const { data: rawRankingData = [], isLoading, error, refetch } = useQuery<RankingData[]>({
    queryKey: ["/api/ranking"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/ranking");
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("❌ 랭킹 데이터 조회 실패:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true, // 창 포커스 시 갱신
  });

  // completedAt 필드를 변환하여 정규화된 데이터 생성
  const rankingData = useMemo(() => {
    return rawRankingData.map(item => ({
      ...item,
      completedAt: convertExcelSerialToDateString(item.completedAt), // Excel 시리얼 번호 변환
    }));
  }, [rawRankingData, convertExcelSerialToDateString]);

  // SSE 연결 및 이벤트 처리
  useEffect(() => {
    const eventSource = new EventSource("/api/ranking/stream");

    // 연결 성공 이벤트
    eventSource.addEventListener("connected", () => {
      setIsSSEConnected(true);
    });

    // 랭킹 갱신 이벤트
    eventSource.addEventListener("ranking-updated", () => {
      refetch(); // 데이터 갱신
    });

    // 에러 처리
    eventSource.onerror = (error) => {
      console.error("❌ SSE 연결 오류:", error);
      setIsSSEConnected(false);
      // 연결이 끊어지면 자동으로 재연결 시도 (EventSource가 자동으로 재연결)
    };

    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      eventSource.close();
      setIsSSEConnected(false);
    };
  }, [refetch]);

  // 데이터를 동안 랭킹으로만 필터링하고 정렬 및 순위 계산 (노안 랭킹 제외)
  const youngRanking = useMemo(() => {
    if (!rankingData || rankingData.length === 0) {
      return [];
    }

    // 동안랭킹만: ageDifference <= 0 (얼굴 나이가 실제 나이보다 작거나 같음)
    const youngData = rankingData.filter(item => item.ageDifference <= 0);

    // 정렬 함수: 절댓값 기준 내림차순, 동점이면 최신순 (completedAt 내림차순)
    const sortByAgeDifference = (a: RankingData, b: RankingData) => {
      const absA = Math.abs(a.ageDifference);
      const absB = Math.abs(b.ageDifference);
      
      if (absA !== absB) {
        return absB - absA; // 절댓값 내림차순
      }
      // 동점이면 최신순 (completedAt 내림차순)
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    };

    // 정렬
    youngData.sort(sortByAgeDifference);

    // 순위 계산 함수 (동점 처리 포함)
    const calculateRanks = (data: RankingData[]): RankedData[] => {
      if (data.length === 0) return [];
      
      const ranked: RankedData[] = [];
      let currentRank = 1;
      let previousAgeDiff: number | null = null;
      
      for (let i = 0; i < data.length; i++) {
        const absAgeDiff = Math.abs(data[i].ageDifference);
        
        // 이전 값과 다르면 순위 업데이트
        if (previousAgeDiff !== null && absAgeDiff !== previousAgeDiff) {
          currentRank = i + 1;
        }
        
        ranked.push({
          ...data[i],
          rank: currentRank,
        });
        
        previousAgeDiff = absAgeDiff;
      }
      
      return ranked;
    };

    const ranked = calculateRanks(youngData);
    
    // 10위까지만 필터링 (동점 포함)
    return ranked.filter(item => item.rank <= 10);
  }, [rankingData]);

  // 순위 표시 (1위, 2위, 3위는 특별 스타일, 모든 순위 카드 크기 일정하게)
  const getRankBadge = (rank: number) => {
    const commonStyle = "w-[100px] h-[50px] inline-flex items-center justify-center text-2xl font-bold";
    if (rank === 1) {
      return <Badge className={`bg-yellow-500 text-white ${commonStyle}`}>🥇 1위</Badge>;
    }
    if (rank === 2) {
      return <Badge className={`bg-gray-400 text-white ${commonStyle}`}>🥈 2위</Badge>;
    }
    if (rank === 3) {
      return <Badge className={`bg-orange-400 text-white ${commonStyle}`}>🥉 3위</Badge>;
    }
    return <span className={`text-muted-foreground ${commonStyle}`}>{rank}위</span>;
  };

  // 나이 차이에 따른 메시지 (얼굴 나이 - 실제 나이)
  const getAgeDifferenceMessage = (ageDifference: number) => {
    if (ageDifference > 0) {
      // 양수: 얼굴 나이 > 실제 나이
      return (
        <span className="text-gray-600 font-bold text-3xl">
          +{ageDifference}
        </span>
      );
    } else if (ageDifference < 0) {
      // 음수: 얼굴 나이 < 실제 나이
      return (
        <span className="text-blue-600 font-bold text-3xl">
          {ageDifference}
        </span>
      );
    }
    return <span className="text-muted-foreground text-2xl">0</span>;
  };

  return (
    <div className="h-screen flex flex-col bg-background relative">
      {/* <EventHeader /> */}
      <div className="flex-1 overflow-y-auto p-6">
      {/* 헤더 */}
      
      <div className="text-center mb-6">
        {/* 명예의 전당 제목 */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 mx-auto mb-3">
          <Trophy className="w-16 h-16 text-yellow-500" />
        </div>
        {/* <h1 className="text-5xl font-bold mb-6">명예의 전당</h1>
        <p className="text-xl text-muted-foreground">
          얼굴 나이와 실제 나이 차이가 클수록 선물 당첨 기회가 올라갑니다!
        </p> */}
        <div className="mb-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-pink-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-yellow-600 animate-pulse" />
              <h2 className="text-3xl font-bold text-yellow-700">🎁 이벤트 안내</h2>
              <Sparkles className="w-8 h-8 text-yellow-600 animate-pulse" />
            </div>
            {/* 참여 제한 안내 */}
            <div className="mt-6 text-center">
              <p className="text-base text-gray-600 font-medium">
              본 프로그램 체험 시 1인 1회 참여로 자동 집계됩니다.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white/80 rounded-xl p-5 border-2 border-yellow-400 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-yellow-700">1위 선물</h3>
                </div>
                <p className="text-lg text-gray-700 font-semibold">
                  가장 높은 순위를 달성한 <span className="text-yellow-600 text-2xl">1명</span>에게<br />
                  선물을 드립니다!
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-5 border-2 border-purple-400 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <h3 className="text-xl font-bold text-purple-700">랜덤 선물</h3>
                </div>
                <p className="text-lg text-gray-700 font-semibold">
                 참여자 중 <span className="text-purple-600 text-2xl">3명</span>을 추첨하여 선물을 드립니다.
                  <br />
                  참여만 해도 당첨 기회가 생겨요!
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>데이터 로딩 오류</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "랭킹 데이터를 불러오는 중 오류가 발생했습니다."}
            <br />
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 랭킹 테이블 - 동안 랭킹만 표시 (1열 레이아웃) */}
      <div className="flex-1 overflow-hidden flex justify-center px-6">
        {/* 동안 랭킹 */}
        <Card className="overflow-hidden max-w-5xl w-full">
          <div className="h-full flex flex-col">
            <div className="bg-blue-100 px-4 py-3 border-b">
              <h2 className="text-3xl font-bold text-blue-700 text-center">명예의 전당</h2>
              <p className="text-sm text-blue-600 text-center mt-1">오늘 더 어려 보이게 나온 분들이에요! 축하드립니다~</p>
            </div>
            <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
                <p className="text-xl text-muted-foreground">랭킹 데이터를 불러오는 중...</p>
              </div>
            </div>
              ) : youngRanking.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-2xl text-muted-foreground">아직 랭킹 데이터가 없습니다</p>
              </div>
            </div>
          ) : (
            <Table className="text-xl">
              <TableHeader>
                <TableRow className="bg-muted/50">
                      <TableHead className="w-8 text-center text-2xl font-bold py-3">순위</TableHead>
                      <TableHead className="w-16 text-2xl font-bold py-3">이름</TableHead>
                      <TableHead className="w-20 text-2xl font-bold py-3">회사</TableHead>
                  <TableHead className="w-20 text-2xl font-bold py-3">부서명</TableHead>
                  <TableHead className="w-20 text-center text-2xl font-bold py-3">나이 차이</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                    {youngRanking.map((item, index) => (
                    <TableRow 
                        key={`young-${item.company}-${item.employeeId}-${item.completedAt}`}
                        className="bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500"
                        style={index === youngRanking.length - 1 ? { borderLeft: '4px solid rgb(59 130 246)' } : undefined}
                    >
                      <TableCell className="text-center py-3">
                        <div className="text-2xl font-bold">
                            {getRankBadge(item.rank)}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-2xl py-3">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xl py-3">{item.company}</TableCell>
                      <TableCell className="text-muted-foreground text-xl py-3">{item.department}</TableCell>
                      <TableCell className="text-center py-3">
                        {getAgeDifferenceMessage(item.ageDifference)}
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            {/* SSE 연결 상태 및 새로고침 버튼 - 랭킹 하단 */}
            <div className="border-t bg-blue-50 px-4 py-3 flex items-center justify-center gap-4">
              {/* SSE 연결 상태 표시 */}
              <div className="flex items-center gap-2">
                {isSSEConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">실시간 연결됨</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">연결 중...</span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                새로고침
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </div>
      <Footer />
    </div>
  );
}

