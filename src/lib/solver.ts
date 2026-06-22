/**
 * 猜数字解题引擎
 * 规则：5位不重复数字，★=数字和位置都对，☆=数字对但位置不对
 */

export type Feedback = { bulls: number; cows: number };

/**
 * 计算猜测与密码之间的反馈
 */
export function calculateFeedback(guess: number[], secret: number[]): Feedback {
  let bulls = 0;
  let cows = 0;
  const secretRemaining: number[] = [];
  const guessRemaining: number[] = [];

  for (let i = 0; i < 5; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else {
      secretRemaining.push(secret[i]);
      guessRemaining.push(guess[i]);
    }
  }

  for (const g of guessRemaining) {
    const idx = secretRemaining.indexOf(g);
    if (idx !== -1) {
      cows++;
      secretRemaining.splice(idx, 1);
    }
  }

  return { bulls, cows };
}

/**
 * 生成所有可能的5位不重复数字组合（P(10,5) = 30240）
 */
export function generateAllCodes(): number[][] {
  const codes: number[][] = [];
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  function permute(current: number[], remaining: number[]): void {
    if (current.length === 5) {
      codes.push([...current]);
      return;
    }
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      const next = [...remaining.slice(0, i), ...remaining.slice(i + 1)];
      permute(current, next);
      current.pop();
    }
  }

  permute([], digits);
  return codes;
}

// 惰性生成所有可能的代码
let _allCodes: number[][] | null = null;

export function getAllCodes(): number[][] {
  if (!_allCodes) {
    _allCodes = generateAllCodes();
  }
  return _allCodes;
}

/**
 * 根据猜测和反馈过滤可能的密码
 */
export function filterPossibilities(
  possibilities: number[][],
  guess: number[],
  feedback: Feedback
): number[][] {
  return possibilities.filter((secret) => {
    const result = calculateFeedback(guess, secret);
    return result.bulls === feedback.bulls && result.cows === feedback.cows;
  });
}

/**
 * 计算一个猜测的评分（分区质量）
 * 评分越低越好（最大分区越小越好）
 */
function scoreGuess(
  guess: number[],
  possibilities: number[][]
): number {
  const partitions = new Map<string, number>();

  for (const secret of possibilities) {
    const fb = calculateFeedback(guess, secret);
    const key = `${fb.bulls}-${fb.cows}`;
    partitions.set(key, (partitions.get(key) || 0) + 1);
  }

  let maxSize = 0;
  for (const size of partitions.values()) {
    if (size > maxSize) maxSize = size;
  }

  return maxSize;
}

/**
 * 从剩余可能性中推荐最佳猜测
 * 策略：minimax - 选择最大分区最小的猜测
 * 优先从剩余可能性中选择（如果也是最优的话）
 */
export function suggestGuess(possibilities: number[][]): number[] {
  if (possibilities.length === 0) return [0, 1, 2, 3, 4];
  if (possibilities.length === 1) return possibilities[0];
  if (possibilities.length <= 2) return possibilities[0];

  // 当可能性较少时，遍历所有可能性寻找最优
  // 当可能性较多时，采样候选集
  let candidates: number[][];

  if (possibilities.length <= 100) {
    candidates = possibilities;
  } else if (possibilities.length <= 1000) {
    // 优先从可能性中采样 + 一些全局候选
    const sampled = possibilities.slice(0, 50);
    candidates = sampled;
  } else {
    // 大量可能性时，使用已知好的开局
    candidates = [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [0, 2, 4, 6, 8],
      [1, 3, 5, 7, 9],
      [0, 1, 5, 6, 8],
    ];
  }

  let bestGuess = candidates[0];
  let bestScore = Infinity;

  for (const guess of candidates) {
    const s = scoreGuess(guess, possibilities);
    if (s < bestScore) {
      bestScore = s;
      bestGuess = guess;
    }
  }

  return bestGuess;
}

/**
 * 生成随机密码
 */
export function generateSecretCode(): number[] {
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const code: number[] = [];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * digits.length);
    code.push(digits[idx]);
    digits.splice(idx, 1);
  }
  return code;
}
