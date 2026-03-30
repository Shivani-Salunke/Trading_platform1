# Use an official Nginx image as the base
FROM nginx:alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the static website files to the Nginx public directory
# We copy index.html and the entire src directory
COPY index.html /usr/share/nginx/html/
COPY src /usr/share/nginx/html/src

# Expose port 80
EXPOSE 80

# The command to run when the container starts
CMD ["nginx", "-g", "daemon off;"]
