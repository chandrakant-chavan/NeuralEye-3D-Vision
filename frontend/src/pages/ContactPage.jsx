import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Loader2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const recipientEmail = "chandrakant150805@gmail.com";

  const buildMailtoUrl = () => {
    const subjectEncoded = encodeURIComponent(`[NeuralEye Inquiry] ${formData.subject || 'Engineering Consultation'}`);
    const bodyEncoded = encodeURIComponent(
      `Hi Chandrakant,\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nProject Details:\n${formData.message}\n\n---\nSent via NeuralEye 3D Vision Inquiry Portal`
    );
    return `mailto:${recipientEmail}?subject=${subjectEncoded}&body=${bodyEncoded}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionStatus(null);

    const web3FormsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    let dispatched = false;
    let dispatchMethod = "";

    // 1. Try Web3Forms if Access Key is configured in .env
    if (web3FormsKey && web3FormsKey.trim() !== "") {
      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: web3FormsKey.trim(),
            name: formData.name,
            email: formData.email,
            subject: `[NeuralEye Inquiry] ${formData.subject}`,
            message: formData.message,
            from_name: `${formData.name} via NeuralEye Vision`,
            replyto: formData.email,
          }),
        });
        const resData = await response.json();
        if (resData.success) {
          dispatched = true;
          dispatchMethod = "Web3Forms Direct Egress";
        }
      } catch (err) {
        console.warn("Web3Forms dispatch attempt skipped or failed:", err);
      }
    }

    // 2. Try Backend API endpoint (/api/v1/contact)
    if (!dispatched) {
      try {
        const response = await fetch(`${apiUrl}/api/v1/contact`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          const resData = await response.json();
          dispatched = true;
          dispatchMethod = resData.email_dispatched ? "NeuralEye SMTP Server" : "NeuralEye Inquiries Hub";
        }
      } catch (err) {
        console.warn("Backend API contact dispatch skipped or failed:", err);
      }
    }

    // 3. Fallback: If neither API key nor backend SMTP is connected, trigger direct mailto client
    if (!dispatched) {
      // Trigger user's default email client pre-filled with all details
      window.location.href = buildMailtoUrl();
      dispatchMethod = "Client Mail Protocol (mailto)";
    }

    setIsSubmitting(false);
    setSubmissionStatus(dispatchMethod);
    setSubmitted(true);
  };

  return (
    <div className="inner-page-container">
      <Link to="/" className="neural-back-btn">
        <ArrowLeft size={16} />
        <span>Back to Detector Dashboard</span>
      </Link>

      <div className="section-header-pill" style={{ marginTop: 12 }}>
        <Send size={15} className="text-cyan" />
        <span>DIRECT COMMUNICATION CHANNEL</span>
      </div>

      <h1 className="section-heading-primary">
        Let's Build the Future of <span>Vision AI.</span>
      </h1>
      <p className="section-subtext">
        Get in touch for computer vision consultations, custom deep learning model deployments, or enterprise architecture inquiries.
      </p>

      {/* 2-Column Contact Grid */}
      <div className="contact-layout-grid">
        {/* Left Column: Direct Details & Guarantees */}
        <div className="contact-info-col">
          <div className="contact-detail-card">
            <div className="cdc-icon">
              <Mail size={22} />
            </div>
            <div className="cdc-content">
              <span className="cdc-label">DIRECT INQUIRIES</span>
              <a href={`mailto:${recipientEmail}`} className="cdc-value-link">
                {recipientEmail}
              </a>
              <p className="cdc-hint">Inquiries typically answered within 24 hours.</p>
            </div>
          </div>

          <div className="contact-detail-card">
            <div className="cdc-icon">
              <MapPin size={22} />
            </div>
            <div className="cdc-content">
              <span className="cdc-label">DEVELOPER LOCATION</span>
              <strong className="cdc-value">Maharashtra & Karnataka, India</strong>
              <p className="cdc-hint">Available for remote contracts worldwide.</p>
            </div>
          </div>

          <div className="contact-detail-card">
            <div className="cdc-icon">
              <Clock size={22} />
            </div>
            <div className="cdc-content">
              <span className="cdc-label">AVAILABILITY STATUS</span>
              <strong className="cdc-value" style={{ color: '#10b981' }}>Active // Accepting Select Inquiries</strong>
              <p className="cdc-hint">Edge AI development, model quantization & consulting.</p>
            </div>
          </div>

          <div className="contact-guarantee-box">
            <div className="cgb-top">
              <ShieldCheck size={18} />
              <span>CONFIDENTIALITY ASSURANCE</span>
            </div>
            <p className="cgb-text">
              All proprietary datasets, architecture proposals, and NDA communications are handled with strict privacy protocols.
            </p>
          </div>
        </div>

        {/* Right Column: Frosted Glass Contact Form */}
        <div className="contact-form-col">
          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success-state">
                <div className="success-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3>Inquiry Dispatched Successfully!</h3>
                <p>
                  Thank you for reaching out, <b>{formData.name}</b>. Your message has been routed to <b>Chandrakant Chavan</b>.
                </p>

                <div className="delivery-receipt-badge" style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  margin: '16px 0',
                  textAlign: 'left',
                  fontSize: 13,
                  lineHeight: 1.5
                }}>
                  <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 4 }}>
                    📬 Target Inbox: {recipientEmail}
                  </div>
                  <div style={{ color: '#556c94', fontSize: 12 }}>
                    Channel: <strong>{submissionStatus || 'Secure Dispatch Protocol'}</strong>
                  </div>
                  <div style={{ color: '#556c94', fontSize: 12, marginTop: 4 }}>
                    Subject: <em>{formData.subject}</em>
                  </div>
                </div>

                <div className="contact-success-actions">
                  <a
                    href={buildMailtoUrl()}
                    className="primary-button"
                    style={{ fontSize: 13, padding: '10px 18px' }}
                  >
                    <Mail size={15} />
                    <span>Open in Email App / Gmail</span>
                    <ExternalLink size={14} />
                  </a>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    style={{ fontSize: 13, padding: '10px 18px' }}
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-body">
                <div className="form-header-row">
                  <div className="form-header-title">
                    <Sparkles size={18} className="text-cyan" />
                    <h4>Send an Engineering Inquiry</h4>
                  </div>
                  <span className="form-recipient-badge">
                    Direct to {recipientEmail}
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    className="form-input-styled"
                    placeholder="e.g. Alex Morgan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work / Contact Email</label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    className="form-input-styled"
                    placeholder="e.g. alex@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject / Topic</label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    className="form-input-styled"
                    placeholder="e.g. Computer Vision Implementation / YOLOv11 Consulting"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project Details & Requirements</label>
                  <textarea
                    required
                    rows={5}
                    disabled={isSubmitting}
                    className="form-textarea-styled"
                    placeholder="Describe your vision AI objectives, target hardware, or timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="primary-button"
                  style={{ width: '100%', justifyContent: 'center', opacity: isSubmitting ? 0.75 : 1 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Transmit Inquiry</span>
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <a
                    href={buildMailtoUrl()}
                    style={{ fontSize: 12, color: '#556c94', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>Prefer writing via your email client? Open Mailto</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
