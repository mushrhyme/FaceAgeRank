import RankingBoard from "@RankingBoard";

// 노안 랭킹 표시 여부 제어 (환경변수로 설정 가능)
// VITE_SHOW_OLD_RANKING=true로 설정하면 노안 랭킹 포함 버전 사용
// VITE_SHOW_OLD_RANKING=false 또는 미설정 시 노안 랭킹 제외 버전 사용
const SHOW_OLD_RANKING = import.meta.env.VITE_SHOW_OLD_RANKING === "true";

export default function RankingPage() {
  // 환경변수에 따라 다른 랭킹보드 컴포넌트 사용
  if (SHOW_OLD_RANKING) {
    return <RankingBoard />; // 노안 랭킹 포함 버전
  }
  return <RankingBoard />; // 노안 랭킹 제외 버전
}

