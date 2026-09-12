"""
Standardized application errors. Every API returns errors in the shape:

{
  "success": false,
  "error": {
    "code": "INVALID_FILE",
    "message": "..."
  }
}
"""
from fastapi import status


class AppError(Exception):
    """Base application error carrying an error code + HTTP status."""

    code: str = "INTERNAL_ERROR"
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR

    def __init__(self, message: str, code: str | None = None, status_code: int | None = None):
        self.message = message
        if code:
            self.code = code
        if status_code:
            self.status_code = status_code
        super().__init__(message)

    def to_dict(self) -> dict:
        return {"success": False, "error": {"code": self.code, "message": self.message}}


class InvalidFileError(AppError):
    code = "INVALID_FILE"
    status_code = status.HTTP_400_BAD_REQUEST


class FileTooLargeError(AppError):
    code = "FILE_TOO_LARGE"
    status_code = status.HTTP_400_BAD_REQUEST


class InvalidAudioError(AppError):
    code = "INVALID_AUDIO"
    status_code = status.HTTP_400_BAD_REQUEST


class LeafNotFoundError(AppError):
    code = "LEAF_NOT_FOUND"
    status_code = status.HTTP_404_NOT_FOUND


class PopNotFoundError(AppError):
    code = "POP_NOT_FOUND"
    status_code = status.HTTP_404_NOT_FOUND


class AnalysisFailedError(AppError):
    code = "ANALYSIS_FAILED"
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY


class PopNotDetectedError(AppError):
    code = "POP_NOT_DETECTED"
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY


class UserNotFoundError(AppError):
    code = "USER_NOT_FOUND"
    status_code = status.HTTP_404_NOT_FOUND


class UnauthorizedError(AppError):
    code = "UNAUTHORIZED"
    status_code = status.HTTP_401_UNAUTHORIZED


class DatabaseError(AppError):
    code = "DATABASE_ERROR"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR


class StorageError(AppError):
    code = "STORAGE_ERROR"
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR


class RateLimitError(AppError):
    code = "RATE_LIMITED"
    status_code = status.HTTP_429_TOO_MANY_REQUESTS


class DuplicateSubmissionError(AppError):
    code = "DUPLICATE_SUBMISSION"
    status_code = status.HTTP_409_CONFLICT
