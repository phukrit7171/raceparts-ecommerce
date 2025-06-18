export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch (err) {
        document.body.removeChild(textarea);
        console.error('Failed to copy text using execCommand:', err instanceof Error ? err.message : String(err));
        return false;
      }
    }
    
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy text using Clipboard API:', error instanceof Error ? error.message : String(error));
      return false;
    }
  } catch (error) {
    console.error('Failed to copy text:', error instanceof Error ? error.message : String(error));
    return false;
  }
};

export const isClipboardSupported = () => {
  return !!(navigator.clipboard || document.queryCommandSupported?.('copy'));
};
