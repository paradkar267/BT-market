import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "Do you offer refunds?",
    answer: "Yes, we offer a 14-day money-back guarantee if the template is broken or not as described. Please read our refund policy for detailed terms."
  },
  {
    question: "Will I get future updates?",
    answer: "Absolutely! Once you purchase a template, you get lifetime access to all future updates for that specific template."
  },
  {
    question: "Can I use this for my clients?",
    answer: "Yes, our standard license allows you to use the template for one personal or commercial client project. For multiple clients, please check if an extended license is required."
  },
  {
    question: "Do you provide technical support?",
    answer: "We provide 6 months of basic technical support for bugs and setup issues. Customizations and major modifications are not included in standard support."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-[800px] mx-auto py-6">
      <h3 className="text-3xl font-black text-center mb-8 text-gray-900 dark:text-white">
        Frequently Asked Questions
      </h3>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          
          return (
            <div 
              key={index} 
              className={`border rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.04]' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-black hover:border-gray-300 dark:hover:border-gray-700'}`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
              >
                <span className="font-bold text-gray-900 dark:text-gray-100">{faq.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="shrink-0 text-gray-400"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 pt-1 text-gray-600 dark:text-gray-400 leading-relaxed">
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
