import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback
                    error={this.state.error}
                    onReset={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}

interface ErrorFallbackProps {
    error: Error | null;
    onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
    const { t } = useTranslation('errors');

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
                <div className="mb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <svg
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">
                        {t('boundary.title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('boundary.message')}
                    </p>
                </div>

                {error && import.meta.env.MODE === 'development' && (
                    <div className="mb-6 rounded-md bg-gray-100 p-4 text-left">
                        <p className="mb-2 text-sm font-semibold text-gray-700">
                            {t('boundary.errorDetails')}:
                        </p>
                        <p className="break-words text-xs text-gray-600">
                            {error.message}
                        </p>
                        {error.stack && (
                            <details className="mt-2">
                                <summary className="cursor-pointer text-xs font-medium text-gray-700">
                                    {t('boundary.stackTrace')}
                                </summary>
                                <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-gray-600">
                                    {error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        onClick={onReset}
                        className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                    >
                        {t('boundary.tryAgain')}
                    </button>
                    <button
                        onClick={() => (window.location.href = '/')}
                        className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                    >
                        {t('boundary.goHome')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorBoundaryClass;
