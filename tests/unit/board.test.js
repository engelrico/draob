const Board = require('../../src/models/Board');

describe('Board', () => {
  it('should create a board entity', () => {
    const board = new Board('https://miro.com/app/board/123', 'Board Title');
    expect(board.url).toBe('https://miro.com/app/board/123');
    expect(board.title).toBe('Board Title');
  });
});
