import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './Home.jsx'
import './index.css'

// Error boundary để catch lỗi
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ React Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error Stack:', error.stack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: 'red' }}>⚠️ Đã xảy ra lỗi!</h1>
          <p>Vui lòng mở Developer Console (F12) để xem chi tiết lỗi.</p>
          <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', marginTop: '10px' }}>
            <strong>Lỗi:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.toString()}
            </pre>
            {this.state.error?.stack && (
              <>
                <strong>Stack Trace:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '12px' }}>
                  {this.state.error.stack}
                </pre>
              </>
            )}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '15px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#0F172A', color: 'white', border: 'none', borderRadius: '5px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

try {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (error) {
  console.error('❌ Fatal Error:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">⚠️ Lỗi khởi tạo ứng dụng!</h1>
      <p>Vui lòng mở Developer Console (F12) để xem chi tiết.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${error.toString()}</pre>
    </div>
  `;
}
