#!/bin/bash

service php7.2-fpm start
service nginx start

# Keep docker running
/bin/bash