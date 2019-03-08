FROM ervinne/base-php-nginx:7.2

Maintainer Ervinne Sodusta<ervinne.sodusta@nuworks.ph>

WORKDIR /var/www/vhost/app/backend/rnd/laravel-react-integration

# Install Node
RUN \
    apt-get update && \
    curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install nodejs

# Enable this site
RUN rm /etc/nginx/sites-enabled/vhost
ADD ./vhost-laravel-react-integration.conf /etc/nginx/sites-available
RUN ln -s /etc/nginx/sites-available/vhost-laravel-react-integration.conf /etc/nginx/sites-enabled/vhost-laravel-react-integration

# Expose React hot reloading candidate ports
EXPOSE 8080
EXPOSE 8000

COPY ./start.sh /
RUN chmod +x /start.sh

ENTRYPOINT ["/start.sh"]
