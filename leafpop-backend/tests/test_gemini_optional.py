import importlib
import sys


def test_gemini_service_imports_without_google_sdk():
    blocked = [name for name in list(sys.modules) if name == "google" or name.startswith("google.")]
    for name in blocked:
        sys.modules.pop(name, None)

    sys.modules.pop("app.services.gemini_service", None)

    try:
        module = importlib.import_module("app.services.gemini_service")
    finally:
        for name in blocked:
            sys.modules.pop(name, None)

    assert hasattr(module, "get_gemini_client")
