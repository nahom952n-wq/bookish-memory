'use client';

import { MessageCircle, Search, ChevronRight, BookOpen, Zap, Shield } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I add my first transaction?',
        a: 'Click the "Add Transaction" button on your dashboard, fill in the details, select a category, and click Submit. You can also upload receipts using the Document Uploader.'
      },
      {
        q: 'Can I import my bank transactions?',
        a: 'Yes! You can connect your bank account in Settings or upload a CSV file of your transactions. We support all major banks.'
      },
      {
        q: 'Is my data secure?',
        a: 'Absolutely. We use bank-level 256-bit encryption and comply with all financial data protection standards.'
      }
    ]
  },
  {
    category: 'Features',
    questions: [
      {
        q: 'What are the benefits of Premium?',
        a: 'Premium includes budget goals, recurring bill tracking, savings goals, financial insights, and unlimited exports.'
      },
      {
        q: 'How do budgets work?',
        a: 'Set monthly limits for each spending category. You\'ll get alerts at 75%, 90%, and 100% of your limit.'
      },
      {
        q: 'Can I export my data?',
        a: 'Yes! Export your transactions as CSV or PDF, or generate tax reports for accounting purposes.'
      }
    ]
  },
  {
    category: 'Tips & Tricks',
    questions: [
      {
        q: 'How can I save more money?',
        a: 'Use AI Insights to identify spending patterns, set realistic budget goals, and track savings goals for accountability.'
      },
      {
        q: 'What are achievement badges?',
        a: 'Earn badges by hitting financial milestones like saving $500, staying under budget for 3 months, or completing savings goals.'
      },
      {
        q: 'How do I refer friends?',
        a: 'Share your unique referral link from the Refer & Earn section. Both you and your friends get 30 days of Premium free!'
      }
    ]
  }
];

export default function HelpCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredFaqs = faqs
    .map(section => ({
      ...section,
      questions: section.questions.filter(
        q => q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
             q.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(section => section.questions.length > 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-800">Help Center</h3>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* FAQ Sections */}
      {filteredFaqs.length > 0 ? (
        <div className="space-y-6">
          {filteredFaqs.map((section, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                {section.category === 'Getting Started' && <Zap className="w-5 h-5 text-blue-600" />}
                {section.category === 'Features' && <Shield className="w-5 h-5 text-green-600" />}
                {section.category === 'Tips & Tricks' && <MessageCircle className="w-5 h-5 text-purple-600" />}
                {section.category}
              </h4>
              <div className="space-y-2">
                {section.questions.map((qa, qIdx) => (
                  <div key={qIdx} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === `${idx}-${qIdx}` ? null : `${idx}-${qIdx}`)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
                    >
                      <span className="font-semibold text-gray-800 text-left">{qa.q}</span>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-600 transition-transform ${
                          expanded === `${idx}-${qIdx}` ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    {expanded === `${idx}-${qIdx}` && (
                      <div className="px-4 py-3 bg-white border-t border-gray-200">
                        <p className="text-gray-700">{qa.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 py-8">No results found. Try a different search term.</p>
      )}

      {/* Contact Support */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-gray-800">
          Can't find what you're looking for?{' '}
          <a href="mailto:support@budgetmind.com" className="font-bold text-blue-600 hover:text-blue-700">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
