# Use the official Nginx image from Docker Hub
FROM nginx:alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the new production configuration file from the local directory
COPY nginx-prod.conf /etc/nginx/conf.d/default.conf 