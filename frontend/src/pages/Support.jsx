import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiSupport, HiMail, HiQuestionMarkCircle, HiCalendar } from 'react-icons/hi';

const FAQS = [
  { q: 'How do I submit a review?', a: 'Rate the book, write your review, and click Submit.' },
  { q: 'How do I add books to favourites?', a: 'Click the ❤ Favourite button on the book page.' },
  { q: 'How do I add a book to my library?', a: 'On any book detail page, click "Add to Library". It will appear in My Library.' },
  { q: 'Are all books free?', a: 'Some books are free, others are premium.' },
  { q: 'How do audio books work?', a: 'Audio books stream directly in your browser. Look for the play button on the book detail page.' },
];

export default function Support() {
  const [openIdx, setOpenIdx] = useState(null);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setName(''); setEmail(''); setMessage('');
  };

  return (
    <div className="w-full space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <HiSupport className="text-primary text-xl" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Support</h1>
          <p className="text-gray-400 text-sm">We're here to help</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: HiMail, label: 'Email Us', sub: 'support@bookbase.app' },
          { icon: HiCalendar, label: '📞 Contact Support', sub: '+91 1234567890' },
          { icon: HiQuestionMarkCircle, label: '❓ Help Center', sub: 'FAQs & support' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="card p-4 text-center hover:shadow-hover transition-all cursor-pointer">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Icon className="text-primary text-lg" />
            </div>
            <p className="font-semibold text-sm text-gray-800">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQS.map(({ q, a }, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{q}</span>
                <span className={`text-primary font-bold transition-transform ${openIdx === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {openIdx === i && (
                <div className="px-4 pb-3 text-sm text-gray-500 border-t border-gray-100">{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="card p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Send Us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="input resize-none" required />
          </div>
          <button type="submit" className="btn-primary">Send Message</button>
        </form>
      </div>
      
    </div>
  );
}
