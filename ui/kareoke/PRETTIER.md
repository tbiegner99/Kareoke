# Prettier Configuration

This project uses Prettier for consistent code formatting across the codebase.

## Configuration

- **.prettierrc.json**: Main Prettier configuration
- **.prettierignore**: Files and directories to exclude from formatting
- **.vscode/settings.json**: VS Code settings for automatic formatting

## Available Scripts

```bash
# Format all files
npm run format

# Check if files are properly formatted
npm run format:check

# Format staged files (used in pre-commit hooks)
npm run format:staged
```

## Rules

- **Semi-colons**: Required
- **Quotes**: Single quotes for strings, single quotes for JSX
- **Print Width**: 80 characters
- **Tab Width**: 2 spaces
- **Trailing Commas**: ES5 compatible
- **Bracket Spacing**: Enabled
- **Arrow Parens**: Avoid when possible
- **End of Line**: LF (Unix style)

## VS Code Integration

The project includes VS Code settings that:

- Format files on save
- Run ESLint fixes on save
- Use Prettier as the default formatter for supported file types

## Pre-commit Hooks

The project is configured with lint-staged to automatically format files before committing (when in a git repository).
