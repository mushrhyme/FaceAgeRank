/**
 * 나이 차이에 따른 결과 메시지를 계산하는 유틸 함수
 * @param ageDifference 얼굴 나이 - 실제 나이
 * @returns 결과 메시지
 */
export function getResultMessage(ageDifference: number): string {
  if (ageDifference < 0) {
    return "오늘 더 어려 보이세요!";
  } else if (ageDifference > 0) {
    return "오늘은 조금 진지하게 나오셨네요!";
  } else {
    return "실제 나이랑 딱 맞게 나오셨어요!";
  }
}

/**
 * 나이 차이에 따른 동안 여부를 계산하는 유틸 함수
 * @param ageDifference 얼굴 나이 - 실제 나이
 * @returns 동안 여부
 */
export function isYoungerLook(ageDifference: number): boolean {
  return ageDifference < 0;
}




