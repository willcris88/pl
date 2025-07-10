import { useEffect, useRef } from 'react';

export function useFormNavigation() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        
        // Só processa para inputs e textareas, pula selects
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          // Não processa se é um botão de submit ou se está em um textarea
          if (target.getAttribute('type') === 'submit' || target.tagName === 'TEXTAREA') {
            return;
          }

          e.preventDefault();
          
          // Encontra todos os elementos focáveis no formulário (exceto selects)
          const form = formRef.current;
          if (!form) return;
          
          const focusableElements = form.querySelectorAll(
            'input:not([disabled]):not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea:not([disabled])'
          );
          
          const currentIndex = Array.from(focusableElements).indexOf(target);
          
          if (currentIndex >= 0 && currentIndex < focusableElements.length - 1) {
            // Move para o próximo elemento
            const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
            nextElement.focus();
          } else if (currentIndex === focusableElements.length - 1) {
            // Se é o último elemento, procura pelo botão de submit
            const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
              submitButton.focus();
            }
          }
        }
      }
    };

    const form = formRef.current;
    if (form) {
      form.addEventListener('keydown', handleKeyDown);
      return () => {
        form.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  return { formRef };
}