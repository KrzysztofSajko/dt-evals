"""Shared OTel TracerProvider setup for Dynatrace OTLP export."""

from __future__ import annotations

import logging
import warnings

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

from dt_ai_ingest.auth import make_auth_header

logger = logging.getLogger(__name__)

# Track the parameters used for the initial configuration so we can warn
# if a subsequent call uses different values.
_configured_params: dict[str, str] | None = None


def _reset_configured_params() -> None:
    """Reset module-level state (for testing only)."""
    global _configured_params  # noqa: PLW0603
    _configured_params = None


def configure_tracing(
    dt_endpoint: str,
    dt_access_token: str,
    *,
    service_name: str = "dt-ai-ingest",
) -> TracerProvider:
    """Set up OTel tracing that exports to Dynatrace OTLP.

    **Idempotent:** If this function has already been called and a
    ``TracerProvider`` created by this library is registered globally,
    the *same* provider is returned without adding duplicate processors.

    If called again with **different** ``dt_endpoint`` or
    ``dt_access_token``, a :class:`UserWarning` is emitted and the
    original provider is returned unchanged.  This protects notebook
    users who accidentally re-run a cell from silently orphaning
    providers.

    If a ``TracerProvider`` was set up *externally* (not by this library),
    a new ``BatchSpanProcessor`` is added to it — the existing provider
    is never replaced.

    Args:
        dt_endpoint:      Base URL, e.g. ``https://<env-id>.live.dynatrace.com``
        dt_access_token:  DT access token.
        service_name:     ``service.name`` resource attribute (used only if
                          creating a new provider).

    Returns:
        The ``TracerProvider`` (existing or newly created).
    """
    global _configured_params  # noqa: PLW0603

    normalised_endpoint = dt_endpoint.rstrip("/")
    otlp_endpoint = f"{normalised_endpoint}/api/v2/otlp/v1/traces"

    current = trace.get_tracer_provider()

    # --- Fast path: we already configured a provider in a previous call ---
    if _configured_params is not None and isinstance(current, TracerProvider):
        changed: list[str] = []
        if _configured_params["dt_endpoint"] != normalised_endpoint:
            changed.append("dt_endpoint")
        if _configured_params["dt_access_token"] != dt_access_token:
            changed.append("dt_access_token")
        if _configured_params["service_name"] != service_name:
            changed.append("service_name")

        if changed:
            warnings.warn(
                f"configure_tracing() already called with different "
                f"{', '.join(changed)}. Returning existing TracerProvider. "
                f"Call is a no-op to avoid orphaned providers.",
                UserWarning,
                stacklevel=2,
            )
        else:
            logger.debug("configure_tracing() already configured — returning existing provider.")

        return current

    # --- A TracerProvider exists but was NOT created by us ---
    if isinstance(current, TracerProvider):
        exporter = OTLPSpanExporter(
            endpoint=otlp_endpoint,
            headers={"Authorization": make_auth_header(dt_access_token)},
        )
        current.add_span_processor(BatchSpanProcessor(exporter))
        _configured_params = {
            "dt_endpoint": normalised_endpoint,
            "dt_access_token": dt_access_token,
            "service_name": service_name,
        }
        return current

    # --- No SDK provider yet — create one ---
    exporter = OTLPSpanExporter(
        endpoint=otlp_endpoint,
        headers={"Authorization": make_auth_header(dt_access_token)},
    )
    resource = Resource.create({"service.name": service_name})
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)

    _configured_params = {
        "dt_endpoint": normalised_endpoint,
        "dt_access_token": dt_access_token,
        "service_name": service_name,
    }
    return provider
