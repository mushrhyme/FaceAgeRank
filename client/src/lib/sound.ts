/**
 * 사운드 재생을 위한 유틸리티 클래스
 */
class SoundManager {
  /**
   * 사운드 재생
   * @param soundPath 사운드 파일 경로 (public 폴더 기준)
   * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.7)
   * @returns Audio 객체 (정지 등 제어를 위해 반환)
   */
  play(soundPath: string, volume: number = 0.7): HTMLAudioElement | null {
    try {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audio.play().catch((error) => {
        // 브라우저 정책으로 인한 자동 재생 차단 시 무시
        console.warn(`사운드 재생 실패: ${soundPath}`, error);
      });
      return audio;
    } catch (error) {
      console.warn(`사운드 로드 실패: ${soundPath}`, error);
      return null;
    }
  }

  /**
   * 배경음악 재생 (반복 재생)
   * @param soundPath 사운드 파일 경로
   * @param volume 볼륨 (0.0 ~ 1.0, 기본값: 0.5)
   * @returns Audio 객체
   */
  playBackground(soundPath: string, volume: number = 0.5): HTMLAudioElement | null {
    try {
      const audio = new Audio(soundPath);
      audio.volume = volume;
      audio.loop = true; // 반복 재생
      audio.play().catch((error) => {
        console.warn(`배경음악 재생 실패: ${soundPath}`, error);
      });
      return audio;
    } catch (error) {
      console.warn(`배경음악 로드 실패: ${soundPath}`, error);
      return null;
    }
  }
}

// 싱글톤 인스턴스 생성
export const soundManager = new SoundManager();

// 사운드 파일 경로 상수
export const SOUNDS = {
  CAMERA: '/sounds/camera.mp3',      // 촬영 찰칵 소리
  DIGITAL: '/sounds/digital.mp3',   // 분석 중 배경음악
  WELCOME: '/sounds/welcome.mp3',   // 웰컴 화면 배경음악
  COUNTDOWN: '/sounds/countdown.mp3', // 카운트다운 효과음
  FIREWORK: '/sounds/firework.mp3',   // 동안일 때 효과음
  FAIL: '/sounds/fail.mp3',           // 노안일 때 효과음
} as const;


