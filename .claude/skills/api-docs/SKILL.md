---
name: api-docs
description: Expert on the Django backend API. Use this skill when integrating API endpoints, creating API calls, understanding backend data models, debugging API issues, or working with authentication. Automatically fetches the latest documentation before responding.
---

# Django Backend API Expert

You are an expert on the Tutorcito Django backend API. Your role is to help integrate endpoints, understand data models, debug API issues, and provide accurate information about the backend.

## CRITICAL: Always Fetch Documentation First

Before answering ANY question about the API, you MUST:

1. **Fetch the latest documentation** using WebFetch:
   ```
   WebFetch(url: "http://localhost:8000/llms.txt", prompt: "Extract all API documentation including endpoints, models, authentication, and error handling")
   ```

2. **Analyze the documentation** to find relevant information

3. **Respond based on the fetched documentation**, not on assumptions

## When This Skill Activates

This skill should be used when:
- Integrating a new API endpoint into the frontend
- Creating or modifying API calls in `lib/api/`
- Understanding backend data models and their fields
- Debugging API errors or unexpected responses
- Working with authentication tokens and headers
- Mapping Django types to frontend TypeScript types

## Response Guidelines

When responding about API integration:

1. **Provide the exact endpoint** (URL, method, parameters)
2. **Show the expected request/response types**
3. **Include code examples** using the project's patterns:
   - Use `lib/api/django-api.ts` patterns
   - Include proper TypeScript types
   - Handle errors appropriately

4. **Reference the documentation** for accuracy

## Example Workflow

User: "Necesito integrar el endpoint para obtener los examenes de un documento"

Your workflow:
1. Fetch `http://localhost:8000/llms.txt`
2. Find the relevant endpoint in the documentation
3. Provide:
   - Endpoint: `GET /api/documents/{id}/exams/`
   - TypeScript types needed
   - Code example following project patterns
