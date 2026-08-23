// Pointer-event based drag & drop: works for mouse + touch + pen with one code path.
const DragController = (() => {
  const LIFT_PX = 90; // lift the ghost piece above the finger so it stays visible on touch

  function attach(pieceEl, piece, handlers) {
    let dragging = false;
    let ghostEl = null;
    let cellSize = 0;

    function pointerToOrigin(clientX, clientY) {
      const boardRect = handlers.getBoardRect();
      cellSize = boardRect.width / SIZE;
      const ghostLeft = clientX - ghostEl.offsetWidth / 2;
      const ghostTop = clientY - ghostEl.offsetHeight - LIFT_PX;
      const col = Math.round((ghostLeft - boardRect.left) / cellSize);
      const row = Math.round((ghostTop - boardRect.top) / cellSize);
      return { row, col };
    }

    function makeGhost() {
      const dims = Pieces.dimensions(piece.cells);
      const boardRect = handlers.getBoardRect();
      const size = boardRect.width / SIZE;
      const el = document.createElement('div');
      el.className = 'drag-ghost';
      el.style.width = `${dims.cols * size}px`;
      el.style.height = `${dims.rows * size}px`;
      for (const [dr, dc] of piece.cells) {
        const block = document.createElement('div');
        block.className = `block block-${piece.color}`;
        block.style.width = `${size}px`;
        block.style.height = `${size}px`;
        block.style.left = `${dc * size}px`;
        block.style.top = `${dr * size}px`;
        el.appendChild(block);
      }
      document.body.appendChild(el);
      return el;
    }

    function onPointerDown(e) {
      if (dragging) return;
      pieceEl.setPointerCapture?.(e.pointerId);
      dragging = true;
      ghostEl = makeGhost();
      pieceEl.classList.add('dragging-source');
      positionGhost(e.clientX, e.clientY);
      handlers.onDragStart(piece);
      e.preventDefault();
    }

    function positionGhost(clientX, clientY) {
      const left = clientX - ghostEl.offsetWidth / 2;
      const top = clientY - ghostEl.offsetHeight - LIFT_PX;
      ghostEl.style.left = `${left}px`;
      ghostEl.style.top = `${top}px`;
    }

    function onPointerMove(e) {
      if (!dragging) return;
      positionGhost(e.clientX, e.clientY);
      const { row, col } = pointerToOrigin(e.clientX, e.clientY);
      handlers.onDragMove(piece, row, col);
    }

    function endDrag(e, commit) {
      if (!dragging) return;
      dragging = false;
      const { row, col } = pointerToOrigin(e.clientX, e.clientY);
      ghostEl.remove();
      ghostEl = null;
      pieceEl.classList.remove('dragging-source');
      if (commit) {
        handlers.onDrop(piece, row, col);
      } else {
        handlers.onDragCancel(piece);
      }
    }

    function onPointerUp(e) {
      endDrag(e, true);
    }

    function onPointerCancel(e) {
      endDrag(e, false);
    }

    pieceEl.addEventListener('pointerdown', onPointerDown);
    pieceEl.addEventListener('pointermove', onPointerMove);
    pieceEl.addEventListener('pointerup', onPointerUp);
    pieceEl.addEventListener('pointercancel', onPointerCancel);
  }

  return { attach };
})();
