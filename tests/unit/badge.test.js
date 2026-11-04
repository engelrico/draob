import { handleMessage, BADGE_TEXT } from '../../src/background/badge';
import { BOARD_DETECTED } from '../../src/shared/messages';

const fakeAction = () => ({
  setBadgeText: jest.fn(),
  setBadgeBackgroundColor: jest.fn(),
  setTitle: jest.fn(),
});

describe('badge handler', () => {
  it('marks the sender tab when a board is detected', () => {
    const action = fakeAction();
    expect(handleMessage({ type: BOARD_DETECTED }, { tab: { id: 7 } }, action)).toBe(true);
    expect(action.setBadgeText).toHaveBeenCalledWith({ tabId: 7, text: BADGE_TEXT });
    expect(action.setBadgeBackgroundColor).toHaveBeenCalledWith(
      expect.objectContaining({ tabId: 7 }),
    );
    expect(action.setTitle).toHaveBeenCalledWith(expect.objectContaining({ tabId: 7 }));
  });

  it('ignores unknown messages and senders without a tab', () => {
    const action = fakeAction();
    expect(handleMessage({ type: 'other' }, { tab: { id: 1 } }, action)).toBe(false);
    expect(handleMessage({ type: BOARD_DETECTED }, {}, action)).toBe(false);
    expect(handleMessage(undefined, { tab: { id: 1 } }, action)).toBe(false);
    expect(action.setBadgeText).not.toHaveBeenCalled();
  });
});
