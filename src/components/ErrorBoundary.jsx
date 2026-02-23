import { Component } from "react";
import PropTypes from "prop-types";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 font-sans p-8">
                    <div className="text-center max-w-[480px] bg-white rounded-3xl py-12 px-10 shadow-2xl border border-slate-200">
                        {/* Warning Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-3xl">
                            ⚠️
                        </div>

                        <h1 className="text-3xl font-bold text-slate-800 mb-3">
                            Something went wrong
                        </h1>

                        <p className="text-base text-slate-500 leading-relaxed mb-8">
                            An unexpected error occurred. Please try reloading the page.
                            If the problem persists, contact support.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="py-3.5 px-8 bg-gradient-to-br from-[#1864ab] to-indigo-500 text-white border-none rounded-xl font-semibold text-[0.9375rem] cursor-pointer transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
};
