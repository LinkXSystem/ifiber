export default function h(element, attrs) {
  let props = attrs || {};
  let key = props.key || null;
  let ref = props.ref || null;

  let children = [];

  for (let i = 2; i < arguments.length; i += 1) {
    let vnode = arguments[i];

    if (vnode === null || typeof vnode === 'boolean') {
      continue;
    }

    if (typeof vnode === 'string' || typeof vnode === 'number') {
      children.push({
        text: 'text',
        props: {
          nodeValue: vnode
        }
      });
      continue;
    }

    children.push(vnode);
  }

  if (children.length) {
    // TODO: 是否可以直接赋值 children ？
    props = Object.assign({}, props, {
      children
    });
  }

  delete props.key;
  delete props.ref;

  return { element, props, key, ref };
}
