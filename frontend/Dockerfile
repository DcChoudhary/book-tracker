FROM node:22-alpine

WORKDIR /app

# Install dependencies from the lockfile.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the frontend source code into the image.
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]