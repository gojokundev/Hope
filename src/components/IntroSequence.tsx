import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LanguageCode } from "../types";
import { TRANSLATIONS } from "../translations";

interface IntroSequenceProps {
  accentColor: string;
  lang: LanguageCode;
  onFinished: () => void;
}

export const IntroSequence: React.FC<IntroSequenceProps> = ({
  accentColor,
  lang,
  onFinished,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTextVisible, setIsTextVisible] = useState(true);
  const [isButtonVisible, setIsButtonVisible] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (isTextVisible) {
      setIsButtonVisible(false);
      const timer = setTimeout(() => {
        setIsButtonVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isTextVisible]);

  const handleNext = () => {
    if (isTextVisible && isButtonVisible) {
      setIsTextVisible(false);
      // Wait for exit animation to complete before changing step
      setTimeout(() => {
        if (currentStep < 2) {
          setCurrentStep((prev) => prev + 1);
          setIsTextVisible(true);
        } else {
          onFinished();
        }
      }, 600);
    }
  };

  const getMessageText = () => {
    switch (currentStep) {
      case 0:
        return t.intro_msg_1;
      case 1:
        return t.intro_msg_2;
      default:
        return t.intro_msg_3;
    }
  };

  const isRtl = lang === "ar" || lang === "fa";

  return (
    <div
      id="intro-container"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#080b13] p-8 ${
        isRtl ? "rtl-layout" : "ltr-layout"
      }`}
    >
      {/* Spacer */}
      <div className="h-16" />

      {/* Centered Message */}
      <div className="flex flex-1 items-center justify-center max-w-xl text-center px-4">
        <AnimatePresence mode="wait">
          {isTextVisible && (
            <motion.h1
              id="intro-text"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              style={{ color: accentColor }}
              className="font-display text-3xl md:text-4xl font-bold leading-relaxed tracking-wide select-none"
            >
              {getMessageText()}
            </motion.h1>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="w-full max-w-md pb-12 flex justify-center h-24">
        <AnimatePresence>
          {isButtonVisible && isTextVisible && (
            <motion.button
              id="intro-next-btn"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={handleNext}
              style={{ backgroundColor: accentColor }}
              className="w-full h-12 rounded-xl text-black font-bold text-base hover:opacity-90 active:scale-98 transition-transform cursor-pointer shadow-lg shadow-black/40"
            >
              {t.intro_next}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
