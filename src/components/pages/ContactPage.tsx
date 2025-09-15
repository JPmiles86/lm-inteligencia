// Enhanced Contact Page - Industry-specific contact forms and information

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useIndustryContext } from '../../contexts/IndustryContext';
import { getIndustryName, IndustryType } from '../../types/Industry';
// Removed unused universalContent import

export const ContactPage: React.FC = () => {
  const { config } = useIndustryContext();
  const industryName = getIndustryName(config.industry);
  // Removed unused footerContent variable
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    businessType: '',
    budget: '',
    goals: '',
    timeline: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Formspree endpoints - submit to both email addresses
      const formspreeEndpoint1 = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xkgvaqyl';
      const formspreeEndpoint2 = import.meta.env.VITE_FORMSPREE_ENDPOINT_2 || null; // Add second form ID here if you create one

      const formPayload = {
        ...formData,
        industry: config.industry,
        _replyto: formData.email,
        _subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName} - ${formData.company}`,
        _gotcha: '', // Honeypot field for spam prevention
        _template: 'table', // Use table template for better formatting
      };

      // Submit to first endpoint
      const response = await fetch(formspreeEndpoint1, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formPayload),
      });

      // If you have a second endpoint, submit to it as well
      if (formspreeEndpoint2) {
        fetch(formspreeEndpoint2, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(formPayload),
        }).catch(err => console.log('Secondary form submission failed:', err));
      }

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          businessType: '',
          budget: '',
          goals: '',
          timeline: '',
          message: '',
        });
      } else {
        setSubmitStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Unable to send your message. Please try again later or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get data from config with fallbacks
  const businessTypesMap: Record<IndustryType, string[]> = {
    hospitality: ['Boutique Hotel', 'Resort', 'Restaurant', 'Fine Dining', 'Casual Dining', 'Travel Agency', 'Tourism Business', 'Other'],
    healthcare: ['General Dentistry', 'Dental Speciality', 'Medical Practice', 'Health Clinic', 'Wellness Center', 'Fitness Studio', 'Retreat Center', 'Other'],
    tech: ['SaaS Startup', 'AI Company', 'MarTech Platform', 'B2B Software', 'Developer Tools', 'Tech Consultancy', 'Digital Agency', 'Other'],
    athletics: ['Pickleball Facility', 'Sports Club', 'Event Venue', 'Tournament Organizer', 'Sports Media', 'Recreation Center', 'Other'],
    main: ['Hospitality & Lifestyle', 'Health & Wellness', 'Tech, AI & Digital Innovation', 'Sport, Media & Events', 'Other'],
  };
  const businessTypes = config.content.contact.businessTypes || businessTypesMap[config.industry as keyof typeof businessTypesMap] || ['Other'];

  const budgetRanges = config.content.contact.budgetRanges || [
    '$1,000 - $2,500/month',
    '$2,500 - $5,000/month', 
    '$5,000 - $10,000/month',
    '$10,000+ /month',
    'Let\'s discuss'
  ];

  const timelineOptions = config.content.contact.timelineOptions || [
    'ASAP - I need help now',
    'Within 1 month',
    '1-3 months',
    '3-6 months',
    'Just exploring options'
  ];

  const contactMethods = [
    {
      type: 'Email',
      value: config.content.contact.email,
      icon: '📧',
      description: 'Email us anytime - we respond within 24 hours',
    },
    {
      type: 'Phone',
      value: config.content.contact.phone,
      icon: '📞',
      description: 'Call us during business hours (9 AM - 6 PM EST)',
    },
    {
      type: 'WhatsApp',
      value: config.content.contact.phone,
      icon: '/images/Digital_Glyph_Green.svg',
      description: 'Chat with us on WhatsApp for quick responses',
    },
    {
      type: 'Office',
      value: config.content.contact.address || '123 Business Ave, Suite 100, Miami, FL 33101',
      icon: '📍',
      description: 'Visit our office for an in-person consultation',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white -mt-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              {config.content.contact.title || 'Get Started Today'}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-4xl mx-auto">
              {config.content.contact.subtitle || 
               `Ready to grow your ${industryName.toLowerCase()} business? Let's discuss how our specialized marketing expertise can help you achieve your goals.`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-8"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {config.content.contact.formLabels?.formTitle || 'Send us a message'}
              </h2>
              <p className="text-gray-600 mb-8">
                {config.content.contact.formLabels?.formSubtitle || 'Fill out the form below and we\'ll get back to you within 24 hours with a customized strategy for your business.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      {config.content.contact.formLabels?.firstName || 'First Name *'}
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder={config.content.contact.formLabels?.placeholders.firstName || 'Enter your first name'}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      {config.content.contact.formLabels?.lastName || 'Last Name *'}
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder={config.content.contact.formLabels?.placeholders.lastName || 'Enter your last name'}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {config.content.contact.formLabels?.email || 'Email Address *'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder={config.content.contact.formLabels?.placeholders.email || 'your@email.com'}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {config.content.contact.formLabels?.phone || 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                      placeholder={config.content.contact.formLabels?.placeholders.phone || '+506 6200 2747'}
                    />
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    {config.content.contact.formLabels?.company || 'Business Name *'}
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder={config.content.contact.formLabels?.placeholders.company || 'Your Business Name'}
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                    {config.content.contact.formLabels?.businessType || 'Business Type *'}
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    required
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  >
                    <option value="">{config.content.contact.formLabels?.placeholders.businessType || 'Select your business type'}</option>
                    {businessTypes.map((type: string, index: number) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Budget & Timeline */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                      {config.content.contact.formLabels?.budget || 'Marketing Budget'}
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    >
                      <option value="">{config.content.contact.formLabels?.placeholders.budget || 'Select your budget range'}</option>
                      {budgetRanges.map((range: string, index: number) => (
                        <option key={index} value={range}>{range}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                      {config.content.contact.formLabels?.timeline || 'Timeline'}
                    </label>
                    <select
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    >
                      <option value="">{config.content.contact.formLabels?.placeholders.timeline || 'When do you want to start?'}</option>
                      {timelineOptions.map((option: string, index: number) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-2">
                    {config.content.contact.formLabels?.goals || 'What are your main marketing goals? *'}
                  </label>
                  <textarea
                    id="goals"
                    name="goals"
                    required
                    rows={3}
                    value={formData.goals}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder={config.content.contact.formLabels?.placeholders.goals || 'e.g., Increase bookings, drive more customers, improve online presence...'}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    {config.content.contact.formLabels?.message || 'Additional Details'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder={config.content.contact.formLabels?.placeholders.message || 'Tell us more about your business, current challenges, or any specific questions you have...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full font-bold py-4 rounded-lg text-lg transition-all transform ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 hover:scale-105 text-white'
                  }`}
                >
                  {isSubmitting
                    ? 'Sending...'
                    : (config.content.contact.formLabels?.submitButton || 'Send Message & Get Free Consultation')}
                </button>

                {submitStatus === 'success' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Thank you for your inquiry!</p>
                    <p className="text-sm mt-1">We've received your message and will be in touch soon.</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    <p className="font-semibold">Unable to send message</p>
                    <p className="text-sm mt-1">{errorMessage}</p>
                  </div>
                )}

                <p className="text-sm text-gray-500 text-center">
                  {config.content.contact.formLabels?.privacyText || 'We respect your privacy and will never share your information.'}
                </p>
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {config.content.contact.formLabels?.contactMethodsTitle || 'Get in Touch'}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {config.content.contact.formLabels?.contactMethodsSubtitle || `Ready to discuss your ${industryName.toLowerCase()} marketing goals? Choose the contact method that works best for you.`}
                </p>
              </div>

              {/* Contact Methods */}
              <div className="space-y-6">
                {contactMethods.filter(method => method.type !== 'Office').map((method, index) => {
                  const getContactLink = () => {
                    if (method.type === 'Email') {
                      return `mailto:${method.value}`;
                    } else if (method.type === 'Phone') {
                      return `tel:${method.value}`;
                    } else if (method.type === 'WhatsApp') {
                      // Format phone number for WhatsApp (remove spaces, dashes, parentheses)
                      const cleanPhone = method.value.replace(/[\s\-()]/g, '');
                      return `https://wa.me/${cleanPhone}?text=Hi! I'm interested in learning more about your marketing services.`;
                    }
                    return '#';
                  };

                  return (
                    <a
                      key={index}
                      href={getContactLink()}
                      target={method.type === 'WhatsApp' ? '_blank' : '_self'}
                      rel={method.type === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                      className="flex items-start p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="mr-4">
                        {method.icon.startsWith('/') ? (
                          <img src={method.icon} alt={method.type} className="w-12 h-12" />
                        ) : (
                          <div className="text-3xl">{method.icon}</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{method.type}</h3>
                        <p className="text-lg text-primary font-semibold mb-2">{method.value}</p>
                        <p className="text-gray-600 text-sm">{method.description}</p>
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* WhatsApp Call Section */}
              <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 rounded-xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Prefer to Schedule a Call?
                </h3>
                <p className="text-gray-100 mb-6 text-lg leading-relaxed">
                  Book a 30-minute strategy session to discuss your marketing goals and learn how we can help grow your business.
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-white text-base">
                    <span className="font-semibold text-lg">💬 Reach out via WhatsApp</span>
                    <br />
                    <span className="text-gray-200">Use the contact details above to schedule your free consultation at a time that works for you.</span>
                  </p>
                </div>
              </div>

              {/* Office Hours - Hidden per client request */}
              <div className="bg-gray-100 rounded-xl p-6 hidden">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>{config.content.contact.officeHours?.weekdays || '9:00 AM - 6:00 PM EST'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>{config.content.contact.officeHours?.saturday || '10:00 AM - 2:00 PM EST'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>{config.content.contact.officeHours?.sunday || 'Closed'}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  {config.content.contact.officeHours?.emergency || 'Emergency support available 24/7 for existing clients.'}
                </p>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Common questions about working with our {industryName.toLowerCase()} marketing team.
            </p>
          </motion.div>

          <div className="space-y-6">
            {(config.content.contact.faq || [
              {
                question: 'How quickly can I expect to see results?',
                answer: 'Most clients see initial improvements within 30-60 days, with significant results typically achieved within 3-6 months. The timeline depends on your current marketing foundation and campaign objectives.',
              },
              {
                question: 'Do you work with businesses outside of these industries?',
                answer: 'We focus exclusively on hospitality, food service, healthcare, and athletics to provide the deepest expertise possible. This specialization allows us to deliver superior results compared to generalist agencies.',
              },
              {
                question: 'What makes your approach different?',
                answer: 'Unlike generic marketing agencies, we understand the unique challenges, regulations, and opportunities in your specific industry. Our strategies are built on industry-specific insights and proven best practices.',
              },
              {
                question: 'Do you require long-term contracts?',
                answer: 'We offer both monthly and annual plans. While we recommend longer commitments for best results, we understand every business has different needs and can work with you to find the right arrangement.',
              },
            ]).map((faq: { question: string; answer: string }, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};