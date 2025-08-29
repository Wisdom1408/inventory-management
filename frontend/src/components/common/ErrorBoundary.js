import React, { Component } from 'react';

/**
 * Error Boundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but there was an error in this component.</p>
            
            {this.props.showDetails && (
              <div className="error-boundary-details">
                <h3>Error Details</h3>
                <p>{this.state.error && this.state.error.toString()}</p>
                <div className="error-stack">
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </div>
              </div>
            )}
            
            <div className="error-boundary-actions">
              <button 
                className="button button-primary" 
                onClick={this.handleReset}
              >
                Try Again
              </button>
              {this.props.resetRoute && (
                <a 
                  href={this.props.resetRoute} 
                  className="button button-outline"
                >
                  Go to Safe Page
                </a>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;