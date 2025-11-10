FROM nginx:alpine

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy custom configuration
COPY nginx.conf /etc/nginx/conf.d/api-gateway.conf

# Create cache directory
RUN mkdir -p /var/cache/nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
