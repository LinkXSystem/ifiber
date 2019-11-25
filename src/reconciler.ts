import { ROOT, DELETE, HOOK, UPDATE, HOST, PLACE } from './constants';
import { shouleYeild, scheduleCallback } from './scheduler';
import { isFunc, isArray } from './utils';
import { updateElement, createElement } from './dom';
import { resetCursor } from './hooks';

let CurrentHook;
let WIP;
let PreCommit;

export function getHook() {
  return CurrentHook || {};
}

/**
 *
 * @param vnode 虚拟 DOM，子节点
 * @param node 容器，用于承载节点的挂载
 * @param done 作用未知
 */
export function render(vnode, node, done) {
  let root = {
    tag: ROOT,
    node,
    props: { children: vnode },
    done
  };

  scheduleWork(root);
}

export function scheduleWork(fiber, lock: boolean = false) {
  fiber.lock = lock;
  WIP = fiber;
  scheduleCallback(performWork);
}

function performWork(didout) {
  console.warn(
    'Yeild Status: ',
    WIP,
    WIP && (!shouleYeild() || didout),
    !shouleYeild()
  );
  while (WIP && (!shouleYeild() || didout)) {
    WIP = performWIP(WIP);
  }

  if (PreCommit) {
    commitWork(PreCommit);
    return null;
  }

  if (!didout) {
    return performWork.bind(null);
  }

  return null;
}

function getParentNode(fiber) {
  while ((fiber = fiber.parent)) {
    if (fiber.tag < HOOK) return fiber.node;
  }
}

function updateHOOK(WIP) {
  WIP.props = WIP.props || {};
  WIP.state = WIP.state || {};

  WIP.effect = {};

  WIP.memo = WIP.memo || {};
  WIP.__deps = WIP.__deps || { m: {}, e: {} };

  CurrentHook = WIP;
  resetCursor();
  reconcileChildren(WIP, WIP.type(WIP.props));
}

function updateHOST(WIP) {
  if (!WIP.node) {
    WIP.node = createElement(WIP);
  }

  let parent = WIP.parentNode || {};

  WIP.insertPoint = parent.last || null;
  parent.last = WIP;
  WIP.node.last = null;

  reconcileChildren(WIP, WIP.props.children);
}

function performWIP(WIP) {
  WIP.patches = WIP.patches || [];
  WIP.parentNode = getParentNode(WIP);
  WIP.tag === HOOK ? updateHOOK(WIP) : updateHOST(WIP);

  if (WIP.child) return WIP.child;

  while (WIP) {
    completeWork(WIP);
    if (WIP.sibling && WIP.lock == null) {
      return WIP.sibling;
    }
    WIP = WIP.parent;
  }
}

function hashfy(arr) {
  let out = {};
  let i = 0;
  let j = 0;
  let temp_ = isArray(arr);

  temp_.forEach(item => {
    if (item.pop) {
      item.forEach(item => {
        item.key
          ? (out[`.${i}.${item.key}`] = item)
          : (out[`.${i}.${j}`] = item) && j++;
      });
      i++;
    } else {
      item.key ? (out['.' + item.key] = item) : (out['.' + i] = item) && i++;
    }
  });

  return out;
}

function createFiber(vnode, tag) {
  vnode.tag = isFunc(vnode.type) ? HOOK : HOST;
  vnode.patchTag = tag;

  return vnode;
}

function reconcileChildren(WIP, children) {
  const oldFibers = WIP.kids;
  const newFibers = (WIP.kids = hashfy(children));

  let resued = {};

  //  更新或删除
  for (const key in oldFibers) {
    let newFiber = newFibers[key];
    let oldFiber = oldFibers[key];

    if (newFiber && newFiber.type === oldFiber.type) {
      resued[key] = oldFiber;
    } else {
      oldFiber.patchTag = DELETE;
      WIP.patches.push(oldFiber);
    }
  }

  let prevFiber;
  let alternate;

  for (const key in newFibers) {
    let newFiber = newFibers[key];
    let oldFiber = resued[key];

    if (oldFiber) {
      alternate = createFiber(oldFiber, UPDATE);
      newFiber.patchTag = UPDATE;
      newFiber = { ...alternate, ...newFiber };
      newFiber.alternate = alternate;
      if (shoulePlace(newFiber)) {
        newFiber.patchTag = PLACE;
      }
    } else {
      newFiber = createFiber(newFiber, PLACE);
    }

    newFibers[key] = newFiber;
    newFiber.parent = WIP;

    if (prevFiber) {
      prevFiber.sibling = newFiber;
    } else {
      WIP.child = newFiber;
    }

    prevFiber = newFiber;
  }

  if (prevFiber) prevFiber.sibling = null;
  WIP.lock = WIP.lock ? false : null;
}

function shoulePlace(fiber) {
  let { parent } = fiber;
  if (parent.tag === HOOK) return parent.key && !parent.lock;
  return fiber.key;
}

function completeWork(fiber) {
  if (fiber.parent) {
    fiber.parent.patches.push(...fiber.patches, fiber);
  } else {
    PreCommit = fiber;
  }
}

function commitWork(WIP) {
  WIP.patches.forEach(patch => {
    commit(patch);
  });
}

function clearup(fiber) {
  let pend = fiber.pending;
  for (const k in pend) {
    pend[k]();
  }

  fiber.pending = null;
}

function applyEffect(fiber) {
  fiber.pending = fiber.pending || {};

  for (const k in fiber.effect) {
    const pend = fiber.pending[k];
    pend && pend();
    const after = fiber.effect[k]();
    after && (fiber.pending[k] = after);
  }

  fiber.effect = null;
}

function commit(fiber) {
  let tag = fiber.patchTag;
  let parent = fiber.parentNode;
  let dom = fiber.node;
  let ref = fiber.ref;

  console.warn(dom);

  switch (tag) {
    case DELETE: {
      clearup(fiber);
      while (fiber.tag === HOOK) fiber = fiber.child;
      try {
        parent.removeChild(fiber.node);
      } catch (e) {
        fiber.node = null;
      }
      break;
    }
    case HOOK: {
      applyEffect(fiber);
      break;
    }
    case UPDATE: {
      updateElement(dom, fiber.alternate.props, fiber.props);
      break;
    }
    default: {
      let point = fiber.insertPoint ? fiber.insertPoint.node : null;
      let after = point ? point.nextSibling : parent.firstChild;

      if (after === dom) return;
      if (after === null && dom === parent.lastChild) return;
      // TODO: dom 存在 underfine 的情况，需要解决
      dom && parent.insertBefore(dom, after);
    }
  }

  if (ref) {
    isFunc(ref) ? ref(dom) : (ref.current = dom);
  }

  fiber.patches = fiber.parent.patches = [];
}
