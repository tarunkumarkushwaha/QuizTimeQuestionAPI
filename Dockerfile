FROM node:22-alpine

WORKDIR /usr/src/app

# Copy backend 
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Expose your Express port port)
EXPOSE 3000

CMD ["npm", "start"]