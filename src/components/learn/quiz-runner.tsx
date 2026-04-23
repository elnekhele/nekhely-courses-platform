"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";

export function QuizRunner({
  quizId,
  passingScore,
  questions,
}: {
  quizId: string;
  passingScore: number;
  questions: { id: string; text: string; options: string[] }[];
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    setLoading(false);
    if (!res.ok) {
      toast({ title: "فشل إرسال الاختبار", tone: "error" });
      return;
    }
    const data = (await res.json()) as { score: number; passed: boolean };
    setResult(data);
    toast({
      title: data.passed ? "🎉 نجحت!" : "حاول مرة أخرى",
      description: `نتيجتك: ${data.score}%`,
      tone: data.passed ? "success" : "error",
    });
  }

  if (result) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-4">
          <div className="text-5xl">
            {result.passed ? "🎉" : "😕"}
          </div>
          <div className="font-display text-2xl font-bold">
            {result.passed ? "نجحت بامتياز!" : "لم تصل للحد الأدنى"}
          </div>
          <div className="text-slate-600">
            نتيجتك: <span className="font-bold text-brand-700">{result.score}%</span>
            {" "}— الحد الأدنى: {passingScore}%
          </div>
          <Button onClick={() => setResult(null)}>إعادة المحاولة</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <Card key={q.id}>
          <CardContent className="p-5 space-y-3">
            <div className="font-semibold">
              {qi + 1}. {q.text}
            </div>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${answers[q.id] === i ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === i}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    className="accent-brand-600"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button
          onClick={submit}
          disabled={loading || Object.keys(answers).length !== questions.length}
          size="lg"
        >
          {loading ? "جارٍ الإرسال..." : "إرسال الإجابات"}
        </Button>
      </div>
    </div>
  );
}
