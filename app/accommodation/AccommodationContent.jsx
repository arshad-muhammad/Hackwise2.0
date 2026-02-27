"use client";
import React, { useState, useEffect } from "react";
import DecryptedText from "../components/DecryptedText";
import DatePicker from "../components/DatePicker";
import { CheckCircle2, Calendar, Users, Mail, Phone, FileText, Loader2, CreditCard, Download, XCircle } from "lucide-react";

const CARD_CLIP = 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)';
const BTN_CLIP = 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)';

// Format price in Indian Rupees
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default function AccommodationContent() {
  const [settings, setSettings] = useState({ enabled: false, price: 0, pricingType: 'per_team' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [queryId, setQueryId] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    team_name: '',
    team_lead_name: '',
    team_lead_email: '',
    team_lead_phone: '',
    total_members: 1,
    check_in_date: '',
    check_out_date: '',
    special_requirements: '',
  });

  // Calculate number of nights
  const calculateNights = () => {
    if (!formData.check_in_date || !formData.check_out_date) {
      return 0;
    }
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate total price based on pricing type and nights
  const calculateTotalPrice = () => {
    const nights = calculateNights();
    if (nights === 0) return 0;

    const pricePerNight = settings.price;
    const totalForNights = pricePerNight * nights;

    if (settings.pricingType === 'per_person') {
      return totalForNights * formData.total_members;
    }
    return totalForNights;
  };

  useEffect(() => {
    fetchSettings();
    loadRazorpay();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/accommodation/settings');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Submit accommodation query
      const res = await fetch('/api/accommodation/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit accommodation query');
        setSubmitting(false);
        return;
      }

      setQueryId(data.id);
      setSubmitted(true);
      setSubmitting(false);

      // Create Razorpay order and open checkout
      await initiatePayment(data.id, data.price);
    } catch (error) {
      console.error('Error submitting:', error);
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const initiatePayment = async (id, amount) => {
    setPaymentProcessing(true);
    setError('');

    try {
      // Wait for Razorpay to load
      await loadRazorpay();

      if (!window.Razorpay) {
        setError('Payment gateway failed to load. Please refresh the page.');
        setPaymentProcessing(false);
        return;
      }

      // Create order
      const orderRes = await fetch('/api/accommodation/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queryId: id, amount }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || 'Failed to create payment order');
        setPaymentProcessing(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency,
        name: 'Hackwise 2.0',
        description: `Accommodation Fee - ${formData.team_name}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // Payment successful
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: formData.team_lead_name,
          email: formData.team_lead_email,
          contact: formData.team_lead_phone,
        },
        theme: {
          color: '#FF7A1A',
        },
        modal: {
          ondismiss: async function () {
            // Payment cancelled/failed
            await handlePaymentFailure(orderData.orderId);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async function (response) {
        await handlePaymentFailure(orderData.orderId, response.error.description);
      });

      razorpay.open();
      setPaymentProcessing(false);
    } catch (error) {
      console.error('Error initiating payment:', error);
      setError('Failed to initiate payment. Please try again.');
      setPaymentProcessing(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      const res = await fetch('/api/accommodation/payment-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPaymentSuccess(true);
        setPaymentFailed(false);
      } else {
        setError(data.error || 'Payment verification failed');
        setPaymentFailed(true);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Payment verification failed. Please contact support.');
      setPaymentFailed(true);
    }
  };

  const handlePaymentFailure = async (orderId, errorDescription) => {
    try {
      await fetch('/api/accommodation/payment-failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          error_description: errorDescription || 'Payment cancelled by user',
        }),
      });
      setPaymentFailed(true);
      setError(errorDescription || 'Payment was cancelled or failed. Please try again.');
    } catch (error) {
      console.error('Error recording payment failure:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_members' ? parseInt(value) || 1 : value,
    }));
  };

  const downloadInvoice = () => {
    if (queryId) {
      window.open(`/api/accommodation/invoice?id=${queryId}`, '_blank');
    }
  };

  if (loading) {
    return (
      <section className="section-container border-t border-white/10 pb-24 pt-40 md:pt-48">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto animate-spin mb-4" />
          <p className="text-white/60 font-mono text-sm">Loading...</p>
        </div>
      </section>
    );
  }

  // Show coming soon if disabled
  if (!settings.enabled) {
    return (
      <section className="section-container border-t border-white/10 pb-24 pt-40 md:pt-48">
        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-6 justify-center">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="font-mono text-sm text-orange-500 uppercase tracking-widest">
              Stay Tuned
            </span>
          </div>

          <h1 className="font-hackwise text-4xl md:text-6xl lg:text-8xl text-white tracking-wide uppercase mb-6">
            COMING <span className="text-orange-500">SOON</span>
          </h1>

          <p className="text-white/60 font-mono text-lg md:text-xl max-w-2xl mx-auto mb-12">
            We are finalizing the accommodation arrangements for Hackwise 2.0.
            <br className="hidden md:block" />
            Details regarding stay and logistics will be updated shortly.
          </p>

          <div
            className="relative inline-block group"
            style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}
          >
            <div className="absolute inset-0 bg-orange-500/50 group-hover:bg-orange-500 transition-colors duration-300" />
            <div
              className="relative bg-[#0A090F] px-8 py-4 m-px w-[calc(100%-2px)] h-[calc(100%-2px)] flex items-center justify-center backdrop-blur-md"
              style={{
                clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)"
              }}
            >
              <div className="absolute inset-0 bg-orange-500/10 transition-colors duration-300" />
              <div className="relative z-10 text-center w-full flex justify-center">
                <DecryptedText
                  text="SYSTEM.UPDATE_PENDING..."
                  speed={80}
                  className="text-orange-500 font-mono tracking-widest text-sm md:text-base inline-block text-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show payment success
  if (paymentSuccess) {
    return (
      <section className="section-container border-t border-white/10 pb-24 pt-40 md:pt-48">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-green-400" size={48} />
              <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider">
                Payment <span className="text-green-400">Successful</span>
              </h1>
            </div>
            <p className="text-white/60 font-mono text-sm md:text-base mb-6">
              Your accommodation request has been confirmed and payment has been received.
            </p>
            <button
              onClick={downloadInvoice}
              className="relative inline-flex items-center justify-center group cursor-pointer mt-4"
            >
              <div
                className="absolute inset-0 bg-orange-500/80 group-hover:bg-orange-500 transition-colors duration-300"
                style={{ clipPath: BTN_CLIP }}
              />
              <div
                className="relative m-[1px] px-6 py-3 text-center transition-all duration-300"
                style={{ clipPath: BTN_CLIP }}
              >
                <span className="relative text-white font-mono font-bold text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                  <Download size={18} />
                  Download Invoice
                </span>
              </div>
            </button>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
              <div
                className="absolute inset-0 bg-white/20 group-hover:bg-green-500/50 transition-colors duration-300"
                style={{ clipPath: CARD_CLIP }}
              />
              <div
                className="relative bg-[#0A090F] p-8 space-y-6"
                style={{ clipPath: CARD_CLIP }}
              >
                <h2 className="text-xl font-hackwise text-white uppercase mb-6">Booking Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-mono text-white/40 uppercase mb-1">Team Name</p>
                    <p className="text-white font-mono">{formData.team_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-white/40 uppercase mb-1">Team Lead</p>
                    <p className="text-white font-mono">{formData.team_lead_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-white/40 uppercase mb-1">Contact</p>
                    <p className="text-white font-mono text-sm">{formData.team_lead_email}</p>
                    <p className="text-white font-mono text-sm">{formData.team_lead_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-white/40 uppercase mb-1">Members</p>
                    <p className="text-white font-mono">{formData.total_members} person(s)</p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-white/40 uppercase mb-1">Check-in</p>
                    <p className="text-white font-mono text-sm">
                      {new Date(formData.check_in_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-mono text-white/40 uppercase mb-1">Check-out</p>
                    <p className="text-white font-mono text-sm">
                      {new Date(formData.check_out_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show payment failed
  if (paymentFailed && submitted) {
    return (
      <section className="section-container border-t border-white/10 pb-24 pt-40 md:pt-48">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <XCircle className="text-red-400" size={48} />
              <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider">
                Payment <span className="text-red-400">Failed</span>
              </h1>
            </div>
            {error && (
              <p className="text-red-400 font-mono text-sm md:text-base mb-6">
                {error}
              </p>
            )}
            <p className="text-white/60 font-mono text-sm md:text-base mb-6">
              Your accommodation request has been saved. You can try the payment again.
            </p>
            <button
              onClick={() => {
                setPaymentFailed(false);
                setError('');
                if (queryId) {
                  initiatePayment(queryId, calculateTotalPrice());
                }
              }}
              className="relative inline-flex items-center justify-center group cursor-pointer mt-4"
            >
              <div
                className="absolute inset-0 bg-orange-500/80 group-hover:bg-orange-500 transition-colors duration-300"
                style={{ clipPath: BTN_CLIP }}
              />
              <div
                className="relative m-[1px] px-6 py-3 text-center transition-all duration-300"
                style={{ clipPath: BTN_CLIP }}
              >
                <span className="relative text-white font-mono font-bold text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                  <CreditCard size={18} />
                  Retry Payment
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Show form
  return (
    <section className="section-container border-t border-white/10 pb-24 pt-40 md:pt-48">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-hackwise text-white uppercase tracking-wider mb-4">
            Accommodation <span className="text-orange-500">Portal</span>
          </h1>
          <p className="text-white/60 font-mono text-sm md:text-base mb-6">
            Book your stay for Hackwise 2.0
          </p>
          {settings.price > 0 && calculateTotalPrice() > 0 && (
            <div className="inline-flex flex-col items-center gap-2 px-6 py-3 bg-orange-500/10 border border-orange-500/30">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-white/60 uppercase">Total Price:</span>
                <span className="text-2xl font-bold text-orange-500 font-mono">{formatPrice(calculateTotalPrice())}</span>
              </div>
              {calculateNights() > 0 && (
                <div className="text-center space-y-1">
                  <p className="text-xs font-mono text-white/40">
                    {formatPrice(settings.price)} per night × {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                    {settings.pricingType === 'per_person' && ` × ${formData.total_members} member${formData.total_members !== 1 ? 's' : ''}`}
                  </p>
                  {settings.pricingType === 'per_team' && (
                    <p className="text-xs font-mono text-white/40">Per team rate</p>
                  )}
                </div>
              )}
              {calculateNights() === 0 && formData.check_in_date && formData.check_out_date && (
                <p className="text-xs font-mono text-yellow-400">Please select valid check-in and check-out dates</p>
              )}
              {!formData.check_in_date || !formData.check_out_date && (
                <p className="text-xs font-mono text-white/40">Select dates to see pricing</p>
              )}
            </div>
          )}
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-px" style={{ filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}>
            <div
              className="absolute inset-0 bg-white/20 group-hover:bg-orange-500/50 transition-colors duration-300"
              style={{ clipPath: CARD_CLIP }}
            />
            <div
              className="relative bg-[#0A090F] p-6 md:p-8 space-y-6"
              style={{ clipPath: CARD_CLIP }}
            >
              {error && (
                <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60 uppercase tracking-wider">
                      Team Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="team_name"
                      value={formData.team_name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500/60 placeholder:text-white/25"
                      placeholder="Enter team name"
                    />
                  </div>

                  {/* Team Lead Name */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60 uppercase tracking-wider">
                      Team Lead Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="team_lead_name"
                      value={formData.team_lead_name}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500/60 placeholder:text-white/25"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Mail size={14} />
                      Email <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="team_lead_email"
                      value={formData.team_lead_email}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500/60 placeholder:text-white/25"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Phone size={14} />
                      Phone <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="team_lead_phone"
                      value={formData.team_lead_phone}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500/60 placeholder:text-white/25"
                      placeholder="+91 1234567890"
                    />
                  </div>

                  {/* Total Members */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-white/60 uppercase tracking-wider flex items-center gap-2">
                      <Users size={14} />
                      Total Members <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="total_members"
                      value={formData.total_members}
                      onChange={handleChange}
                      required
                      min="1"
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500/60 placeholder:text-white/25"
                    />
                    {settings.price > 0 && calculateNights() > 0 && (
                      <div className="text-xs font-mono text-orange-400/80 space-y-1">
                        <p>
                          {calculateNights()} night{calculateNights() !== 1 ? 's' : ''} × {formatPrice(settings.price)} per night
                          {settings.pricingType === 'per_person' && ` × ${formData.total_members} member${formData.total_members !== 1 ? 's' : ''}`}
                        </p>
                        <p className="font-bold">Total: {formatPrice(calculateTotalPrice())}</p>
                      </div>
                    )}
                  </div>

                  {/* Check-in Date */}
                  <div className="space-y-2">
                    <DatePicker
                      label="Check-in Date"
                      name="check_in_date"
                      value={formData.check_in_date}
                      onChange={handleChange}
                      required
                      placeholder="Select check-in date"
                      icon={<Calendar size={14} />}
                    />
                    {formData.check_in_date && formData.check_out_date && calculateNights() > 0 && (
                      <p className="text-xs font-mono text-orange-400/80">
                        {calculateNights()} night{calculateNights() !== 1 ? 's' : ''} stay
                      </p>
                    )}
                  </div>

                  {/* Check-out Date */}
                  <div className="space-y-2">
                    <DatePicker
                      label="Check-out Date"
                      name="check_out_date"
                      value={formData.check_out_date}
                      onChange={handleChange}
                      required
                      minDate={formData.check_in_date}
                      placeholder="Select check-out date"
                      icon={<Calendar size={14} />}
                    />
                    {formData.check_in_date && formData.check_out_date && calculateNights() === 0 && (
                      <p className="text-xs font-mono text-red-400/80">
                        Check-out must be after check-in
                      </p>
                    )}
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-white/60 uppercase tracking-wider flex items-center gap-2">
                    <FileText size={14} />
                    Special Requirements (Optional)
                  </label>
                  <textarea
                    name="special_requirements"
                    value={formData.special_requirements}
                    onChange={handleChange}
                    rows="4"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-mono focus:outline-none focus:border-orange-500/60 placeholder:text-white/25 resize-none"
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting || paymentProcessing}
                    className="relative inline-flex items-center justify-center w-full group cursor-pointer"
                  >
                    <div
                      className="absolute inset-0 bg-orange-500/80 group-hover:bg-orange-500 transition-colors duration-300"
                      style={{ clipPath: BTN_CLIP }}
                    />
                    <div
                      className="relative m-[1px] py-3 text-center transition-all duration-300 w-full"
                      style={{ clipPath: BTN_CLIP }}
                    >
                      <span className="relative text-white font-mono font-bold text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                        {(submitting || paymentProcessing) ? (
                          <>
                            <Loader2 className="animate-spin" size={18} />
                            {paymentProcessing ? 'Processing Payment...' : 'Submitting...'}
                          </>
                        ) : (
                          <DecryptedText
                            text="Proceed to Payment"
                            sequential
                            speed={50}
                          />
                        )}
                      </span>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
