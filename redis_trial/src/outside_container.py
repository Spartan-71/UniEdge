import asyncio
from websockets.asyncio.client import connect
import json
import subprocess
import argparse

async def handler(cmd: str, container: str):
    async with connect("ws://localhost:8001") as websocket:  # noqa: F821
        d = {}
        d["server"] = "container"
        d["command"] = cmd
        d["container"] = container

        op = subprocess.run(['docker', 
                             'inspect', 
                             '-f',
                             'json',
                             container], stdout=subprocess.PIPE).stdout.decode('utf-8')
        d["data"] = json.loads(op)[0]
        await websocket.send(json.dumps(d))
        while True:
            data = await websocket.recv()
            print(json.loads(data))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("-c", "--command",   help="Command to trace", required=True)
    parser.add_argument("-k", "--container", help="Container to inspect", required=True)
    args = parser.parse_args()
    asyncio.run(handler(args.command, args.container))
