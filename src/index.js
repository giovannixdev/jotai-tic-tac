// This was forked and migrated to jotai from https://codesandbox.io/s/valtio-tic-tac-forked-7bzu4?file=/src/index.js
import React, { useDebugValue } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";
import { atom, useAtom, Provider } from "jotai";
// import { useAtomDevtools } from "jotai/devtools";
import { useAtomDevtools } from "jotai/devtools";

const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]] // prettier-ignore

// const { useAtomic, Atomic } = window._ATOMIC_DEVTOOLS_EXTENSION__;

const squaresAtom = atom(Array(9).fill(null));
// squaresAtom.debugLabel = "squaresAtom"

const nextValueAtom = atom((get) =>
  get(squaresAtom).filter((r) => r === "O").length ===
  get(squaresAtom).filter((r) => r === "X").length
    ? "X"
    : "O"
);

const winnerAtom = atom((get) => {
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      get(squaresAtom)[a] &&
      get(squaresAtom)[a] === get(squaresAtom)[b] &&
      get(squaresAtom)[a] === get(squaresAtom)[c]
    )
      return get(squaresAtom)[a];
  }
  return null;
});

const resetSquaresAtom = atom(null, (_get, set) =>
  set(squaresAtom, Array(9).fill(null))
);

const selectSquareAtom = atom(
  (get) => get(squaresAtom),
  (get, set, square) => {
    if (get(winnerAtom) || get(squaresAtom)[square]) return;
    set(
      squaresAtom,
      get(squaresAtom).map((sqr, sqrIndex) =>
        sqrIndex === square ? get(nextValueAtom) : sqr
      )
    );
  }
);
const statusAtom = atom((get) => {
  return get(winnerAtom)
    ? `Winner: ${get(winnerAtom)}`
    : get(squaresAtom).every(Boolean)
    ? `Scratch`
    : `Next player: ${get(nextValueAtom)}`;
});

const useDebugAtom = (atom, name) => {
  atom.debugLabel = name;
  const dependents = "somehow";
  useDebugValue(atom, () => name);
};

function Squares({ i }) {
  useAtomDevtools(selectSquareAtom, "selectSquareAtom");

  const [squares, selectSquare] = useAtom(selectSquareAtom);

  useDebugAtom(selectSquareAtom, "selectSquareAtom");
  useDebugAtom(resetSquaresAtom, "resetSquaresAtom");

  return (
    <>
      {squares.map((el, i) => (
        <button className={`square ${el}`} onClick={() => selectSquare(i)}>
          {el}
        </button>
      ))}
    </>
  );
}

function Status() {
  useAtomDevtools(statusAtom, "statusAtom");
  useAtomDevtools(resetSquaresAtom, "resetSquaresAtom");

  const [gameStatus] = useAtom(statusAtom);
  const [, reset] = useAtom(resetSquaresAtom);

  return (
    <div className="status">
      <div className="message">{gameStatus}</div>
      <button onClick={() => reset()}>Reset</button>
    </div>
  );
}

function End() {
  useAtomDevtools(winnerAtom, "winnerAtom");

  const { width, height } = useWindowSize();
  const [gameWinner] = useAtom(winnerAtom);
  return (
    gameWinner && (
      <Confetti
        width={width}
        height={height}
        colors={[gameWinner === "X" ? "#d76050" : "#509ed7", "white"]}
      />
    )
  );
}

ReactDOM.render(
  <Provider>
    <div className="game">
      <h1>
        x<span>o</span>x<span>o</span>
      </h1>
      <Status />
      <div className="board">
        <Squares />
      </div>
    </div>
    <End />
  </Provider>,
  document.getElementById("root")
);
