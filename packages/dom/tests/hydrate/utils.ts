export const el = (tagName: string) => document.createElement(tagName);
export const text = (content: string) => document.createTextNode(content);
export const mark = () => document.createComment('$');
export const endMark = () => document.createComment('/$');
export const arrayEndMark = () => document.createComment('/[]');
