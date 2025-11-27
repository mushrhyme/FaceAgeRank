/**
 * 사운드 재생을 위한 유틸리티 클래스
 */
class SoundManager {
  private audioContextActivated: boolean = false; // 오디오 컨텍스트 활성화 여부

  /**
   * 오디오 컨텍스트 활성화 (사파리 등 브라우저 호환성을 위해)
   * 사용자 상호작용 후 한 번 호출하면 이후 오디오 재생이 가능해집니다
   */
  activateAudioContext(): void {
    if (this.audioContextActivated) return;
    
    try {
      // 무음 오디오를 생성하여 재생하여 오디오 컨텍스트 활성화
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=');
      silentAudio.volume = 0.01;
      silentAudio.play()
        .then(() => {
          this.audioContextActivated = true;
          silentAudio.pause();
          silentAudio.remove();
        })
        .catch(() => {
          // 실패해도 계속 진행 (일부 브라우저에서는 실패할 수 있음)
        });
    } catch (error) {
      // 에러 무시
    }
  }

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
      // 오디오 컨텍스트가 활성화되지 않았다면 활성화 시도
      if (!this.audioContextActivated) {
        this.activateAudioContext();
      }
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
  MATRIX: '/sounds/matrix.mp3',       // 로그인 폼 배경음악
} as const;


