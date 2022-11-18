export function attachDeclarativeShadowDOM(element: HTMLElement) {
  const template = element.firstChild as HTMLTemplateElement;
  const mode = template.getAttribute('shadowroot')! as 'open' | 'closed';
  const shadowRoot = (template.parentNode as HTMLElement).attachShadow({ mode });
  shadowRoot.appendChild(template.content);
  template.remove();
}
