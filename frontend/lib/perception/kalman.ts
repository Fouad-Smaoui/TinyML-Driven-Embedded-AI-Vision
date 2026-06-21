/**
 * Constant-velocity Kalman filter for smoothing a tracked point's position.
 *
 * This is a line-for-line port of `perception/tracking.py`'s use of
 * `cv2.KalmanFilter(4, 2)`: state = [x, y, vx, vy], measurement = [x, y],
 * same transition/measurement matrices and noise covariances. It implements
 * OpenCV's predict/correct equations directly (no matrix library — at 4x4
 * this is cheaper and more inspectable than a dependency).
 */

export interface Point2D {
  x: number;
  y: number;
}

type Mat = number[][];
type Vec = number[];

function identity(n: number): Mat {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}

function scaledIdentity(n: number, scale: number): Mat {
  return identity(n).map((row) => row.map((v) => v * scale));
}

function transpose(a: Mat): Mat {
  return a[0].map((_, col) => a.map((row) => row[col]));
}

function matMul(a: Mat, b: Mat): Mat {
  const rows = a.length;
  const inner = b.length;
  const cols = b[0].length;
  const result: Mat = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) {
    for (let k = 0; k < inner; k++) {
      const aik = a[i][k];
      if (aik === 0) continue;
      for (let j = 0; j < cols; j++) {
        result[i][j] += aik * b[k][j];
      }
    }
  }
  return result;
}

function matVec(a: Mat, v: Vec): Vec {
  return a.map((row) => row.reduce((sum, value, i) => sum + value * v[i], 0));
}

function matAdd(a: Mat, b: Mat): Mat {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}

function matSub(a: Mat, b: Mat): Mat {
  return a.map((row, i) => row.map((v, j) => v - b[i][j]));
}

/** Closed-form inverse of a 2x2 matrix (the innovation covariance is always 2x2 here). */
function invert2x2(m: Mat): Mat {
  const [[a, b], [c, d]] = m;
  const det = a * d - b * c;
  if (det === 0) {
    throw new Error("Singular innovation covariance — cannot invert");
  }
  const invDet = 1 / det;
  return [
    [d * invDet, -b * invDet],
    [-c * invDet, a * invDet],
  ];
}

// Same constants as perception/tracking.py's FaceTracker.__init__.
const TRANSITION_MATRIX: Mat = [
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];
const MEASUREMENT_MATRIX: Mat = [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
];
const PROCESS_NOISE_COV = scaledIdentity(4, 0.03);
const MEASUREMENT_NOISE_COV = scaledIdentity(2, 1.0);

export class FaceTracker {
  private statePost: Vec = [0, 0, 0, 0];
  private errorCovPost: Mat = identity(4);
  private statePre: Vec = [0, 0, 0, 0];
  private errorCovPre: Mat = identity(4);

  /** state'(k) = A * state(k); P'(k) = A * P(k) * A^T + Q */
  predict(): Point2D {
    const a = TRANSITION_MATRIX;
    this.statePre = matVec(a, this.statePost);

    const ap = matMul(a, this.errorCovPost);
    const apat = matMul(ap, transpose(a));
    this.errorCovPre = matAdd(apat, PROCESS_NOISE_COV);

    // Mirrors OpenCV: predict() seeds post-state/cov so a correct() that
    // never arrives still leaves the filter in a sensible state.
    this.statePost = [...this.statePre];
    this.errorCovPost = this.errorCovPre.map((row) => [...row]);

    return { x: this.statePre[0], y: this.statePre[1] };
  }

  /**
   * K(k) = P'(k) * H^T * inv(H * P'(k) * H^T + R)
   * state(k) = state'(k) + K(k) * (measurement - H * state'(k))
   * P(k) = P'(k) - K(k) * H * P'(k)
   */
  correct(x: number, y: number): Point2D {
    const h = MEASUREMENT_MATRIX;
    const measurement = [x, y];

    const hp = matMul(h, this.errorCovPre); // 2x4
    const hpht = matMul(hp, transpose(h)); // 2x2
    const innovationCov = matAdd(hpht, MEASUREMENT_NOISE_COV); // 2x2
    const innovationCovInv = invert2x2(innovationCov);

    const pht = matMul(this.errorCovPre, transpose(h)); // 4x2
    const gain = matMul(pht, innovationCovInv); // 4x2 Kalman gain

    const predictedMeasurement = matVec(h, this.statePre); // 2
    const innovation = [
      measurement[0] - predictedMeasurement[0],
      measurement[1] - predictedMeasurement[1],
    ];

    const correction = matVec(gain, innovation); // 4
    this.statePost = this.statePre.map((v, i) => v + correction[i]);

    const gainH = matMul(gain, h); // 4x4
    const gainHP = matMul(gainH, this.errorCovPre); // 4x4
    this.errorCovPost = matSub(this.errorCovPre, gainHP);

    return { x: this.statePost[0], y: this.statePost[1] };
  }
}
