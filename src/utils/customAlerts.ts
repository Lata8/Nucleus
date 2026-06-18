/**
 * Custom alerts and confirmation dialog utility
 * Integrates perfectly with the App's custom style theme (Nucleus)
 * and avoids using blocking native browser popups.
 */

export interface DialogConfig {
  title?: string;
  message: string;
  type?: 'success' | 'info' | 'error' | 'warning';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  isConfirm?: boolean;
}

let activeHandler: ((config: DialogConfig) => void) | null = null;

export const setDialogHandler = (handler: (config: DialogConfig) => void) => {
  activeHandler = handler;
};

export const removeDialogHandler = () => {
  activeHandler = null;
};

/**
 * Muestra una alerta personalizada con diseño "Nucleus OS"
 */
export const customAlert = (
  message: string, 
  type: 'success' | 'info' | 'error' | 'warning' = 'info', 
  title?: string
) => {
  if (activeHandler) {
    activeHandler({
      title: title || (type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : type === 'warning' ? 'Aviso' : 'Información'),
      message,
      type,
      isConfirm: false,
    });
  } else {
    // Fallback simple si no hay handler registrado
    alert(message);
  }
};

/**
 * Muestra un diálogo de confirmación personalizado con diseño "Nucleus OS"
 * Ejecuta `onConfirm` si el usuario acepta, o `onCancel` si cancela.
 */
export const customConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  title: string = '¿Confirmar Acción?'
) => {
  if (activeHandler) {
    activeHandler({
      title,
      message,
      type: 'warning',
      isConfirm: true,
      onConfirm,
      onCancel,
    });
  } else {
    // Fallback nativo
    if (window.confirm(message)) {
      onConfirm();
    } else {
      if (onCancel) onCancel();
    }
  }
};
