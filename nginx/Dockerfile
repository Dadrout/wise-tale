FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf.template
# Создаем кастомный entrypoint скрипт
RUN echo '#!/bin/sh' > /docker-entrypoint-custom.sh && \
    echo 'envsubst '"'"'${API_KEY}'"'"' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf' >> /docker-entrypoint-custom.sh && \
    echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint-custom.sh && \
    chmod +x /docker-entrypoint-custom.sh
CMD ["/docker-entrypoint-custom.sh"] 