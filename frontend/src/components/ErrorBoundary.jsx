import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                    <h1 className="text-3xl font-bold mb-4 text-red-500">Something went wrong.</h1>
                    <div className="bg-gray-900 p-6 rounded-lg max-w-lg w-full overflow-auto">
                        <p className="font-mono text-sm text-red-400 mb-2">{this.state.error && this.state.error.toString()}</p>
                        <details className="whitespace-pre-wrap font-mono text-xs text-gray-500">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </details>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
