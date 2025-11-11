import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { Trophy, RefreshCw, Wifi, WifiOff } from "lucide-react";
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

interface RankingData {
  company: string;        // 회사명
  employeeId: string;     // 사번
  name: string;           // 이름
  department: string;      // 부서명
  realAge: number;        // 실제 나이
  faceAge: number;        // 얼굴 나이
  ageDifference: number;  // 나이 차이 (실제 나이 - 얼굴 나이)
  completedAt: string;    // 분석 완료 시각
}

interface RankedData extends RankingData {
  rank: number;           // 순위 (동점 처리 포함)
}

export default function RankingBoard() {
  const [isSSEConnected, setIsSSEConnected] = useState(false); // SSE 연결 상태

  // 랭킹 데이터 조회
  const { data: rankingData = [], isLoading, error, refetch } = useQuery<RankingData[]>({
    queryKey: ["/api/ranking"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/ranking");
        const data = await response.json();
        console.log("📊 랭킹 데이터 조회 성공:", data);
        return data;
      } catch (error) {
        console.error("❌ 랭킹 데이터 조회 실패:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: true, // 창 포커스 시 갱신
  });

  // SSE 연결 및 이벤트 처리
  useEffect(() => {
    const eventSource = new EventSource("/api/ranking/stream");

    // 연결 성공 이벤트
    eventSource.addEventListener("connected", () => {
      setIsSSEConnected(true);
      console.log("✅ SSE 연결 성공");
    });

    // 랭킹 갱신 이벤트
    eventSource.addEventListener("ranking-updated", () => {
      console.log("📢 랭킹 갱신 알림 수신 - 데이터 새로고침");
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

  // 데이터를 동안/노안 랭킹으로 분리하고 정렬 및 순위 계산
  const { youngRanking, oldRanking } = useMemo(() => {
    if (!rankingData || rankingData.length === 0) {
      return { youngRanking: [], oldRanking: [] };
    }

    // 노안랭킹: ageDifference > 0 (얼굴 나이가 실제 나이보다 큼)
    const oldData = rankingData.filter(item => item.ageDifference > 0);
    // 동안랭킹: ageDifference <= 0 (얼굴 나이가 실제 나이보다 작거나 같음)
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
    oldData.sort(sortByAgeDifference);

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

    return {
      youngRanking: calculateRanks(youngData),
      oldRanking: calculateRanks(oldData),
    };
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
      <EventHeader />
      <div className="flex-1 overflow-y-auto p-6">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold mb-6">명예의 전당</h1>
        <p className="text-xl text-muted-foreground">
          얼굴 나이와 실제 나이 차이가 클수록 선물 당첨 기회가 올라갑니다!
        </p>
        <div className="mt-4 flex items-center gap-4 justify-center">
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

      {/* 랭킹 테이블 */}
      <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4 px-6">
        {/* 명예의 전당 */}
        <Card className="overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="bg-blue-100 px-4 py-3 border-b">
              <h2 className="text-3xl font-bold text-blue-700 text-center">동안 랭킹</h2>
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
          </div>
        </Card>

        {/* 노안 */}
        <Card className="overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="bg-gray-100 px-4 py-3 border-b">
              <h2 className="text-3xl font-bold text-gray-700 text-center">노안 랭킹</h2>
              <p className="text-sm text-gray-600 text-center mt-1">오늘은 조금 성숙하게 보였지만 걱정 마세요! 선물 기회는 그대로에요~</p>
            </div>
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-xl text-muted-foreground">랭킹 데이터를 불러오는 중...</p>
                  </div>
                </div>
              ) : oldRanking.length === 0 ? (
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
                    {oldRanking.map((item, index) => (
                      <TableRow 
                        key={`old-${item.company}-${item.employeeId}-${item.completedAt}`}
                        className="bg-gray-50 hover:bg-gray-100 border-l-4 border-l-gray-500"
                        style={index === oldRanking.length - 1 ? { borderLeft: '4px solid rgb(107 114 128)' } : undefined}
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
        </div>
      </Card>
      </div>
      </div>
      <Footer />
    </div>
  );
}

