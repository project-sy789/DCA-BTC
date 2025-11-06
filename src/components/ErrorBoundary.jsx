import { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#e0e0e0',
          backgroundColor: '#1a1a1a',
          minHeight: '100vh'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>⚠️ เกิดข้อผิดพลาด</h1>
          <p style={{ marginBottom: '20px' }}>กรุณารีเฟรชหน้าเว็บ หรือลบข้อมูลใน LocalStorage</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            ลบข้อมูลและรีเฟรช
          </button>
          {this.state.error && (
            <details style={{ marginTop: '40px', textAlign: 'left', maxWidth: '800px', margin: '40px auto' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>รายละเอียด Error</summary>
              <pre style={{
                backgroundColor: '#2a2a2a',
                padding: '20px',
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
