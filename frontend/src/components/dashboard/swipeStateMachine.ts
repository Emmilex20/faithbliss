export type SwipeDirection = 'left' | 'right';

export type SwipeDeckPhase = 'IDLE' | 'COMMITTING' | 'LOADING_NEXT' | 'ENTER_NEXT';

export interface SwipeDeckState {
  phase: SwipeDeckPhase;
  direction: SwipeDirection | null;
}

export type SwipeDeckEvent =
  | { type: 'START_COMMIT'; direction: SwipeDirection }
  | { type: 'EXIT_COMPLETE' }
  | { type: 'NEXT_READY' }
  | { type: 'ENTER_COMPLETE' }
  | { type: 'NO_NEXT' }
  | { type: 'RESET' };

export const INITIAL_SWIPE_DECK_STATE: SwipeDeckState = {
  phase: 'IDLE',
  direction: null,
};

export const swipeDeckReducer = (state: SwipeDeckState, event: SwipeDeckEvent): SwipeDeckState => {
  switch (event.type) {
    case 'START_COMMIT':
      if (state.phase !== 'IDLE') return state;
      return {
        phase: 'COMMITTING',
        direction: event.direction,
      };

    case 'EXIT_COMPLETE':
      if (state.phase !== 'COMMITTING') return state;
      return {
        phase: 'LOADING_NEXT',
        direction: state.direction,
      };

    case 'NEXT_READY':
      if (state.phase !== 'LOADING_NEXT') return state;
      return {
        phase: 'ENTER_NEXT',
        direction: state.direction,
      };

    case 'ENTER_COMPLETE':
      if (state.phase !== 'ENTER_NEXT') return state;
      return {
        phase: 'IDLE',
        direction: null,
      };

    case 'NO_NEXT':
      if (state.phase !== 'LOADING_NEXT') return state;
      return {
        phase: 'IDLE',
        direction: null,
      };

    case 'RESET':
      return INITIAL_SWIPE_DECK_STATE;

    default:
      return state;
  }
};

