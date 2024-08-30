import { useCallback, useEffect, useRef, useState } from "react";

export const useStateWithCallback = (initialState) => {
  const [state, setState] = useState(initialState);
  const cbRef = useRef();

  const updateState = useCallback((newState, cb) => {
    cbRef.current = typeof cb === "function" ? cb : null;
    setState((prev) => {
      return typeof newState === "function" ? newState(prev) : newState;
    });
  }, []);

  useEffect(() => {
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = null; // Clear the ref after invoking the callback
    }
  }, [state]);

  return [state, updateState];
};
