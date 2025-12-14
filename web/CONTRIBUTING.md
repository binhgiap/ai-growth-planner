# Contributing Guide

## How to Contribute

Thank you for your interest in contributing to AI Growth Planner!

---

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/ai-growth-planner.git
   ```
3. **Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

---

## Development Setup

```bash
cd web
pnpm install
pnpm dev
```

---

## Code Standards

### TypeScript
- Use strict type checking
- Avoid `any` types
- Use interfaces for props
- Document complex types

### React Components
- Use functional components
- Use hooks for state
- Keep components small
- Extract to separate files

### Styling
- Use Tailwind CSS classes
- No inline styles
- Consistent spacing
- Responsive design

### File Names
- Components: `PascalCase` (e.g., `Button.tsx`)
- Files: `kebab-case` (e.g., `api-client.ts`)
- Pages: `kebab-case` (e.g., `dashboard/page.tsx`)

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance
```

Example:
```bash
git commit -m "feat: add task filtering"
git commit -m "fix: correct progress calculation"
```

---

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Test your changes**
   ```bash
   pnpm test
   pnpm build
   ```

3. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

4. **Create a Pull Request**
   - Clear title and description
   - Reference related issues
   - Include screenshots if applicable

---

## Testing

All new features should have tests:

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

---

## Documentation

Update documentation for:
- New features
- API changes
- Configuration changes
- Breaking changes

---

## Code Review Checklist

- [ ] Code follows style guide
- [ ] TypeScript types are correct
- [ ] Tests are included
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Accessibility considered

---

## Bug Reports

Include:
- Clear title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details

---

## Feature Requests

Include:
- Clear description
- Use case
- Example implementation
- Alternative solutions

---

## Questions?

- Check documentation
- Search existing issues
- Ask in discussions
- Contact maintainers

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing! 🎉**
