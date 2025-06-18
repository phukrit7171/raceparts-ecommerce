'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// NEW: Import hooks for React Actions
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom'; // Keep useFormStatus from react-dom

import { useAuth } from '@/context/AuthContext';
import { showAlert } from '@/lib/api';

// NEW: Define a state shape for our form action
interface ActionState {
  message: string;
  status: 'success' | 'error' | 'idle';
}

// NEW: A dedicated component for the submit button that is aware of the form's pending state.
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
      <button type="submit" className="btn btn-primary w-100" disabled={pending}>
      {pending ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Signing In...
        </>
      ) : (
        'Sign In'
      )}
    </button>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  // NEW: The action function that handles the form submission logic.
  // It takes the previous state and form data, and returns the new state.
  const handleLoginAction = async (state: ActionState, formData: FormData): Promise<ActionState> => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      return { status: 'success', message: 'Logged in successfully!' };
  } catch (error: unknown) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      }
      
      return {
        status: 'error',
        message: errorMessage,
      };
    }
  };

  const initialState: ActionState = { message: '', status: 'idle' };

  // Use useActionState to manage form state
  const [state, formAction] = useActionState(handleLoginAction, initialState);

  // Handle successful login and redirect
  useEffect(() => {
    if (state.status === 'success') {
      showAlert.success(state.message);
      // Use replace instead of push to prevent adding to history
      router.replace('/');
    } else if (state.status === 'error') {
      showAlert.error(state.message);
    }
  }, [state, router]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title">🏎️ Login</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>

              {/* UPDATED: The form now uses the `action` prop instead of `onSubmit`. */}
              <form action={formAction}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email" // `name` is essential for FormData
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password" // `name` is essential for FormData
                    required
                    placeholder="Enter your password"
                  />
                </div>
                {/* UPDATED: Use the new SubmitButton component */}
                <SubmitButton />
              </form>

              <div className="text-center mt-3">
                <p className="mb-0">
                  Don&#39;t have an account?{' '}
                  <Link href="/auth/register" className="text-decoration-none">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
