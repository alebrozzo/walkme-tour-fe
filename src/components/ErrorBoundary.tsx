import React from 'react';
import { Text, View } from 'react-native';
import { logMessage } from '../utils/logger';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const errorDetails = Object.getOwnPropertyNames(error).reduce<Record<string, unknown>>((details, key) => {
      details[key] = (error as Record<string, unknown>)[key];
      return details;
    }, {});

    logMessage(
      'error',
      `Caught error: name=${error.name} message=${error.message} stack=${error.stack ?? ''} componentStack=${info.componentStack ?? ''} details=${JSON.stringify(errorDetails)}`,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Something went wrong</Text>
          <Text style={{ color: 'red', fontFamily: 'monospace' }}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
