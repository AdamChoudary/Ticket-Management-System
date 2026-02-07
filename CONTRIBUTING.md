# Contributing to AI Support Hub

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/Ticket-Management-System.git
   cd Ticket-Management-System
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Set up development environment**
   ```bash
   docker-compose up --build
   ```

4. **Make your changes**

5. **Test your changes**
   ```bash
   # Backend tests
   cd backend
   pytest tests/ -v
   
   # Frontend tests
   cd frontend
   npm test
   ```

## Development Workflow

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user authentication
fix: resolve CORS issue in production
docs: update API documentation
style: format code with black
refactor: simplify ticket processing logic
test: add integration tests for API
chore: update dependencies
```

## Coding Standards

### Backend (Python)

- **Style**: Follow [PEP 8](https://pep8.org/)
- **Formatting**: Use `black` for code formatting
  ```bash
  black app/
  ```
- **Import Sorting**: Use `isort`
  ```bash
  isort app/
  ```
- **Type Hints**: Add type hints to all functions
  ```python
  def get_ticket(ticket_id: str) -> Ticket:
      ...
  ```
- **Docstrings**: Use Google-style docstrings
  ```python
  def analyze_ticket(content: str) -> AIAnalysisResult:
      """
      Analyze a support ticket using AI.
      
      Args:
          content: The ticket content to analyze
          
      Returns:
          AIAnalysisResult with category, urgency, and sentiment
      """
  ```

### Frontend (TypeScript)

- **Style**: Follow Airbnb React/TypeScript style guide
- **Formatting**: Use Prettier
  ```bash
  npm run format
  ```
- **Linting**: Use ESLint
  ```bash
  npm run lint
  ```
- **TypeScript**: Use strict mode, avoid `any`
  ```typescript
  // ✅ Good
  interface TicketProps {
    ticket: Ticket;
    onUpdate: (id: string) => void;
  }
  
  // ❌ Bad
  function handleUpdate(data: any) {
    ...
  }
  ```

### Code Quality Checklist

Before submitting a PR:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log() statements (use logger)
- [ ] Type hints/types added
- [ ] Error handling implemented
- [ ] Security considerations addressed

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure** all tests pass
4. **Update** README.md if applicable
5. **Create Pull Request** with:
   - Clear title following conventional commits
   - Description of changes
   - Screenshots (if UI changes)
   - Link to related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented hard-to-understand areas
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Added tests
```

## Reporting Issues

### Bug Reports

Include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Docker version, browser)
- Error messages/screenshots
- Possible solution (if known)

### Feature Requests

Include:
- Clear description of the feature
- Use case/motivation
- Proposed implementation (optional)
- Alternatives considered

## Development Tips

### Backend

```bash
# Run backend without Docker
cd backend
python -m venv venv
source venv/bin/activate
pip install -e .
uvicorn app.main:app --reload

# Database migrations
alembic revision --autogenerate -m "Your message"
alembic upgrade head

# Testing
pytest tests/ -v --cov=app
```

### Frontend

```bash
# Run frontend without Docker
cd frontend
npm install
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

## Questions?

Feel free to:
- Open a GitHub Discussion
- Comment on related issues
- Reach out to maintainers

---

**Thank you for contributing!** 🎉
