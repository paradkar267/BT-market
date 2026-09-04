import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "Do you offer refunds?",
    answer: "Yes. We offer a 14-day money-back guarantee if a template has critical bugs or differs from the preview."
  },
  {
    question: "Do I get free lifetime updates?",
    answer: "Yes. All template updates, bug fixes, and framework upgrades are included free for lifetime in your account."
  },
  {
    question: "Can I use templates for client projects?",
    answer: "Yes. Commercial license gives you unlimited rights to deploy on client sites and SaaS apps with no royalty fees."
  },
  {
    question: "How is the code delivered?",
    answer: "Instant automated delivery. You receive a complete .zip archive immediately after checkout plus an email copy."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-[800px] mx-auto py-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          Frequently Asked Questions
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
          Quick answers to common questions
        </p>
      </div>
      
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div 
              key={index} 
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                isOpen 
                  ? 'border-black dark:border-white bg-black/[0.02] dark:bg-white/[0.03]' 
                  : 'border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
              >
                <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100">{faq.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="shrink-0 text-gray-400"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
