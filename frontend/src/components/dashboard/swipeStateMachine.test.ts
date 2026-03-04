import {
  INITIAL_SWIPE_DECK_STATE,
  swipeDeckReducer,
  type SwipeDeckEvent,
  type SwipeDeckPhase,
} from './swipeStateMachine';

interface TransitionCase {
  name: string;
  events: SwipeDeckEvent[];
  expectedPhase: SwipeDeckPhase;
}

const transitionCases: TransitionCase[] = [
  {
    name: 'like commit success path',
    events: [
      { type: 'START_COMMIT', direction: 'right' },
      { type: 'EXIT_COMPLETE' },
      { type: 'NEXT_READY' },
      { type: 'ENTER_COMPLETE' },
    ],
    expectedPhase: 'IDLE',
  },
  {
    name: 'pass commit success path',
    events: [
      { type: 'START_COMMIT', direction: 'left' },
      { type: 'EXIT_COMPLETE' },
      { type: 'NEXT_READY' },
      { type: 'ENTER_COMPLETE' },
    ],
    expectedPhase: 'IDLE',
  },
  {
    name: 'loading next with no result returns to idle',
    events: [
      { type: 'START_COMMIT', direction: 'left' },
      { type: 'EXIT_COMPLETE' },
      { type: 'NO_NEXT' },
    ],
    expectedPhase: 'IDLE',
  },
  {
    name: 'double commit while committing is ignored',
    events: [
      { type: 'START_COMMIT', direction: 'right' },
      { type: 'START_COMMIT', direction: 'left' },
      { type: 'EXIT_COMPLETE' },
      { type: 'NEXT_READY' },
      { type: 'ENTER_COMPLETE' },
    ],
    expectedPhase: 'IDLE',
  },
];

export const runSwipeStateMachineDecisionTests = (): { passed: number; total: number } => {
  let passed = 0;

  for (const testCase of transitionCases) {
    const finalState = testCase.events.reduce(swipeDeckReducer, INITIAL_SWIPE_DECK_STATE);
    if (finalState.phase !== testCase.expectedPhase) {
      throw new Error(
        `[SwipeStateMachine] ${testCase.name} failed: expected ${testCase.expectedPhase}, got ${finalState.phase}`
      );
    }
    passed += 1;
  }

  return { passed, total: transitionCases.length };
};

export const swipeStateMachineTransitionCases = transitionCases;

