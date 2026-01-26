import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegistrationSchema } from '../../validators/registerUser.validator';
import { sendRegisterOtp, verifyRegisterOtp, registerUser } from '../../api/authService';
import Input from '../UI/Input';
import Button from '../UI/Button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const RESEND_STORAGE_KEY = 'register_otp_last_sent';
const RESEND_OTP_TIMEOUT = 300;

const StudentRegistrationForm = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      otp: '',
      contact: '',
      referenceCode: '', // ✅ updated
    },
  });

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isOtpValid = (otp) => /^\d{6}$/.test(otp);

  const handleSendOtp = async () => {
    const email = getValues('email');
    if (!isValidEmail(email)) {
      setError('email', { message: 'Enter a valid email' });
      return;
    }

    try {
      await sendRegisterOtp({ email });
      localStorage.setItem(RESEND_STORAGE_KEY, Date.now().toString());
      setIsOtpSent(true);
      setResendTimer(RESEND_OTP_TIMEOUT);
      toast.success('OTP sent successfully. Please check your email.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    const { email, otp } = getValues();
    if (!isOtpValid(otp)) {
      setError('otp', { message: 'OTP must be 6 digits' });
      return;
    }

    try {
      await verifyRegisterOtp({ email, otp });
      setIsOtpVerified(true);
      localStorage.removeItem(RESEND_STORAGE_KEY);
      toast.success('OTP verified successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'OTP verification failed');
    }
  };

  const onSubmit = async (data) => {
    if (!isOtpVerified) {
      setError('otp', { message: 'Please verify OTP before registering.' });
      return;
    }

    try {
      await registerUser({
        ...data,
        role: 'STUDENT',
      });

      toast.success('Registration successful');
      localStorage.removeItem(RESEND_STORAGE_KEY);
      window.location.href =
        import.meta.env.VITE_CAREER_GUIDANCE_PLATFORM_URL;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  useEffect(() => {
    const lastSent = localStorage.getItem(RESEND_STORAGE_KEY);
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - Number(lastSent)) / 1000);
      if (elapsed < RESEND_OTP_TIMEOUT) {
        setIsOtpSent(true);
        setResendTimer(RESEND_OTP_TIMEOUT - elapsed);
      }
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          {...register('fullName')}
          error={errors.fullName?.message}
          placeholder="Enter your full name"
        />

        <div className="flex gap-2 items-end">
          <div className="w-full">
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Enter your email"
            />
          </div>
          <Button
            type="button"
            onClick={handleSendOtp}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0
              ? `Resend in ${String(Math.floor(resendTimer / 60)).padStart(
                  2,
                  '0'
                )}:${String(resendTimer % 60).padStart(2, '0')}`
              : isOtpSent
              ? 'Resend OTP'
              : 'Send OTP'}
          </Button>
        </div>

        {isOtpSent && (
          <div className="flex gap-2 items-end">
            <Input
              label="Enter OTP"
              type="text"
              {...register('otp')}
              error={errors.otp?.message}
              placeholder="Enter OTP"
            />
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isOtpVerified}
            >
              {isOtpVerified ? 'Verified' : 'Verify'}
            </Button>
          </div>
        )}

        <Input
          label="Contact Number"
          type="text"
          {...register('contact')}
          error={errors.contact?.message}
          placeholder="Enter contact number"
        />

        {/* ✅ Updated reference code input */}
        <Input
          label="Reference Code (Optional)"
          type="text"
          {...register('referenceCode')}
          placeholder="Enter counsellor or institution code"
        />

        <Button
          type="submit"
          className="w-full mt-4"
          disabled={
            isSubmitting ||
            !isOtpVerified ||
            !isValidEmail(getValues('email')) ||
            !getValues('fullName') ||
            !getValues('contact')
          }
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </Button>
      </form>

      <div className="mt-4">
        <Link to="/" className="text-blue-500 hover:underline">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;
