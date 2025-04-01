# Project Coding Style Guide

This document outlines the coding style, naming conventions, and commenting standards for the Digital Learning Platform project. Adhering to these guidelines ensures consistency, readability, and maintainability across the codebase.

## 1. Base Style Guide

We adopt the principles of the **Airbnb JavaScript Style Guide** ([https://github.com/airbnb/javascript](https://github.com/airbnb/javascript)) as the foundation for our coding practices, adapted for TypeScript where applicable.

While we rely on the built-in `next lint` (ESLint) for basic checks, developers should familiarize themselves with the Airbnb guide's core concepts.

*(Recommendation: Consider integrating Prettier in the future for automated formatting consistent with these guidelines.)*

## 2. Naming Conventions

Consistent naming is crucial for understanding the codebase.

*   **Variables & Functions:** Use `camelCase`.
    *   Examples: `let userData;`, `const itemCount = 0;`, `function calculateTotal(items) { ... }`
*   **Constants:**
    *   True constants (unchanging config values, magic numbers/strings): Use `UPPER_SNAKE_CASE`.
        *   Examples: `const MAX_RETRIES = 3;`, `const API_ENDPOINT = '/api/v1';`
    *   Immutable bindings (function expressions, imported modules, etc.): Use `camelCase` or `PascalCase` as appropriate for the entity type.
        *   Examples: `const logger = createLogger();`, `const UserSchema = z.object({...});`
*   **Classes, Interfaces, Types, Enums:** Use `PascalCase`.
    *   Examples: `class UserService { ... }`, `interface IUserProfile { ... }`, `type ApiResponse = { ... }`, `enum OrderStatus { Pending, Shipped }`
*   **React Components (Function & Class):** Use `PascalCase`.
    *   Examples: `function UserProfileCard(props) { ... }`, `class SettingsDialog extends React.Component { ... }`
*   **File Naming:**
    *   React Components (`.tsx`): `PascalCase.tsx` (e.g., `UserProfile.tsx`, `DataTable.tsx`)
    *   Non-component TypeScript/JavaScript (`.ts`, `.js`, `.mjs`): `kebab-case.ts` (e.g., `data-service.ts`, `auth-utils.js`)
    *   Style files (`.css`): `kebab-case.css` (e.g., `global-styles.css`)
    *   Test files: Follow the pattern of the file being tested, adding a suffix like `.test.ts` or `.spec.ts` (e.g., `data-service.test.ts`, `UserProfile.spec.tsx`)
    *   Configuration files: Use standard names (e.g., `next.config.mjs`, `tailwind.config.js`)

## 3. Commenting Standards

Comments should clarify the *why*, not just the *what*.

*   **JSDoc (`/** ... */`):** Use for all exported functions, classes, types, and interfaces. Describe purpose, parameters (`@param`), return values (`@returns`), and thrown errors (`@throws`) where applicable.
    ```typescript
    /**
     * Fetches user data from the API.
     * @param userId - The ID of the user to fetch.
     * @returns A promise resolving to the user's profile data.
     * @throws If the user is not found or the API request fails.
     */
    async function fetchUserData(userId: string): Promise<IUserProfile> {
      // ... implementation ...
    }
    ```
*   **Inline Comments (`//`):** Use sparingly for complex logic, workarounds, or non-obvious decisions within function bodies. Avoid redundant comments.
    ```typescript
    // Calculate discount based on user tier (complex logic)
    const discount = calculateTierDiscount(user.tier);
    total *= (1 - discount); // Apply discount
    ```
*   **Action Items:** Use standard prefixes:
    *   `// TODO: Description of task` - For planned features or refactoring.
    *   `// FIXME: Description of issue` - For known bugs needing correction.

## 4. Code Formatting

*   **Primary Tool:** Rely on the existing ESLint setup (`next lint`) for basic formatting (indentation, spacing, quotes, etc.).
*   **Line Length:** Aim for a maximum line length of **120 characters** to enhance readability. Configure linters/formatters accordingly if/when implemented.

---
*This guide is a living document and may be updated as the project evolves.*