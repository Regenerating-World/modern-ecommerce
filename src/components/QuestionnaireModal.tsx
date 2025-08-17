"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Questionnaire, QuestionnaireAnswer } from "@/types/ecommerce";
import { toast } from "react-toastify";
import { tagManager } from "@/lib/client/tag-manager";

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionnaire: Questionnaire;
  onComplete: (answers: QuestionnaireAnswer[], reward: string) => void;
}

export default function QuestionnaireModal({
  isOpen,
  onClose,
  questionnaire,
  onComplete,
}: QuestionnaireModalProps) {
  const { isSignedIn } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAnswers({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Don't show modal if user is not signed in
  if (!isSignedIn || !isOpen) {
    return null;
  }

  const currentQuestion = questionnaire.questions[currentStep];
  const isLastStep = currentStep === questionnaire.questions.length - 1;
  const canProceed = currentQuestion?.required
    ? answers[currentQuestion.id]
    : true;

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Convert answers to QuestionnaireAnswer format
      const questionnaireAnswers: QuestionnaireAnswer[] =
        questionnaire.questions.map((question) => {
          const answer = answers[question.id] || "";
          const selectedOption = question.options?.find(
            (opt) => opt.value === answer
          );
          const tags = selectedOption?.tags || [];

          return {
            questionId: question.id,
            question: question.question,
            answer,
            tags,
          };
        });

      // Add tags to tag manager
      questionnaireAnswers.forEach((answer) => {
        if (answer.tags.length > 0) {
          tagManager.addQuestionnaireTag(answer.questionId, answer.tags);
        }
      });

      // Save to Contentful
      await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionnaireId: questionnaire.id,
          answers: questionnaireAnswers,
        }),
      });

      // Generate reward
      let rewardMessage = "";
      if (questionnaire.reward.type === "coupon") {
        rewardMessage = `Parabéns! Você ganhou o cupom: ${questionnaire.reward.value}`;
      } else if (questionnaire.reward.type === "cashback") {
        rewardMessage = `Parabéns! Você ganhou R$ ${questionnaire.reward.value} de cashback!`;
      }

      onComplete(questionnaireAnswers, rewardMessage);
      onClose();
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast.error("❌ Erro ao enviar questionário. Tente novamente.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "single":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                  className="text-blue-600"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "multiple":
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => {
              const currentAnswers =
                answers[currentQuestion.id]?.split(",") || [];
              const isChecked = currentAnswers.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      let newAnswers;
                      if (e.target.checked) {
                        newAnswers = [...currentAnswers, option.value];
                      } else {
                        newAnswers = currentAnswers.filter(
                          (a) => a !== option.value
                        );
                      }
                      handleAnswerChange(
                        currentQuestion.id,
                        newAnswers.join(",")
                      );
                    }}
                    className="text-blue-600"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        );

      case "text":
        return (
          <textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) =>
              handleAnswerChange(currentQuestion.id, e.target.value)
            }
            placeholder="Digite sua resposta..."
            className="w-full p-3 border rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {questionnaire.title}
              </h2>
              <p className="text-gray-600 mt-2">{questionnaire.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Pergunta {currentStep + 1} de {questionnaire.questions.length}
              </span>
              <span>
                {Math.round(
                  ((currentStep + 1) / questionnaire.questions.length) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentStep + 1) / questionnaire.questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Question content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentQuestion?.question}
              {currentQuestion?.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h3>
            {renderQuestion()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Enviando...
                </span>
              ) : isLastStep ? (
                "Finalizar"
              ) : (
                "Próxima"
              )}
            </button>
          </div>
        </div>

        {/* Reward info */}
        <div className="px-6 pb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">🎁</div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Recompensa ao finalizar:
                </p>
                <p className="text-sm text-green-600">
                  {questionnaire.reward.type === "coupon"
                    ? `Cupom de desconto: ${questionnaire.reward.value}`
                    : `R$ ${questionnaire.reward.value} de cashback`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
