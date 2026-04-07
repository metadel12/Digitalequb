# DigiEqub Backend

A FastAPI-based backend for the DigiEqub application, which manages Equb groups (rotating savings and credit associations) with user management, transactions, notifications, and wallet flows.

## Features

- **User Management**: Registration, authentication, profile management
- **Equb Groups**: Create and manage Equb groups with members
- **Transactions**: Handle contributions, payouts, and transaction history
- **Notifications**: Email and SMS notifications for important events
- **Authentication**: JWT-based authentication with OTP verification
- **Database**: PostgreSQL via SQLAlchemy
- **Background Tasks**: Celery for email/SMS sending and other async tasks

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **PostgreSQL**: Relational database for users, groups, wallet, and transaction data
- **JWT**: JSON Web Tokens for authentication
- **OTP**: One-time password verification
- **Email**: SMTP for email notifications
- **SMS**: Twilio for SMS notifications
- **Celery**: Distributed task queue for background jobs
- **Redis**: Message broker for Celery
- **Pydantic**: Data validation and settings management

## Installation

1. **Clone the repository** (if applicable) and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in the required values (database URI, secrets, API keys, etc.)

5. **Start PostgreSQL** and make sure `DATABASE_URL` in `.env` points to it:
   ```bash
   postgresql://digiequb_user:secure_password@localhost:5432/digiequb_db
   ```

6. **Run the application**:
   ```bash
   uvicorn app.main:app --reload
   ```

   On Windows, if `uvicorn --reload` shows intermittent `KeyboardInterrupt` traces from the reloader subprocess, use:
   ```bash
   python run_dev.py
   ```
   On Windows with Python 3.13, this launcher now defaults to a stable mode with reload disabled to avoid the watchfiles subprocess crash.
   If you still want to try auto-reload, run:
   ```bash
   set DIGIEQUB_ENABLE_RELOAD=true
   python run_dev.py
   ```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation powered by Swagger UI.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app instance and configuration
│   ├── config.py            # Application settings
│   ├── database.py          # MongoDB connection
│   ├── dependencies.py      # Dependency injection functions
│   ├── models/              # Pydantic models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── equb.py
│   │   ├── transaction.py
│   │   └── notification.py
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── equbs.py
│   │   ├── transactions.py
│   │   └── notifications.py
│   ├── services/            # Business logic services
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── email_service.py
│   │   ├── sms_service.py
│   │   └── otp_service.py
│   └── utils/               # Utility functions
│       ├── __init__.py
│       ├── security.py
│       └── helpers.py
├── tests/                   # Unit and integration tests
│   ├── __init__.py
│   └── test_main.py
├── scripts/                 # Utility scripts
│   └── __init__.py
├── requirements.txt         # Python dependencies
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black .
flake8
```

### Background Tasks

To run Celery worker for background tasks:

```bash
celery -A app.tasks worker --loglevel=info
```

## Environment Variables

See `.env` for the active local configuration and `.env.example` for the older reference template. Key variables include:

- Database connection strings
- JWT secrets
- Email/SMS service credentials
- Admin credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
