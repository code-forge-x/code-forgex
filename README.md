# Template Management System

A robust template management system for code generation, specifically designed for trading strategies and indicators. This system allows users to create, manage, and version control code templates with parameter validation and dependency management.

## Features

- Template creation and management
- Version control for templates
- Parameter validation and type checking
- Dependency management
- Code generation with parameter substitution
- Role-based access control
- API rate limiting and security
- Comprehensive test coverage

## Prerequisites

- Node.js >= 14.0.0
- MongoDB >= 4.0.0
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/template-management.git
cd template-management
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/template-management
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Templates

- `POST /api/templates` - Create a new template
- `GET /api/templates` - Get all templates (with filtering)
- `GET /api/templates/:id` - Get a specific template
- `PUT /api/templates/:id` - Update a template
- `DELETE /api/templates/:id` - Delete a template
- `GET /api/templates/:id/versions` - Get template versions
- `GET /api/templates/:id/versions/:version` - Get specific version
- `POST /api/templates/:id/generate` - Generate code from template

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Seeding the Database

To seed the database with sample templates:
```bash
npm run seed
```

## Project Structure

```
template-management/
├── server/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── templates/       # Sample templates
│   ├── tests/           # Test files
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Security

- JWT-based authentication
- Role-based access control
- API rate limiting
- Input validation
- Helmet for security headers
- CORS configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
