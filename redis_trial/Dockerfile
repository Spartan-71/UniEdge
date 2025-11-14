FROM redis:7.2-bookworm

RUN apt update && apt upgrade
RUN apt install -y python3 python3-pip
RUN apt install -y python3-websockets
RUN apt install -y strace
WORKDIR /src
