FROM docker.n8n.io/n8nio/n8n:latest

# Set timezone
ENV GENERIC_TIMEZONE=Africa/Porto-Novo
ENV TZ=Africa/Porto-Novo

# n8n settings
ENV N8N_HOST=0.0.0.0
ENV N8N_PORT=5678
ENV N8N_PROTOCOL=http
ENV WEBHOOK_URL=https://prospio-n8n.up.railway.app
ENV N8N_EDITOR_FRONTEND_STACK_PREVIEW=true

# Enable community nodes
ENV N8N_COMMUNITY_PACKAGES_ENABLED=true

# Disable telemetry
ENV N8N_DIAGNOSTICS_ENABLED=false

# Execution settings
ENV EXECUTIONS_DATA_PRUNE=true
ENV EXECUTIONS_DATA_MAX_AGE=168
ENV EXECUTIONS_DATA_PRUNE_TIMEOUT=3600

EXPOSE 5678

CMD ["n8n", "start"]
