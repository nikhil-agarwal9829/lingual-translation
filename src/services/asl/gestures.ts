import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose';

function addCurl(desc: GestureDescription, finger: Finger, curl: FingerCurl, weight = 1.0) {
  desc.addCurl(finger, curl, weight);
}
function addDir(desc: GestureDescription, finger: Finger, dir: FingerDirection, weight = 0.5) {
  desc.addDirection(finger, dir, weight);
}

// Utility to set same curl for all fingers
function all(desc: GestureDescription, curl: FingerCurl) {
  [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => addCurl(desc, f, curl));
}

// A: fist (all curled), thumb half curl
const A = new GestureDescription('A');
all(A, FingerCurl.FullCurl);
addCurl(A, Finger.Thumb, FingerCurl.HalfCurl, 1.0);

// B: open palm, thumb curled
const B = new GestureDescription('B');
[Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => {
  addCurl(B, f, FingerCurl.NoCurl, 1.0);
  addDir(B, f, FingerDirection.VerticalUp, 0.5);
});
addCurl(B, Finger.Thumb, FingerCurl.HalfCurl, 1.0);

// C: half curl all
const C = new GestureDescription('C');
all(C, FingerCurl.HalfCurl);

// D: index up, others curled
const D = new GestureDescription('D');
addCurl(D, Finger.Index, FingerCurl.NoCurl, 1.0);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => addCurl(D, f, FingerCurl.FullCurl, 1.0));
addCurl(D, Finger.Thumb, FingerCurl.HalfCurl, 0.75);

// E: all curled with tighter thumb
const E = new GestureDescription('E');
all(E, FingerCurl.FullCurl);
addCurl(E, Finger.Thumb, FingerCurl.FullCurl, 1.0);

// F: index + thumb form circle (approx: both half curl) others extended
const F = new GestureDescription('F');
addCurl(F, Finger.Index, FingerCurl.HalfCurl, 1.0);
addCurl(F, Finger.Thumb, FingerCurl.HalfCurl, 1.0);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => addCurl(F, f, FingerCurl.NoCurl, 0.75));

// G: index horizontal (approx: no curl sideways), others curled
const G = new GestureDescription('G');
addCurl(G, Finger.Index, FingerCurl.NoCurl, 1.0);
addDir(G, Finger.Index, FingerDirection.HorizontalLeft, 0.5);
addDir(G, Finger.Index, FingerDirection.HorizontalRight, 0.5);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => addCurl(G, f, FingerCurl.FullCurl, 1.0));
addCurl(G, Finger.Thumb, FingerCurl.NoCurl, 0.5);

// H: index + middle extended sideways
const H = new GestureDescription('H');
[Finger.Index, Finger.Middle].forEach(f => {
  addCurl(H, f, FingerCurl.NoCurl, 1.0);
  addDir(H, f, FingerDirection.HorizontalLeft, 0.5);
  addDir(H, f, FingerDirection.HorizontalRight, 0.5);
});
[Finger.Ring, Finger.Pinky].forEach(f => addCurl(H, f, FingerCurl.FullCurl, 1.0));

// I: pinky only
const I = new GestureDescription('I');
addCurl(I, Finger.Pinky, FingerCurl.NoCurl, 1.0);
[Finger.Index, Finger.Middle, Finger.Ring].forEach(f => addCurl(I, f, FingerCurl.FullCurl, 1.0));
addCurl(I, Finger.Thumb, FingerCurl.HalfCurl, 0.75);

// L: thumb + index extended
const L = new GestureDescription('L');
addCurl(L, Finger.Index, FingerCurl.NoCurl, 1.0);
addCurl(L, Finger.Thumb, FingerCurl.NoCurl, 1.0);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => addCurl(L, f, FingerCurl.FullCurl, 1.0));

// M: three middle fingers over thumb (approx: thumb full curl, index/middle/ring half, pinky no curl)
const M = new GestureDescription('M');
addCurl(M, Finger.Thumb, FingerCurl.FullCurl, 1.0);
[Finger.Index, Finger.Middle, Finger.Ring].forEach(f => addCurl(M, f, FingerCurl.HalfCurl, 1.0));
addCurl(M, Finger.Pinky, FingerCurl.NoCurl, 0.75);

// N: two fingers over thumb (approx)
const N = new GestureDescription('N');
addCurl(N, Finger.Thumb, FingerCurl.FullCurl, 1.0);
[Finger.Index, Finger.Middle].forEach(f => addCurl(N, f, FingerCurl.HalfCurl, 1.0));
[Finger.Ring, Finger.Pinky].forEach(f => addCurl(N, f, FingerCurl.NoCurl, 0.5));

