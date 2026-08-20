import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, Mail, MapPin, CheckCircle2, Send, AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SectionHeader from '../components/ui/SectionHeader';
import { Input, Textarea } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { submitContactForm } from '../api/contact';
import type { ContactFormData } from '../types';
import { useSEO } from '../hooks/useSEO';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid phone number'),
  message: z.string().min(20, 'Please provide more detail (min 20 characters)'),
  honeypot: z.string().optional(),
});

const contactInfo = [
  {
    icon: MapPin,
    label: 'Office Address',
    value: 'RZ-B3 243/D, Vijay Enclave, South West Delhi, New Delhi-110045',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 99113 94456',
    href: 'tel:+919911394456',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'Aprservices20@gmail.com',
    href: 'mailto:Aprservices20@gmail.com',
  },
];

const ContactPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const productName = searchParams.get('product');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formStartedAtRef = useRef(Date.now().toString());

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormData & { honeypot?: string }>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: productName 
        ? `Hello, I would like to request a quotation for: ${productName}.\n\nPlease provide pricing, minimum order quantity, and lead time details.`
        : '',
    }
  });

  // Fallback to update value if search params load dynamically
  useEffect(() => {
    if (productName) {
      setValue(
        'message',
        `Hello, I would like to request a quotation for: ${productName}.\n\nPlease provide pricing, minimum order quantity, and lead time details.`
      );
    }
  }, [productName, setValue]);

  const onSubmit = async (data: ContactFormData & { honeypot?: string }) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      // Pass the product context to the backend if coming from a product page
      const payload = {
        ...data,
        productName: productName || undefined,
        formStartedAt: formStartedAtRef.current,
      };
      await submitContactForm(payload);
      setSubmitted(true);
      reset();
      formStartedAtRef.current = Date.now().toString();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': 'APR Services Enterprise',
    'image': 'https://aprsvs.com/favicon.svg',
    'telephone': '+91 99113 94456',
    'email': 'Aprservices20@gmail.com',
    'url': 'https://aprsvs.com/contact',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'RZ-B3 243/D, Vijay Enclave, South West Delhi',
      'addressLocality': 'New Delhi',
      'postalCode': '110045',
      'addressCountry': 'IN'
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        'opens': '09:00',
        'closes': '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': 'Saturday',
        'opens': '10:00',
        'closes': '14:00'
      }
    ]
  };

  useSEO({
    title: 'Request a Quote | B2B Procurement | APR Services Enterprise',
    description: 'Get a fast quote for aviation and industrial consumables. APR Services supplies ISO-certified adhesives, sealants, lubricants, oils, coatings, and tapes in bulk.',
    canonicalUrl: 'https://aprsvs.com/contact',
    schemaMarkup: contactSchema
  });

  return (
    <>
      <Navbar />

      <div className="bg-[#F4F8FC] min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            to={productName ? -1 as any : "/products"}
            className="inline-flex items-center gap-1.5 text-[#1557B0] hover:text-[#0B2A4A] text-sm mb-8 transition-colors font-medium"
          >
            <ArrowLeft size={14} /> Back
          </Link>

          <SectionHeader
            label="Get In Touch"
            title="Request a Procurement Quote"
            subtitle="Fill in your requirements and our team will respond with a tailored proposal within 24 business hours."
            className="mb-12"
            headingLevel="h1"
          />

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Contact Info — left */}
            <div className="lg:col-span-2">
              <div className="space-y-6 mb-8">
                {contactInfo.map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-[#1557B0]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[#1557B0]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                        {label}
                      </div>
                      {href ? (
                        <a
                          href={href}
                          className="text-sm text-[#1F2937] hover:text-[#1557B0] transition-colors"
                        >
                          {value}
                        </a>
                      ) : (
                        <p className="text-sm text-[#1F2937] leading-relaxed">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Business Hours */}
              <div className="p-5 bg-white rounded-sm border border-[#E5E7EB]">
                <h4 className="font-semibold text-[#1F2937] text-sm mb-3">Business Hours</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Monday – Friday</span>
                    <span className="text-[#1F2937] font-medium">9:00 AM – 6:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Saturday</span>
                    <span className="text-[#1F2937] font-medium">10:00 AM – 2:00 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Sunday</span>
                    <span className="text-[#6B7280]">Closed</span>
                  </div>
                </div>
              </div>

              {/* Response SLA */}
              <div className="mt-4 p-4 bg-[#1557B0]/10 rounded-sm border border-[#1557B0]/20">
                <div className="flex gap-3 items-start">
                  <CheckCircle2 size={16} className="text-[#1557B0] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#4B5563] leading-relaxed">
                    We commit to responding to all procurement enquiries within{' '}
                    <strong className="text-[#1557B0]">4 business hours</strong>. For urgent requirements,
                    call us directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Form — right */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-sm border border-[#E5E7EB] p-7 md:p-9 shadow-xs">
                {submitted ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-[#1557B0]/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={32} className="text-[#1557B0]" />
                    </div>
                    <h3
                      className="text-2xl font-bold text-[#1F2937] mb-3 font-serif"
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                    >
                      Enquiry Received!
                    </h3>
                    <p className="text-[#4B5563] text-sm max-w-sm mx-auto mb-6">
                      Thank you for reaching out. Our procurement team will review your requirements
                      and respond within 4 business hours with a tailored proposal.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                      Submit Another Enquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* Honeypot — hidden from real users */}
                    <input
                      type="text"
                      aria-hidden="true"
                      tabIndex={-1}
                      autoComplete="off"
                      style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0 }}
                      {...register('honeypot')}
                    />

                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Full Name"
                        placeholder="Rajesh Kumar"
                        required
                        {...register('name')}
                        error={errors.name?.message}
                      />
                      <Input
                        label="Company Name"
                        placeholder="Acme Corp Pvt. Ltd."
                        required
                        {...register('company')}
                        error={errors.company?.message}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="Business Email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        {...register('email')}
                        error={errors.email?.message}
                      />
                      <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+91 98765 43210"
                        required
                        {...register('phone')}
                        error={errors.phone?.message}
                      />
                    </div>
                    <Textarea
                      label="Procurement Requirement"
                      placeholder="Describe the products you need, estimated quantity, delivery location, and any specific requirements..."
                      rows={5}
                      required
                      {...register('message')}
                      error={errors.message?.message}
                    />

                    {/* API submit error */}
                    {submitError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-600">
                        <AlertCircle size={14} className="flex-shrink-0" />
                        {submitError}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-[#6B7280]">
                        Your data is secure and never shared with third parties.
                      </p>
                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        loading={submitting}
                        className="gap-2 bg-[#1557B0] hover:bg-[#0F448C] text-white"
                      >
                        <Send size={14} />
                        Send Enquiry
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
