/*
 Sign Language Service (MVP)
 - Uses MediaPipe Hands to detect hands and returns a very simple inferred text stream
 - This MVP focuses on wiring, camera lifecycle, and a minimal landmark-to-text heuristic
 - You can upgrade the recognizer later with a TFJS model or fingerpose gesture sets
*/

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as tf from '@tensorflow/tfjs';

// MediaPipe modules are shipped as global-friendly packages; types are limited, so we use any
// Lazy import to avoid SSR issues
let HandsModule: any;
let CameraUtils: any;
let Fingerpose: any;

export type SignUpdateHandler = (partialText: string, debug?: { landmarks?: Array<{x:number;y:number}> }) => void;

export interface SignServiceConfig {
  maxNumHands?: number;
  detectionConfidence?: number;
  trackingConfidence?: number;
}

class SignLanguageService {
  private hands: any | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private animationHandle: number | null = null;
  private isRunning = false;
  private onUpdate: SignUpdateHandler | null = null;
  private textBuffer: string[] = [];
  private lastEmissionTs = 0;
  private predictionsWindow: string[] = [];
  private lastCommitted = '';
  private stableFrames = 6; // frames needed to commit a letter
  private windowSize = 10;

  // Simple motion tracker for dynamic letters
  private trail: Array<{ x: number; y: number; t: number }> = [];
  private maxTrail = 12;
  private config: Required<SignServiceConfig> = {
    maxNumHands: 1,
    detectionConfidence: 0.6,
    trackingConfidence: 0.6,
  };

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices && !!window; 
  }

  async init(config?: SignServiceConfig): Promise<void> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Set webgl backend for speed; ignore if not available
    try {
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
        await tf.ready();
      }
    } catch (_) {
      // noop
    }

    if (!HandsModule) {
      // Dynamic imports
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      HandsModule = await import('@mediapipe/hands');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      CameraUtils = await import('@mediapipe/camera_utils');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Fingerpose = await import('fingerpose');
    }

    // Create hands instance
    const { Hands } = HandsModule;
    this.hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    this.hands.setOptions({
      maxNumHands: this.config.maxNumHands,
      modelComplexity: 1,
      minDetectionConfidence: this.config.detectionConfidence,
      minTrackingConfidence: this.config.trackingConfidence,
    });

    this.hands.onResults((results: any) => {
      this.handleResults(results);
      const lms = results.multiHandLandmarks && results.multiHandLandmarks[0];
      if (this.onUpdate) {
        this.onUpdate(this.textBuffer.join(''), { landmarks: lms });
      }
    });
  }

  async start(videoEl: HTMLVideoElement, onUpdate: SignUpdateHandler): Promise<void> {
    if (!this.isSupported()) throw new Error('Sign language not supported in this browser');
    if (!this.hands) await this.init();

    this.videoEl = videoEl;
    this.onUpdate = onUpdate;
    this.textBuffer = [];
    this.lastEmissionTs = performance.now();
    this.predictionsWindow = [];
    this.lastCommitted = '';
    this.trail = [];

    // Start camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    this.videoEl.srcObject = stream;
    await this.videoEl.play();

    this.isRunning = true;
    const processFrame = async () => {
      if (!this.isRunning || !this.videoEl) return;
      await this.hands!.send({ image: this.videoEl });
      this.animationHandle = requestAnimationFrame(processFrame);
    };
    this.animationHandle = requestAnimationFrame(processFrame);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationHandle) cancelAnimationFrame(this.animationHandle);
    this.animationHandle = null;
    if (this.videoEl && this.videoEl.srcObject) {
      const tracks = (this.videoEl.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      this.videoEl.srcObject = null;
    }
    this.videoEl = null;
  }

  reset(): void {
    this.textBuffer = [];
    this.emit();
  }

  private handleResults(results: any): void {
    const now = performance.now();
    const hasHand = Array.isArray(results.multiHandLandmarks) && results.multiHandLandmarks.length > 0;

    // Use fingerpose static classifier across ASL set (MVP coverage); fallback to minimal heuristic
    if (hasHand) {
      const lm = results.multiHandLandmarks[0];
      let letter = '';

      try {
        const { GestureEstimator } = Fingerpose;
        const { getASLGestures } = require('./asl/gestures');
        const estimator = new GestureEstimator(getASLGestures());
        const estimation = estimator.estimate(lm, 7.5);
        if (estimation.gestures && estimation.gestures.length > 0) {
          // pick highest score
          estimation.gestures.sort((a: any, b: any) => b.score - a.score);
          letter = estimation.gestures[0].name;
        }
      } catch (_) {
        // fallback minimal heuristic
        const indexTip = lm[8];
        const indexPip = lm[6];
        const middleTip = lm[12];
        const middlePip = lm[10];
        const ringTip = lm[16];
        const ringPip = lm[14];
        const pinkyTip = lm[20];
        const pinkyPip = lm[18];

        const isIndexExtended = indexTip.y < indexPip.y;
        const isMiddleFolded = middleTip.y > middlePip.y;
        const isRingFolded = ringTip.y > ringPip.y;
        const isPinkyFolded = pinkyTip.y > pinkyPip.y;
        if (isIndexExtended && isMiddleFolded && isRingFolded && isPinkyFolded) {
          letter = 'I';
        } else if (!isIndexExtended && !isMiddleFolded && !isRingFolded && !isPinkyFolded) {
          letter = 'B';
        }
      }

      // Track motion for dynamic letters J/Z (very coarse)
      const indexTip = lm[8];
      const pinkyTip = lm[20];
      this.trail.push({ x: indexTip.x, y: indexTip.y, t: now });
      if (this.trail.length > this.maxTrail) this.trail.shift();
      const dx = this.trail.length >= 2 ? this.trail[this.trail.length - 1].x - this.trail[0].x : 0;
      const dy = this.trail.length >= 2 ? this.trail[this.trail.length - 1].y - this.trail[0].y : 0;
      const distance = Math.hypot(dx, dy);
      if (!letter) {
        // Heuristic J: pinky up previously (I-like) and downward swoop
        const pinkyUp = pinkyTip.y < lm[18].y;
        if (pinkyUp && dy > 0.08 && distance > 0.1) {
          letter = 'J';
        }
        // Heuristic Z: index drawing zigzag horizontal magnitude
        if (!letter && Math.abs(dx) > 0.12 && Math.abs(dy) > 0.05) {
          letter = 'Z';
        }
      }

      // Smoothing window and stable commit
      if (letter) {
        this.predictionsWindow.push(letter);
        if (this.predictionsWindow.length > this.windowSize) this.predictionsWindow.shift();
        const majority = this.majorityVote(this.predictionsWindow);
        const stability = this.predictionsWindow.filter((l) => l === majority).length;
        if (majority && stability >= this.stableFrames) {
          // Commit only if different from last committed (or timeout)
          if (this.lastCommitted !== majority || now - this.lastEmissionTs > 700) {
            this.textBuffer.push(majority);
            this.lastCommitted = majority;
            this.lastEmissionTs = now;
            this.predictionsWindow = [];
            this.emit();
          }
        }
      }
    } else {
      // If no hand for a while, insert space (word boundary)
      if (now - this.lastEmissionTs > 1200 && this.textBuffer[this.textBuffer.length - 1] !== ' ') {
        this.textBuffer.push(' ');
        this.lastEmissionTs = now;
        this.emit();
      }
      this.predictionsWindow = [];
      this.trail = [];
    }
  }

  private emit(): void {
    if (this.onUpdate) this.onUpdate(this.textBuffer.join(''));
  }

  private majorityVote(arr: string[]): string {
    const counts: Record<string, number> = {};
    for (const a of arr) counts[a] = (counts[a] || 0) + 1;
    let best = '';
    let max = 0;
    for (const [k, v] of Object.entries(counts)) {
      if (v > max) {
        max = v; best = k;
      }
    }
    return best;
  }
}

export const signLanguageService = new SignLanguageService();
export type { SignLanguageService };


