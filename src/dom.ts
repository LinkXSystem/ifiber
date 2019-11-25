import { VNode } from './vnode';

export function updateElement(
  element: HTMLElement,
  prevProps: Object,
  nextProps: Object
) {
  for (let name in { ...prevProps, ...nextProps }) {
    let oValue = prevProps[name];
    let nValue = nextProps[name];

    // 属性值未变化
    if (oValue === nValue || name === 'children') continue;

    // 样式
    if (name === 'style') {
      for (let i in { ...oValue, nValue }) {
        if (!(oValue && nValue && oValue[i] === nValue[i])) {
          element[name][i] = (nValue && nValue[i]) || '';
        }
      }

      continue;
    }

    if (/^on/i.test(name)) {
      name = name.slice(2).toLocaleLowerCase();
      if (oValue) {
        element.removeEventListener(name, oValue);
      }
      element.addEventListener(name, nValue);

      continue;
    }

    if (name in element) {
      element[name] = nValue !== null ? nValue : '';
      continue;
    }

    if (nValue === null || nValue === false) {
      element.removeAttribute(name);
      continue;
    }

    element.setAttribute(name, nValue);
  }
}

export function createElement(vnode: VNode) {
  const { type } = vnode;

  let element;

  switch (type) {
    case 'text':
      element = document.createTextNode('');
      break;
    default:
      element = document.createElement(type as keyof HTMLElementTagNameMap);
  }

  updateElement(element, {}, vnode.props);

  return element;
}
