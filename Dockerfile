# Dockerfile (for production)

# Stage 1: Build the Vue application
FROM node:lts-alpine AS build-stage
# ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-simple

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html/app-site
# Expose the standard HTTP port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]