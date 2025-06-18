'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';

import { useAuth } from '@/context/AuthContext';
import { showAlert } from '@/lib/api';

// NEW: Define a state shape for our form action
interface ActionState {
  message: string;
  status: 'success' | 'error' | 'idle';
}

// NEW: A dedicated component for the submit button
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-100" disabled={pending}>
      {pending ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Creating Account...
        </>
      ) : (
        'Create Account'
      )}
    </button>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

// Define error shape for registration
interface RegistrationError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

// NEW: The action function for registration
const handleRegisterAction = async (state: ActionState, formData: FormData): Promise<ActionState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const first_name = formData.get('first_name') as string;
    const last_name = formData.get('last_name') as string;
    const phone = formData.get('phone') as string || '';
    const address = formData.get('address') as string || '';

    if (password !== confirmPassword) {
      return { status: 'error', message: 'Passwords do not match' };
    }
    if (password.length < 6) {
      return { status: 'error', message: 'Password must be at least 6 characters long' };
    }

    try {
      await register({ 
        email, 
        password, 
        first_name, 
        last_name, 
        phone, 
        address 
      });
      return { status: 'success', message: 'Account created successfully!' };
    } catch (error: unknown) {
      // Handle specific error structure
      const err = error as RegistrationError;
      return {
        status: 'error',
        message: err.response?.data?.message || 'Failed to create account. Please try again.',
      };
    }
  };

  const initialState: ActionState = { message: '', status: 'idle' };
  const [state, formAction] = React.useActionState(handleRegisterAction, initialState);

  // NEW: useEffect to handle side-effects from the action's result
  useEffect(() => {
    if (state.status === 'success') {
      showAlert.success(state.message);
      router.push('/');
    }
    if (state.status === 'error') {
      showAlert.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title">🏎️ Create Account</h2>
                <p className="text-muted">Join the RaceParts community</p>
              </div>

              {/* UPDATED: Form uses the `action` prop */}
              <form action={formAction}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="first_name" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="first_name" name="first_name" required placeholder="Enter your first name"/>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="last_name" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="last_name" name="last_name" required placeholder="Enter your last name"/>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input type="email" className="form-control" id="email" name="email" required placeholder="Enter your email"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" name="password" required placeholder="Enter your password" minLength={6}/>
                  <div className="form-text">Password must be at least 6 characters long.</div>
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" required placeholder="Confirm your password"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" id="phone" name="phone" placeholder="Enter your phone number (optional)"/>
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">Address</label>
                  <textarea className="form-control" id="address" name="address" rows={2} placeholder="Enter your address (optional)"></textarea>
                </div>
                <SubmitButton />
              </form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-decoration-none">Sign in here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
