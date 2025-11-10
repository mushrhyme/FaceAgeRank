import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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

  // 순위 표시 (1위, 2위, 3위는 특별 스타일)
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Badge className="bg-yellow-500 text-white text-2xl px-4 py-2 min-w-[80px] inline-flex justify-center">🥇 1위</Badge>;
    }
    if (rank === 2) {
      return <Badge className="bg-gray-400 text-white text-2xl px-4 py-2 min-w-[80px] inline-flex justify-center">🥈 2위</Badge>;
    }
    if (rank === 3) {
      return <Badge className="bg-orange-400 text-white text-2xl px-4 py-2 min-w-[80px] inline-flex justify-center">🥉 3위</Badge>;
    }
    return <span className="text-muted-foreground text-2xl font-bold min-w-[80px] inline-block text-center">{rank}위</span>;
  };

  // 나이 차이에 따른 메시지
  const getAgeDifferenceMessage = (ageDifference: number) => {
    if (ageDifference > 0) {
      return (
        <span className="text-blue-600 font-bold text-3xl">
          +{ageDifference}
        </span>
      );
    } else if (ageDifference < 0) {
      return (
        <span className="text-red-600 font-bold text-3xl">
          {ageDifference}
        </span>
      );
    }
    return <span className="text-muted-foreground text-2xl">0</span>;
  };

  return (
    <div className="h-screen flex flex-col p-6 bg-background">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3">
          <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold mb-2">랭킹보드</h1>
        <p className="text-xl text-muted-foreground">
          실제 나이와 얼굴 나이가 많이 다를수록 높은 순위를 받습니다.
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
      <Card className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
                <p className="text-xl text-muted-foreground">랭킹 데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : rankingData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
                <p className="text-2xl text-muted-foreground">아직 랭킹 데이터가 없습니다</p>
                <p className="text-lg text-muted-foreground">
                  분석을 완료하면 랭킹이 표시됩니다
                </p>
              </div>
            </div>
          ) : (
            <Table className="text-xl">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-14 text-center text-2xl font-bold py-3">순위</TableHead>
                  <TableHead className="w-20 text-2xl font-bold py-3">이름</TableHead>
                  <TableHead className="w-16 text-2xl font-bold py-3">회사</TableHead>
                  <TableHead className="w-20 text-2xl font-bold py-3">부서명</TableHead>
                  <TableHead className="w-20 text-center text-2xl font-bold py-3">나이 차이</TableHead>
                  <TableHead className="w-16 text-center text-2xl font-bold py-3">실제 나이</TableHead>
                  <TableHead className="w-16 text-center text-2xl font-bold py-3">얼굴 나이</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.map((item, index) => {
                  const isOldFace = item.ageDifference < 0; // 노안인 경우
                  const isYoungFace = item.ageDifference > 0; // 동안인 경우
                  return (
                    <TableRow 
                      key={`${item.company}-${item.employeeId}-${item.completedAt}`}
                      className={
                        isOldFace 
                          ? "bg-red-50 hover:bg-red-100 border-l-4 border-l-red-500" 
                          : isYoungFace
                          ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500"
                          : "hover:bg-muted/30"
                      }
                    >
                      <TableCell className="text-center py-3">
                        <div className="text-2xl font-bold">
                          {getRankBadge(index + 1)}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-2xl py-3">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xl py-3">{item.company}</TableCell>
                      <TableCell className="text-muted-foreground text-xl py-3">{item.department}</TableCell>
                      <TableCell className="text-center py-3">
                        {getAgeDifferenceMessage(item.ageDifference)}
                      </TableCell>
                      <TableCell className="text-center text-2xl font-semibold py-3">{item.realAge}세</TableCell>
                      <TableCell className={`text-center text-2xl font-bold py-3 ${isOldFace ? "text-red-600" : isYoungFace ? "text-blue-600" : "text-primary"}`}>
                        {item.faceAge}세
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}

