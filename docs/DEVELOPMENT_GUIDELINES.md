# Development Guidelines

## User Preferences
- **Voice Input:** Primary input method when available
- **Concise Output:** ~6 lines max for web interfaces due to screen zoom
- **Command Execution:** Use "run command" button, no direct terminal access
- **File Operations:** Provide complete file replacements, not partial edits
- **Development Environment:** All development and testing is done in a public cloud shell. No local development or testing on `localhost`.

## Version Control
- **Repository:** The project is hosted on GitHub at https://github.com/Thoughtless2025/thoughtless-v2.git
- **Workflow:** As the sole developer, the user prefers frequent `add`, `commit`, and `push` operations. Git is used primarily as a persistence layer to safeguard against cloud shell downtime, rather than for complex version control.
