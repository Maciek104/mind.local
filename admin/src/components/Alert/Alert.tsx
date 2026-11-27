import './Alert.css';
import MaterialIcon from '../MaterialIcon/MaterialIcon';

interface AlertProps {
  kind: 'error' | 'success';
  onDismiss: () => void;
  children: string;
}

function Alert({ kind, onDismiss, children }: AlertProps) {
  return (
    <div className={`alert ${kind}-alert`} role={kind === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      <button onClick={onDismiss} aria-label="Close">
        <MaterialIcon name="close" />
      </button>
    </div>
  );
}

export default Alert;
