import { ROOT, DELETE, HOOK, UPDATE, HOST } from './constants';
import { shouleYeild, scheduleCallback } from './scheduler';
import { isFunc } from './utils';
import { updateElement } from './dom';

let WIP;
let PreCommit;

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
  WIP = fiber;
  scheduleCallback(performWork);
}

function performWork(didout) {
  while (WIP && (!shouleYeild() || didout)) {
    WIP = performWIP(WIP);
  }

  if (PreCommit) {
    commitWork(PreCommit);
    return null;
  }
}

function getParentNode(fiber) {
  while ((fiber = fiber.parent)) {
    if (fiber.tag < HOOK) return fiber.node;
  }
}

function updateHOOK(WIP) {}
function updateHOST(WIP) {}

function performWIP(WIP) {
  WIP.patches = WIP.patches || [];
  WIP.parentNode = getParentNode(WIP);
  WIP.tag = HOOK ? updateHOOK(WIP) : updateHOST(WIP);

  if (WIP.child) return WIP.child;

  while (WIP) {
    completeWork(WIP);
    if (WIP.sibing && WIP.lock == null) {
      return WIP.sibing;
    }
    WIP = WIP.parent;
  }
}

function hashfy(arr) {
  return [];
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
    }
  }
}

function shoulePlace(fiber) {
  let { parent } = fiber;
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
      let after = point ? point.nextSibing : parent.firstChild;

      if (after === dom) return;
      if (after === null && dom === parent.lastChild) return;
      parent.insertBefore(dom, after);
    }
  }

  if (ref) {
    isFunc(ref) ? ref(dom) : (ref.current = dom);
  }

  fiber.patches = fiber.parent.patches = [];
}
