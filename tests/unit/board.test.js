import Board from '../../src/shared/models/Board';

describe('Board', () => {
  it('stores url and title', () => {
    const board = new Board('https://miro.com/app/board/123', 'Board Title');
    expect(board.url).toBe('https://miro.com/app/board/123');
    expect(board.title).toBe('Board Title');
  });
});