// O: all curled half (tighter than C)
const O = new GestureDescription('O');
[Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => addCurl(O, f, FingerCurl.HalfCurl, 1.0));

// R: crossed index+middle (approx: both no curl, close directions), others curled
const R = new GestureDescription('R');
[Finger.Index, Finger.Middle].forEach(f => addCurl(R, f, FingerCurl.NoCurl, 1.0));
[Finger.Ring, Finger.Pinky].forEach(f => addCurl(R, f, FingerCurl.FullCurl, 1.0));
addCurl(R, Finger.Thumb, FingerCurl.HalfCurl, 0.75);

// S: fist with thumb outside
const S = new GestureDescription('S');
all(S, FingerCurl.FullCurl);
addCurl(S, Finger.Thumb, FingerCurl.HalfCurl, 1.0);

// T: fist with thumb between index-middle (approx full curl all, thumb half)
const T = new GestureDescription('T');
all(T, FingerCurl.FullCurl);
addCurl(T, Finger.Thumb, FingerCurl.HalfCurl, 1.0);

// U/V/W: two/three fingers up
const U = new GestureDescription('U');
[Finger.Index, Finger.Middle].forEach(f => addCurl(U, f, FingerCurl.NoCurl, 1.0));
[Finger.Ring, Finger.Pinky].forEach(f => addCurl(U, f, FingerCurl.FullCurl, 1.0));
addCurl(U, Finger.Thumb, FingerCurl.HalfCurl, 0.75);

const V = new GestureDescription('V');
[Finger.Index, Finger.Middle].forEach(f => addCurl(V, f, FingerCurl.NoCurl, 1.0));
[Finger.Ring, Finger.Pinky].forEach(f => addCurl(V, f, FingerCurl.FullCurl, 1.0));
addCurl(V, Finger.Thumb, FingerCurl.NoCurl, 0.5);

const W = new GestureDescription('W');
[Finger.Index, Finger.Middle, Finger.Ring].forEach(f => addCurl(W, f, FingerCurl.NoCurl, 1.0));
addCurl(W, Finger.Pinky, FingerCurl.FullCurl, 1.0);
addCurl(W, Finger.Thumb, FingerCurl.HalfCurl, 0.75);

// X: index curled, others curled
const X = new GestureDescription('X');
addCurl(X, Finger.Index, FingerCurl.HalfCurl, 1.0);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => addCurl(X, f, FingerCurl.FullCurl, 1.0));
addCurl(X, Finger.Thumb, FingerCurl.HalfCurl, 0.75);

// Y: thumb + pinky
const Y = new GestureDescription('Y');
addCurl(Y, Finger.Thumb, FingerCurl.NoCurl, 1.0);
addCurl(Y, Finger.Pinky, FingerCurl.NoCurl, 1.0);
[Finger.Index, Finger.Middle, Finger.Ring].forEach(f => addCurl(Y, f, FingerCurl.FullCurl, 1.0));

// P/Q (approximations similar to K with orientation; treat as K-like static here)
const P = new GestureDescription('P');
addCurl(P, Finger.Index, FingerCurl.NoCurl, 1.0);
addCurl(P, Finger.Middle, FingerCurl.HalfCurl, 1.0);
addCurl(P, Finger.Thumb, FingerCurl.NoCurl, 0.75);
[Finger.Ring, Finger.Pinky].forEach(f => addCurl(P, f, FingerCurl.FullCurl, 1.0));

const Q = new GestureDescription('Q');
addCurl(Q, Finger.Index, FingerCurl.NoCurl, 1.0);
addCurl(Q, Finger.Thumb, FingerCurl.NoCurl, 1.0);
[Finger.Middle, Finger.Ring, Finger.Pinky].forEach(f => addCurl(Q, f, FingerCurl.FullCurl, 1.0));

// K similar to V with thumb
const K = new GestureDescription('K');
addCurl(K, Finger.Index, FingerCurl.NoCurl, 1.0);
addCurl(K, Finger.Middle, FingerCurl.NoCurl, 1.0);
addCurl(K, Finger.Thumb, FingerCurl.NoCurl, 1.0);
[Finger.Ring, Finger.Pinky].forEach(f => addCurl(K, f, FingerCurl.FullCurl, 1.0));

export function getASLGestures(): GestureDescription[] {
  return [A,B,C,D,E,F,G,H,I,J_like(),K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z_like()];
}

// J and Z are dynamic letters; provide static placeholders (pinky or index traces motion). Here we reuse I/X.
function J_like(): GestureDescription { return I; }
function Z_like(): GestureDescription { return X; }


