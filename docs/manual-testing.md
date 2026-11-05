# Manual Testing Procedures

## Chrome Extension: draob

### Test Steps
1. Install extension in Chrome (load unpacked from dist/)
2. Open a Miro board
3. Open popup and save a password
4. Verify password is stored and listed
5. Delete a password entry and verify removal
6. Change options and verify persistence
7. Test error handling (missing fields, duplicate entries)
8. Check CSP enforcement (no inline scripts)
9. Validate permissions (minimal required)
10. Test extension loading/unloading
11. Check cross-browser compatibility (Chrome, Edge, Firefox)

### Expected Results
- All features work as described
- No security or CSP violations
- No unnecessary permissions
- UI responds in <200ms, background in <500ms
