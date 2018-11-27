FROM node:11.3.0

ARG GITHUB_TOKEN
ARG PR_NUMBER
ENV TARGET_DIR ../terraform/definitions

WORKDIR /usr/src/app

ADD ./package.json .
ADD ./package-lock.json .
ADD ./src/ .
ADD TARGET_DIR ./definitions

RUN npm install --production
CMD [ "npm", "start" ]
