import asyncio
from websockets import serve
from asyncio import Queue
import websockets
import re
import json

q = Queue()

# Define a callback function to handle incoming WebSocket messages
async def handle_websocket(websocket):
    try:
        while True:
            message = await websocket.recv()
            json_dict = json.loads(message)
            if(json_dict['server'] == 'container'):
                json_dict['data']['cmd'] = json_dict['command']
                json_dict['data']['container'] = json_dict['container']
                print(f"Received message: {json.dumps(json_dict, indent=4)}")
                await q.put(json_dict)
            else:
                json_dict = await q.get()
                await websocket.send(json.dumps({"type": "docker", "data": json_dict}))

                cmd = ["strace", "-e", "openat", "/usr/local/bin/redis-server"]
                proc = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )

                async def reader(stream):
                    async for line in stream:
                        text = line.decode(errors="ignore")
                        print(text)
                        # Extract file path from openat() syscall
                        match = re.search(r'openat\([^,]+, "([^"]+)"', text)
                        if match:
                            await websocket.send(json.dumps({"type": "strace", "data": match.group(1)}))

                await asyncio.gather(reader(proc.stderr))

    except websockets.ConnectionClosed:
        pass

async def main():
    async with serve(handle_websocket, "", 8001) as server:
        await server.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())
