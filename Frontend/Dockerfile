FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

# Run Vite dev server (accessible on 0.0.0.0)
CMD ["npm", "run", "dev"]
