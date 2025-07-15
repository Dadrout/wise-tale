FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf
# Отключаем автоматические скрипты entrypoint'а
RUN rm -rf /docker-entrypoint.d/20-envsubst-on-templates.sh 