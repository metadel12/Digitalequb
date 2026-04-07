import os
import platform
import sys

import uvicorn


def main() -> None:
    os.environ.setdefault("WATCHFILES_FORCE_POLLING", "true")
    is_problematic_reload_env = platform.system() == "Windows" and sys.version_info >= (3, 13)
    enable_reload = os.environ.get("DIGIEQUB_ENABLE_RELOAD", "").strip().lower() in {"1", "true", "yes", "on"}
    port = int(os.environ.get("DIGIEQUB_PORT", "8001"))
    reload_enabled = False if is_problematic_reload_env else enable_reload

    if is_problematic_reload_env:
        print("Starting DigiEqub backend in stable mode (reload disabled on Windows/Python 3.13).")
        if enable_reload:
            print("Ignoring DIGIEQUB_ENABLE_RELOAD=true because reload is unstable in this environment.")
    elif not enable_reload:
        print("Starting DigiEqub backend with reload disabled.")
        print("Set DIGIEQUB_ENABLE_RELOAD=true if you want auto-reload.")
    else:
        print("Starting DigiEqub backend with auto-reload enabled.")
    print(f"Using port {port}")

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=port,
        reload=reload_enabled,
        reload_dirs=["app"] if reload_enabled else None,
    )


if __name__ == "__main__":
    main()
