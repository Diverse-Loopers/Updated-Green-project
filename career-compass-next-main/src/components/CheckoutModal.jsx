'use client';

import { useState } from 'react';

export default function CheckoutModal({ course, userId, userEmail, userName, userPhone, onClose, onSuccess }) {
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  const price = Number(course?.price) || 0;
  const discountAmount = (price * discount) / 100;
  const finalPrice = Math.max(0, price - discountAmount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus({ type: 'loading', message: 'Validating...' });

    try {
      const res = await fetch('/api/coupons/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), courseId: course.id }),
      });
      const data = await res.json();

      if (data.valid) {
        setDiscount(data.discount_percent);
        setCouponStatus({ type: 'success', message: data.message });
      } else {
        setDiscount(0);
        setCouponStatus({ type: 'error', message: data.message });
      }
    } catch {
      setCouponStatus({ type: 'error', message: 'Failed to validate coupon' });
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-checkout-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create order on backend
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          userId,
          userName: userName || 'Student',
          userEmail: userEmail || '',
          userPhone: userPhone || '',
          couponCode: discount > 0 ? couponCode.trim() : null,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setPaymentResult({ type: 'error', message: data.error || 'Failed to create order' });
        setLoading(false);
        return;
      }

      // Free enrollment
      if (data.free) {
        setPaymentResult({ type: 'success', message: 'Enrolled successfully!' });
        setLoading(false);
        setTimeout(() => onSuccess && onSuccess(), 2000);
        return;
      }

      // Step 2: Load Razorpay script and open checkout modal
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        setPaymentResult({ type: 'error', message: 'Failed to load payment gateway. Please try again.' });
        setLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amountInPaise,
        currency: data.currency,
        name: 'Diverse Loopers',
        description: data.courseTitle,
        order_id: data.orderId,
        image: '/images/logo.png',
        prefill: {
          name: userName || '',
          email: userEmail || '',
          contact: userPhone || '',
        },
        theme: {
          color: '#4f46e5',
        },
        handler: async function (response) {
          // Step 3: Verify payment on backend
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId: course.id,
                userId,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              setPaymentResult({ type: 'success', message: 'Payment successful! You are now enrolled.' });
              setTimeout(() => onSuccess && onSuccess(), 2000);
            } else {
              setPaymentResult({ type: 'error', message: verifyData.error || 'Payment verification failed.' });
            }
          } catch {
            setPaymentResult({ type: 'error', message: 'Verification error. Contact support.' });
          }
          setLoading(false);
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        setPaymentResult({
          type: 'error',
          message: response.error?.description || 'Payment failed. Please try again.',
        });
        setLoading(false);
      });

      rzp.open();

    } catch (err) {
      setPaymentResult({ type: 'error', message: 'Payment error. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} style={styles.closeBtn}>✕</button>

        {paymentResult ? (
          <div style={styles.resultContainer}>
            <div style={{
              ...styles.resultIcon,
              background: paymentResult.type === 'success'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #ef4444, #dc2626)'
            }}>
              {paymentResult.type === 'success' ? '✓' : '✗'}
            </div>
            <h2 style={styles.resultTitle}>
              {paymentResult.type === 'success' ? 'Enrollment Successful!' : 'Payment Failed'}
            </h2>
            <p style={styles.resultMsg}>{paymentResult.message}</p>
            <button onClick={onClose} style={styles.resultBtn}>
              {paymentResult.type === 'success' ? 'Go to Course' : 'Try Again'}
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerIcon}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" /></svg>
              </div>
              <h2 style={styles.title}>Complete Your Enrollment</h2>
              <p style={styles.subtitle}>Secure your spot in this course</p>
            </div>

            {/* Course Summary */}
            <div style={styles.courseSummary}>
              <div style={styles.courseImg}>
                {course?.image_url
                  ? <img src={course.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  : <span style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>Course</span>
                }
              </div>
              <div>
                <h3 style={styles.courseName}>{course?.title || 'Course'}</h3>
                <p style={styles.courseInstructor}>{course?.instructor && `By ${course.instructor}`}</p>
              </div>
            </div>

            {/* Coupon Section */}
            <div style={styles.couponSection}>
              <label style={styles.label}>Have a coupon code?</label>
              <div style={styles.couponRow}>
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  style={styles.couponInput}
                />
                <button onClick={applyCoupon} style={styles.couponBtn}>Apply</button>
              </div>
              {couponStatus && (
                <p style={{
                  ...styles.couponMsg,
                  color: couponStatus.type === 'success' ? '#10b981'
                    : couponStatus.type === 'error' ? '#ef4444' : '#6b7280'
                }}>
                  {couponStatus.message}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div style={styles.priceSection}>
              <div style={styles.priceRow}>
                <span>Course Price</span>
                <span>Rs. {price.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div style={{ ...styles.priceRow, color: '#10b981' }}>
                  <span>Discount ({discount}%)</span>
                  <span>- Rs. {discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={styles.divider}></div>
              <div style={{ ...styles.priceRow, fontWeight: 800, fontSize: 20 }}>
                <span>Total</span>
                <span style={{ color: '#4f46e5' }}>Rs. {finalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              style={{
                ...styles.payBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span style={styles.spinner}></span>
              ) : (
                <>
                  {finalPrice === 0 ? 'Enroll for Free' : `Pay Rs. ${finalPrice.toLocaleString('en-IN')}`}
                  <span style={{ marginLeft: 8 }}>→</span>
                </>
              )}
            </button>

            <p style={styles.secureText}>
              Secured by Razorpay Payment Gateway
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)',
    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modal: {
    background: '#fff', borderRadius: 24, maxWidth: 480, width: '100%', padding: '32px 28px',
    position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none',
    borderRadius: 10, width: 36, height: 36, fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
  },
  header: { textAlign: 'center', marginBottom: 24 },
  headerIcon: { marginBottom: 8, display: 'flex', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  courseSummary: {
    display: 'flex', gap: 16, alignItems: 'center', padding: 16,
    background: '#f8fafc', borderRadius: 16, marginBottom: 20,
  },
  courseImg: {
    width: 64, height: 64, borderRadius: 12, overflow: 'hidden',
    background: 'linear-gradient(135deg,#e8f5e9,#a5d6a7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  courseName: { fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 },
  courseInstructor: { fontSize: 13, color: '#64748b', margin: '4px 0 0' },
  couponSection: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, display: 'block' },
  couponRow: { display: 'flex', gap: 8 },
  couponInput: {
    flex: 1, padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: 12,
    fontSize: 14, fontWeight: 700, letterSpacing: 2, outline: 'none',
    transition: 'border-color 0.2s',
  },
  couponBtn: {
    padding: '12px 20px', background: '#4f46e5', color: '#fff', border: 'none',
    borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14,
  },
  couponMsg: { fontSize: 13, fontWeight: 600, marginTop: 8 },
  priceSection: {
    background: '#f8fafc', borderRadius: 16, padding: 20, marginBottom: 20,
  },
  priceRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: 15,
    fontWeight: 600, color: '#334155', padding: '6px 0',
  },
  divider: { height: 1, background: '#e2e8f0', margin: '10px 0' },
  payBtn: {
    width: '100%', padding: '16px 24px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff', border: 'none', borderRadius: 16, fontSize: 17, fontWeight: 800,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
  },
  secureText: { textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 12, fontWeight: 600 },
  spinner: {
    width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff', borderRadius: '50%',
    animation: 'spin 0.6s linear infinite', display: 'inline-block',
  },
  resultContainer: { textAlign: 'center', padding: '20px 0' },
  resultIcon: {
    width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 36, color: '#fff', fontWeight: 800,
  },
  resultTitle: { fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' },
  resultMsg: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  resultBtn: {
    padding: '14px 32px', background: '#4f46e5', color: '#fff', border: 'none',
    borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
};
