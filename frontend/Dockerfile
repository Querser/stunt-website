FROM node:20-alpine

WORKDIR /app
ARG NEXT_PUBLIC_API_URL=/api/v1
ARG INTERNAL_API_URL=http://backend:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL

RUN chown node:node /app
USER node

COPY --chown=node:node package.json package-lock.json* ./
RUN npm ci

COPY --chown=node:node . .
RUN npm run build

CMD ["npm", "start"]
