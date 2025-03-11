FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Build the production version
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
