import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';

const ConfirmContext = createContext(null);

const DEFAULTS = {
  title: 'Are you sure?',
  message: 'This cannot be undone.',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  destructive: true,
};

/**
 * App-wide confirmation. Always use `const { confirm } = useConfirm()`.
 * Renders a single shared ConfirmModal — do not add other confirm UIs.
 *
 * @example
 * const ok = await confirm({ title: 'Delete?', message: '…', confirmLabel: 'Delete' });
 * if (!ok) return;
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const close = useCallback((result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    if (resolve) resolve(result);
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ ...DEFAULTS, ...options });
    });
  }, []);

  const opts = state || DEFAULTS;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmModal
        visible={!!state}
        title={opts.title}
        message={opts.message}
        confirmLabel={opts.confirmLabel}
        cancelLabel={opts.cancelLabel}
        destructive={opts.destructive !== false}
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
