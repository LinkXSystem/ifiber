export default class Heapify {
  static push(heap, node) {
    let oIndex = heap.length;
    heap.push(node);

    while (true) {
      const xIndex = Math.floor((oIndex - 1) / 2);
      const x = heap[xIndex];

      if (!x || Heapify.compare(x, node) < 0) {
        break;
      }

      heap[xIndex] = node;
      heap[oIndex] = x;
      oIndex = xIndex;
    }
  }

  static compare(i, j) {
    return i.Duetime - j.DueTime;
  }

  static peek(heap) {
    return heap[0];
  }

  static pop(heap) {
    let first = heap[0];

    if (first) {
      let last = heap.pop();
      if (first !== last) {
        heap[0] = last;

        let index = 0;
        let length = heap.length;

        while (index < length) {
          let lIndex = (index + 1) * 2 - 1;
          let left = heap[lIndex];
          let rIndex = lIndex + 1;
          let right = heap[rIndex];

          if (left && Heapify.compare(left, last) < 0) {
            if (right && Heapify.compare(right, left) < 0) {
              heap[index] = right;
              heap[rIndex] = last;
              index = rIndex;
            } else {
              heap[index] = left;
              heap[lIndex] = last;
              index = lIndex;
            }
          } else if (right && Heapify.compare(right, last) < 0) {
            heap[index] = right;
            heap[rIndex] = last;
            index = right;
          } else {
            return;
          }
        }
      }

      return first;
    } else {
      return null;
    }
  }
}
