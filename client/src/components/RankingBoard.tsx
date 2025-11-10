import { useQuery } from "@tanstack/react-query";
import { Trophy, RefreshCw } from "lucide-react";
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

interface RankingData {
  company: string;        // 회사명
  employeeId: string;     // 사번
  name: string;           // 이름
  realAge: number;        // 실제 나이
  faceAge: number;        // 얼굴 나이
  ageDifference: number;  // 나이 차이 (실제 나이 - 얼굴 나이)
  completedAt: string;    // 분석 완료 시각
}

export default function RankingBoard() {
  // 랭킹 데이터 조회 (5초마다 자동 갱신)
  const { data: rankingData = [], isLoading, refetch } = useQuery<RankingData[]>({
    queryKey: ["/api/ranking"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/ranking");
      return await response.json();
    },
    refetchInterval: 5000, // 5초마다 자동 갱신
    refetchOnWindowFocus: true, // 창 포커스 시 갱신
  });

  // 순위 표시 (1위, 2위, 3위는 특별 스타일)
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return <Badge className="bg-yellow-500 text-white">🥇 1위</Badge>;
    }
    if (rank === 2) {
      return <Badge className="bg-gray-400 text-white">🥈 2위</Badge>;
    }
    if (rank === 3) {
      return <Badge className="bg-orange-400 text-white">🥉 3위</Badge>;
    }
    return <span className="text-muted-foreground">{rank}위</span>;
  };

  // 나이 차이에 따른 메시지
  const getAgeDifferenceMessage = (ageDifference: number) => {
    if (ageDifference > 0) {
      return (
        <span className="text-primary font-semibold">
          {ageDifference}살 동안
        </span>
      );
    } else if (ageDifference < 0) {
      return (
        <span className="text-muted-foreground">
          {Math.abs(ageDifference)}살 노안
        </span>
      );
    }
    return <span className="text-muted-foreground">동일</span>;
  };

  return (
    <div className="h-screen flex flex-col p-8 bg-background">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4">
          <Trophy className="w-16 h-16 text-primary" />
        </div>
        <h1 className="text-6xl font-bold mb-4">랭킹보드</h1>
        <p className="text-2xl text-muted-foreground">
          얼굴 나이 분석 결과 순위
        </p>
        <div className="mt-4">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">순위</TableHead>
                  <TableHead className="w-32">이름</TableHead>
                  <TableHead className="w-32">회사</TableHead>
                  <TableHead className="w-24 text-center">실제 나이</TableHead>
                  <TableHead className="w-24 text-center">얼굴 나이</TableHead>
                  <TableHead className="w-32 text-center">나이 차이</TableHead>
                  <TableHead className="w-40">분석 완료 시각</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.map((item, index) => (
                  <TableRow key={`${item.company}-${item.employeeId}-${item.completedAt}`}>
                    <TableCell className="text-center">
                      {getRankBadge(index + 1)}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.company}</TableCell>
                    <TableCell className="text-center">{item.realAge}살</TableCell>
                    <TableCell className="text-center text-primary font-semibold">
                      {item.faceAge}살
                    </TableCell>
                    <TableCell className="text-center">
                      {getAgeDifferenceMessage(item.ageDifference)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.completedAt}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
    </div>
  );
}

