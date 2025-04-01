"use client"

// Inspired by react-hot-toast library
import * as React from "react";

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000; // Example: 1 second = 1000, adjust as needed

/**
 * Represents the structure of a toast object used internally by the toaster.
 * Extends base ToastProps and adds internal management properties.
 */
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Use UPPER_SNAKE_CASE for constant action type definitions
const ACTION_TYPES = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

// Use a more descriptive name for the counter
let toastCounter = 0;

/**
 * Generates a unique sequential ID for each toast.
 * @returns {string} A unique ID string.
 */
function generateToastId(): string {
  toastCounter = (toastCounter + 1) % Number.MAX_SAFE_INTEGER;
  return toastCounter.toString();
}

/** Action types available for the toast reducer. */
type ActionType = typeof ACTION_TYPES;

/** Union type representing all possible actions for the toast reducer. */
type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    }

/** Interface defining the shape of the toast state. */
interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Schedules a toast to be removed from the state after a delay.
 * Manages timeouts to prevent duplicate removal schedules.
 * @param {string} toastId - The ID of the toast to schedule for removal.
 */
const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: ACTION_TYPES.REMOVE_TOAST, // Use constant
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

/**
 * Reducer function for managing the toast state.
 * Handles adding, updating, dismissing, and removing toasts.
 * Note: Contains a side effect for scheduling toast removal on DISMISS_TOAST.
 * @param {State} state - The current toast state.
 * @param {Action} action - The action to be processed.
 * @returns {State} The new toast state.
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ACTION_TYPES.ADD_TOAST: // Use constant
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case ACTION_TYPES.UPDATE_TOAST: // Use constant
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case ACTION_TYPES.DISMISS_TOAST: { // Use constant
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case ACTION_TYPES.REMOVE_TOAST: // Use constant
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

// Use a more descriptive name for the global state
let toastMemoryState: State = { toasts: [] };

/**
 * Dispatches an action to the toast reducer and notifies all listeners.
 * @param {Action} action - The action to dispatch.
 */
function dispatch(action: Action) {
  toastMemoryState = reducer(toastMemoryState, action);
  listeners.forEach((listener) => {
    listener(toastMemoryState);
  });
}

/** Type for creating a new toast, omitting the internally generated 'id'. */
type Toast = Omit<ToasterToast, "id">;

/**
 * Creates and displays a new toast message.
 * @param {Toast} props - The properties of the toast to display (title, description, variant, etc.).
 * @returns {{ id: string; dismiss: () => void; update: (props: ToasterToast) => void }} An object containing the toast's ID and functions to dismiss or update it.
 */
function toast({ ...props }: Toast) {
  const id = generateToastId(); // Use renamed function

  const update = (props: ToasterToast) =>
    dispatch({
      type: ACTION_TYPES.UPDATE_TOAST, // Use constant
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: ACTION_TYPES.DISMISS_TOAST, toastId: id }); // Use constant

  dispatch({
    type: ACTION_TYPES.ADD_TOAST, // Use constant
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

/**
 * Custom hook to access the toast state and dispatcher functions.
 * Provides the current list of toasts, the `toast` function to add new toasts,
 * and the `dismiss` function to dismiss toasts.
 * @returns {{ toasts: ToasterToast[]; toast: (props: Toast) => { id: string; dismiss: () => void; update: (props: ToasterToast) => void }; dismiss: (toastId?: string) => void }} The toast state and action functions.
 */
function useToast() {
  const [state, setState] = React.useState<State>(toastMemoryState); // Use renamed state variable

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: ACTION_TYPES.DISMISS_TOAST, toastId }), // Use constant
  };
}

export { useToast, toast };
