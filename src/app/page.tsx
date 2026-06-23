'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  getAllCodes,
  filterPossibilities,
  suggestGuess,
  type Feedback,
} from '@/lib/solver';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type GuessRecord = {
  guess: number[];
  feedback: Feedback;
};

export default function Home() {
  const [guesses, setGuesses] = useState<GuessRecord[]>([]);
  const [currentBulls, setCurrentBulls] = useState('');
  const [currentCows, setCurrentCows] = useState('');
  const [possibilities, setPossibilities] = useState<number[][]>([]);
  const [suggestion, setSuggestion] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);

  const bullsRef = useRef<HTMLInputElement>(null);

  // 初始化
  useEffect(() => {
    if (!initialized) {
      const allCodes = getAllCodes();
      setPossibilities(allCodes);
      const s = suggestGuess(allCodes);
      setSuggestion(s);
      setInitialized(true);
    }
  }, [initialized]);

  const handleSubmit = useCallback(() => {
    const bulls = parseInt(currentBulls, 10);
    const cows = parseInt(currentCows, 10);

    if (isNaN(bulls) || isNaN(cows)) return;
    if (bulls + cows > 5) return;
    if (bulls < 0 || cows < 0) return;

    const feedback: Feedback = { bulls, cows };
    const record: GuessRecord = { guess: [...suggestion], feedback };
    const newGuesses = [...guesses, record];

    const newPossibilities = filterPossibilities(
      possibilities,
      suggestion,
      feedback
    );

    setGuesses(newGuesses);
    setPossibilities(newPossibilities);
    setCurrentBulls('');
    setCurrentCows('');

    if (newPossibilities.length > 0) {
      const s = suggestGuess(newPossibilities);
      setSuggestion(s);
    }
    setTimeout(() => bullsRef.current?.focus(), 100);
  }, [currentBulls, currentCows, guesses, possibilities, suggestion]);

  const resetSolver = useCallback(() => {
    const allCodes = getAllCodes();
    setGuesses([]);
    setCurrentBulls('');
    setCurrentCows('');
    setPossibilities(allCodes);
    const s = suggestGuess(allCodes);
    setSuggestion(s);
  }, []);

  // 渲染星星反馈
  const renderFeedback = (feedback: Feedback) => {
    const stars: React.ReactElement[] = [];
    for (let i = 0; i < feedback.bulls; i++) {
      stars.push(
        <span key={`b${i}`} className="text-amber-400 text-lg">
          ★
        </span>
      );
    }
    for (let i = 0; i < feedback.cows; i++) {
      stars.push(
        <span key={`c${i}`} className="text-slate-300 text-lg">
          ☆
        </span>
      );
    }
    const empty = 5 - feedback.bulls - feedback.cows;
    for (let i = 0; i < empty; i++) {
      stars.push(
        <span key={`e${i}`} className="text-slate-600 text-lg">
          ·
        </span>
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  // 渲染猜测行
  const renderGuessRow = (
    record: GuessRecord,
    index: number,
    isLast: boolean
  ) => (
    <div
      key={index}
      className={`flex items-center gap-2 sm:gap-4 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 ${isLast
          ? 'bg-amber-500/10 border border-amber-500/20'
          : 'bg-slate-800/50'
        }`}
    >
      <span className="text-slate-500 text-sm w-5 sm:w-6 shrink-0">#{index + 1}</span>
      <div className="flex gap-1 sm:gap-2 flex-1 min-w-0">
        {record.guess.map((d, i) => (
          <span
            key={i}
            className={`flex-1 min-w-0 h-8 sm:w-10 sm:h-10 sm:flex-none flex items-center justify-center rounded-md font-mono text-base sm:text-xl font-bold ${record.feedback.bulls === 5
                ? 'text-emerald-400 bg-emerald-500/20 border border-emerald-500/30'
                : isLast
                  ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20'
                  : 'text-slate-300 bg-slate-700/50 border border-slate-600/50'
              }`}
          >
            {d}
          </span>
        ))}
      </div>
      <div className="ml-auto shrink-0">{renderFeedback(record.feedback)}</div>
    </div>
  );

  const solved = guesses.length > 0 && guesses[guesses.length - 1].feedback.bulls === 5;
  const noMatch = possibilities.length === 0 && guesses.length > 0;

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-100">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-amber-400">★</span> 权达开猜数字破解器{' '}
            <span className="text-amber-400">★</span>
          </h1>
        </div>

        <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-amber-300">
              解题助手
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              按照推荐数字去猜，然后输入收到的 ★ ☆ 反馈，系统会自动缩小范围并推荐下一步
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 当前推荐猜测 */}
            {possibilities.length > 0 && !solved && (
              <div className="bg-slate-800/60 rounded-lg p-4 border border-amber-500/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400">
                    第 {guesses.length + 1} 次猜测
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/20 text-amber-300 border-amber-500/30"
                  >
                    剩余 {possibilities.length} 种可能
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3 max-w-xs sm:max-w-sm mx-auto">
                  <div className="flex gap-1.5 sm:gap-2 w-full">
                    {suggestion.map((d, i) => (
                      <span
                        key={i}
                        className="flex-1 min-w-0 aspect-square sm:aspect-auto sm:w-16 sm:h-16 flex items-center justify-center rounded-lg font-mono text-2xl sm:text-3xl font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 sm:gap-3 items-end border-t border-slate-700/50 pt-3">
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 mb-1 block">
                        ★ 数量
                      </label>
                      <Input
                        ref={bullsRef}
                        value={currentBulls}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                          setCurrentBulls(v);
                        }}
                        placeholder="0-5"
                        className="bg-slate-800/50 border-slate-600/50 text-amber-300 font-mono text-lg text-center placeholder:text-slate-600"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmit();
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 mb-1 block">
                        ☆ 数量
                      </label>
                      <Input
                        value={currentCows}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                          setCurrentCows(v);
                        }}
                        placeholder="0-5"
                        className="bg-slate-800/50 border-slate-600/50 text-slate-300 font-mono text-lg text-center placeholder:text-slate-600"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSubmit();
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={
                        currentBulls === '' ||
                        currentCows === '' ||
                        parseInt(currentBulls) + parseInt(currentCows) > 5
                      }
                      className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 sm:px-6 shrink-0"
                    >
                      确认反馈
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 已破解 */}
            {solved && (
              <div className="bg-emerald-500/10 rounded-lg p-6 border border-emerald-500/20 text-center">
                <p className="text-xl font-bold text-emerald-300 mb-2">
                  破解成功！
                </p>
                <div className="flex gap-1.5 sm:gap-2 justify-center mb-4">
                  {guesses[guesses.length - 1].guess.map((d, i) => (
                    <span
                      key={i}
                      className="flex-1 min-w-0 h-11 sm:w-14 sm:h-14 sm:flex-none flex items-center justify-center rounded-lg font-mono text-2xl sm:text-3xl font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30"
                    >
                      {d}
                    </span>
                  ))}
                </div>
                <p className="text-slate-400 text-sm mb-3">
                  共用了 {guesses.length} 次猜测
                </p>
                <Button
                  onClick={resetSolver}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                >
                  重新开始
                </Button>
              </div>
            )}

            {/* 无匹配 */}
            {noMatch && (
              <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20 text-red-300 text-sm">
                没有符合条件的密码，请检查输入的反馈是否正确
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetSolver}
                  className="ml-3 text-red-400 hover:text-red-300 text-xs"
                >
                  重置
                </Button>
              </div>
            )}

            {/* 剩余可能展示 */}
            {possibilities.length <= 20 &&
              possibilities.length > 0 &&
              !solved && (
                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
                  <p className="text-xs text-slate-500 mb-2">
                    所有可能的答案：
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {possibilities.map((code, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs font-mono bg-slate-700/50 rounded text-slate-300 border border-slate-600/50"
                      >
                        {code.join('')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* 猜测历史 */}
            {guesses.length > 0 && !solved && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">猜测记录</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={resetSolver}
                    className="text-slate-500 hover:text-slate-300 text-xs h-7"
                  >
                    重置
                  </Button>
                </div>
                <div className="space-y-1">
                  {guesses.map((record, i) =>
                    renderGuessRow(record, i, i === guesses.length - 1)
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 规则说明 */}
        <Card className="bg-slate-900/60 border-slate-700/30 mt-6 py-2 gap-1">
          <CardHeader className="py-0 px-6">
            <CardTitle className="text-sm text-slate-400">【规则说明】</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500 space-y-0.5 pb-2 pt-0">
            <p>
              1. 密码由 <strong className="text-slate-300">5位不重复</strong> 的数字组成。
            </p>
            <p>
              2. 你一共有 <strong className="text-slate-300">9次</strong> 机会。
            </p>
            <p>
              3. 提示{' '}
              <span className="text-amber-400 font-bold">★</span>{' '}
              表示数字和位置都对。
            </p>
            <p>
              4. 提示{' '}
              <span className="text-slate-300 font-bold">☆</span>{' '}
              表示数字对但位置错。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
