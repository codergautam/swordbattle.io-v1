FROM node:18-alpine3.17

COPY . .

RUN npm install
RUN node setup
RUN npm run build

CMD ["npm", "start"]
