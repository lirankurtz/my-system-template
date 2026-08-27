# Claude Code Guidelines

## Planning

- full plan by agents is in AGENTS.MD. read it for context

## Generating Code

- Work with git workstreams and stacked commits
- Write readable, clear code. Clarity over cleverness.
- Keep code changes commit-size and review-friendly
- Suggest refactors when you spot a clear improvement, but don't refactor speculatively
- Don't over-engineer: keep solutions simple and direct. Add complexity only when the problem actually demands it.

## Testing

- Add tests for every change, run and iterate until stable
- Run all tests before asking to commit
- `npm test` runs every `*.test.ts` file under `src/test/`
- Tests use the minimal harness in `src/test-harness.ts` (`assert`, `test`, `summarize`) — no external test framework
- Exits non-zero if any test fails

## Committing

- Only suggest committing if tests pass
- Do not commit without approval
