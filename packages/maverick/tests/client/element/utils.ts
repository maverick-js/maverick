export const element = (tagName: string) => document.createElement(tagName);
export const text = (content: string) => document.createTextNode(content);
export const startMarker = () => document.createComment('$');
export const endMarker = () => document.createComment('/$');
export const endArrayMarker = () => document.createComment('/[]');
