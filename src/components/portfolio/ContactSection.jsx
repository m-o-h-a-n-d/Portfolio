import { useState } from 'react';
import { useProfile } from '../../context/DataContext';
import { Send } from 'lucide-react';
import Swal from '../../lib/swal';
import { apiPost } from '../../api/request';
import { PORTFOLIO_ENDPOINTS } from '../../api/endpoints';
import { extractFieldErrors } from '../../lib/validationErrors';

const ContactSection = () => {
  const profile = useProfile();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Check form validity
    const { fullname, email, subject, message } = newFormData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(
      fullname.trim() !== '' &&
      emailRegex.test(email) &&
      subject.trim() !== '' &&
      message.trim() !== ''
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      setFieldErrors({});
      await apiPost(PORTFOLIO_ENDPOINTS.contactUs.store, {
        name: formData.fullname,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      setFormData({ fullname: '', email: '', subject: '', message: '' });
      setIsValid(false);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Message sent successfully!',
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.message || 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="animate-fade-in">
      {/* Title */}
      <header>
        <h2 className="h2 article-title">Contact</h2>
      </header>

      {/* Map */}
      <section className="relative h-[250px] w-full rounded-2xl mb-8 border border-border overflow-hidden">
        <figure className="h-full">
          <iframe
            src={profile?.map_embed}
            width="100%"
            height="100%"
            loading="lazy"
            className="border-none grayscale invert"
            title="Location Map"
          />
        </figure>
      </section>

      {/* Contact Form */}
      <section className="mb-[10px]">
        <h3 className="h3 mb-5">Contact Form</h3>

        <form onSubmit={handleSubmit}>
          {/* Input Group */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px] mb-[25px]">
            <input 
              type="text" 
              name="fullname" 
              className="form-input" 
              placeholder="Full name" 
              required
              value={formData.fullname}
              onChange={handleChange}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>
            )}
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              placeholder="Email address" 
              required
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          {/* Subject */}
          <input 
            type="text" 
            name="subject" 
            className="form-input mb-[25px]" 
            placeholder="Subject" 
            required
            value={formData.subject}
            onChange={handleChange}
          />
          {fieldErrors.subject && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.subject}</p>
          )}

          {/* Message */}
          <textarea 
            name="message" 
            className="form-input min-h-[100px] h-[120px] max-h-[200px] resize-y mb-[25px]" 
            placeholder="Your Message" 
            required
            value={formData.message}
            onChange={handleChange}
          />
          {fieldErrors.message && (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.message}</p>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="form-btn"
            disabled={!isValid || isSubmitting}
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </section>
    </article>
  );
};

export default ContactSection;
