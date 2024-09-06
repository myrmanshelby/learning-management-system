interface ObjectiveProgress {
    [key: string]: { correct: number; total: number };
}

interface Question {
    type: string;
    question: string;
    answer: string;
}

export const updateObjectiveProgress = (
    prevProgress: ObjectiveProgress,
    selectedObjective: string | null,
    currentQuestions: Question[]
): ObjectiveProgress => {
    if (!selectedObjective) return prevProgress;

    const totalQuestions = currentQuestions.length;
    const currentProgress = prevProgress[selectedObjective] || { correct: 0, total: totalQuestions };
    const updatedProgress = {
        correct: currentProgress.correct + 1,
        total: totalQuestions,
    };

    return { ...prevProgress, [selectedObjective]: updatedProgress };
};