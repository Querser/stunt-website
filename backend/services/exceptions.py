class ServiceError(Exception):
    """Base class for domain/service layer errors."""


class NotFoundError(ServiceError):
    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)


class ValidationError(ServiceError):
    def __init__(self, detail: str) -> None:
        self.detail = detail
        super().__init__(detail)
